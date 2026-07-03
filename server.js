const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const twilio = require("twilio");

const app = express();
app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const otpTimeStore = {};
const otpVerifiedStore = {};
const OTP_EXPIRY_MS = 2 * 60 * 1000;

// ================= DATABASE =================
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB Atlas Connected"))
.catch(err => console.log("MongoDB Error:", err));

// ================= USER SCHEMA =================
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", UserSchema);

// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
    const { name, phone, email, password } = req.body;

    try {
        const existingUser = await User.findOne({
            $or: [
                { email },
                { phone },
                { name }
            ]
        });

        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exists"
            });
        }

        const user = new User({
            name,
            phone,
            email,
            password
        });

        await user.save();

        res.json({
            success: true,
            message: "User Registered Successfully"
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });

        if (user) {
            res.json({
                success: true,
                message: "Login Successful",
                user: {
                    name: user.name,
                    phone: user.phone,
                    email: user.email
                }
            });
        } else {
            res.json({
                success: false,
                message: "Invalid Email or Password"
            });
        }

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});
// ================= SIGNUP OTP =================
app.post("/send-signup-otp", async (req, res) => {
    try {
        const { phone } = req.body;

        // Check if phone is already registered
        const existingUser = await User.findOne({ phone });

        if (existingUser) {
            return res.json({
                success: false,
                message: "Phone number already registered"
            });
        }

        // Send OTP using Twilio Verify
        await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications.create({
                to: "+91" + phone,
                channel: "sms"
            });

        otpTimeStore[phone] = Date.now();

        res.json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
});

// ================= SEND OTP SMS ONLY =================
app.post("/send-otp", async (req, res) => {
    try {
        const { phone } = req.body;

        const user = await User.findOne({ phone });

        if (!user) {
            return res.json({
                success: false,
                message: "Phone number not registered"
            });
        }

        await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications.create({
                to: "+91" + phone,
                channel: "sms"
            });

        otpTimeStore[phone] = Date.now();

        res.json({
            success: true,
            message: "OTP sent successfully by SMS"
        });

    } catch (error) {
        console.log("Twilio Error:", error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
});

// ================= VERIFY OTP =================
app.post("/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const verificationCheck = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks.create({
                to: "+91" + phone,
                code: otp
            });

        if (verificationCheck.status === "approved") {
            otpVerifiedStore[phone] = true;

            return res.json({
                success: true,
                message: "OTP Verified Successfully"
            });
        }

        res.json({
            success: false,
            message: "Invalid OTP"
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

// ================= RESET PASSWORD =================
app.post("/reset-password", async (req, res) => {
    try {
        const { phone, newPassword } = req.body;

        if (!otpTimeStore[phone]) {
            return res.json({
                success: false,
                message: "Please click Send OTP first"
            });
        }

        if (Date.now() - otpTimeStore[phone] > OTP_EXPIRY_MS) {
            delete otpTimeStore[phone];

            return res.json({
                success: false,
                message: "OTP expired. Please click Send OTP again."
            });
        }

        if (!otpVerifiedStore[phone]) {
            return res.json({
                success: false,
                message: "Please verify OTP first"
            });
        }

        await User.updateOne(
            { phone },
            { password: newPassword }
        );

        delete otpVerifiedStore[phone];
        delete otpTimeStore[phone];

        res.json({
            success: true,
            message: "Password Changed Successfully"
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

// ================= HOME PAGE =================
app.post("/update-profile", async (req, res) => {
    try {
        const { oldEmail, name, email } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { email: oldEmail },
            { name, email },
            { new: true }
        );

        if (!updatedUser) {
            return res.json({
                success:false,
                message:"User not found"
            });
        }

        res.json({
            success:true,
            message:"Profile Updated Successfully",
            user:{
                name:updatedUser.name,
                email:updatedUser.email,
                phone:updatedUser.phone
            }
        });

    } catch (error) {
        res.json({
            success:false,
            message:error.message
        });
    }
});

app.post("/change-password", async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({
                success:false,
                message:"User not found"
            });
        }

        if (user.password !== currentPassword) {
            return res.json({
                success:false,
                message:"Current password is wrong"
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success:true,
            message:"Password Changed Successfully"
        });

    } catch (error) {
        res.json({
            success:false,
            message:error.message
        });
    }
});

// ================= ADMIN LOGIN =================
app.post("/admin-login", (req, res) => {
    const { email, password } = req.body;

    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
    ) {
        return res.json({
            success: true,
            message: "Admin Login Successful"
        });
    }

    res.json({
        success: false,
        message: "Invalid Admin Email or Password"
    });
});

// ================= GET ALL USERS FOR ADMIN =================
app.get("/admin/users", async (req, res) => {
    try {
        const users = await User.find({}, "name phone email");

        res.json({
            success: true,
            users
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "auth.html"));
});

// ================= START SERVER =================
app.listen(PORT, "0.0.0.0", () => {
    console.log("Server Running On Port", PORT);
});