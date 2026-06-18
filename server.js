const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const app = express();
const otpTimeStore = {};
const OTP_EXPIRY_MS = 2 * 60 * 1000; // 2 minutes

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("Server Running On Port", PORT);
});

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
    password: String
});

const User = mongoose.model("User", UserSchema);


// ================= SIGNUP =================
app.post("/signup", async (req, res) => {

    const { name, phone, email, password } = req.body;

    try {

        // 🔥 CHECK DUPLICATES (IMPORTANT)
        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { phone: phone },
                { name: name }
            ]
        });

        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exists (email / phone / name must be unique)"
            });
        }

        // 🔥 CREATE USER
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
                message: "Login Successful"
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
// ================= SEND OTP =================
// ================= SEND OTP =================
app.post("/send-otp", async (req, res) => {
    try {
        const { phone, channel } = req.body;

        const user = await User.findOne({ phone });

        if (!user) {
            return res.json({
                success: false,
                message: "Phone number not registered"
            });
        }

        const selectedChannel = channel || "sms";

        await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verifications.create({
                to: "+91" + phone,
                channel: selectedChannel
            });

        otpTimeStore[phone] = Date.now();

        res.json({
            success: true,
            message: "OTP sent successfully via " + selectedChannel
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
        const { phone, otp, newPassword } = req.body;

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

        const verificationCheck = await client.verify.v2
            .services(process.env.TWILIO_VERIFY_SERVICE_SID)
            .verificationChecks.create({
                to: "+91" + phone,
                code: otp
            });

        if (verificationCheck.status !== "approved") {
            return res.json({
                success: false,
                message: "Invalid OTP"
            });
        }

        await User.updateOne(
            { phone },
            { password: newPassword }
        );

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
// ================= START SERVER =================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "auth.html"));
});
