// ================= SIGNUP =================
async function signup() {
    const user = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    if (!/^[0-9]{10}$/.test(user.phone)) {
        alert("Phone number must be exactly 10 digits");
        return;
    }

    try {
        const response = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        const data = await response.json();

        if (data.success) {
            alert("Account Created Successfully");
            showLogin();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.log(error);
        alert("Signup Error");
    }
}

// ================= LOGIN =================
async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            alert("Login Successful");
            window.location.href = "dashboard.html";
        } else {
            alert(data.message || "Invalid Email or Password");
        }
    } catch (error) {
        console.log(error);
        alert("Login Error");
    }
}

// ================= UI TOGGLE =================
function showSignup() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupBox").style.display = "block";
    document.getElementById("forgotBox").style.display = "none";
}

function showLogin() {
    document.getElementById("loginForm").style.display = "block";

    const signupBox = document.getElementById("signupBox");
    if (signupBox) signupBox.style.display = "none";

    const forgotBox = document.getElementById("forgotBox");
    if (forgotBox) forgotBox.style.display = "none";
}

function showForgotPassword() {
    document.getElementById("loginForm").style.display = "none";

    const signupBox = document.getElementById("signupBox");
    if (signupBox) signupBox.style.display = "none";

    const forgotBox = document.getElementById("forgotBox");
    if (forgotBox) forgotBox.style.display = "block";

    const otpBox = document.getElementById("otpBox");
    if (otpBox) otpBox.style.display = "block";

    const newPasswordBox = document.getElementById("newPasswordBox");
    if (newPasswordBox) newPasswordBox.style.display = "none";
}

// ================= VALIDATIONS =================
function validatePhone() {
    const phone = document.getElementById("phone");
    phone.style.border = /^[0-9]{10}$/.test(phone.value)
        ? "2px solid green"
        : "2px solid red";
}

function validateEmail() {
    const email = document.getElementById("email");
    email.style.border = email.value.includes("@")
        ? "2px solid green"
        : "2px solid red";
}

function validatePassword() {
    const password = document.getElementById("password");
    const value = password.value;

    const hasCapital = /^[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    password.style.border = hasCapital && hasNumber && hasSymbol
        ? "2px solid green"
        : "2px solid red";
}

// ================= SHOW PASSWORD =================
function togglePassword() {
    const password = document.getElementById("password");
    password.type = password.type === "password" ? "text" : "password";
}

function toggleLoginPassword() {
    const password = document.getElementById("loginPassword");
    password.type = password.type === "password" ? "text" : "password";
}

// ================= FORM SUBMIT =================
document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            login();
        });
    }
});

// ================= SEND OTP =================
async function sendOTP(channel) {
    const phone = document.getElementById("forgotPhone").value;

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Enter valid 10-digit mobile number");
        return;
    }

    try {
        const response = await fetch("/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, channel })
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.log(error);
        alert("Error sending OTP");
    }
}

// ================= VERIFY OTP =================
async function verifyOTP() {
    const phone = document.getElementById("forgotPhone").value;
    const otp = document.getElementById("otp").value;

    if (!/^[0-9]{10}$/.test(phone)) {
        alert("Enter valid 10-digit mobile number");
        return;
    }

    if (otp.trim() === "") {
        alert("Enter OTP");
        return;
    }

    const response = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
    });

    const data = await response.json();
    alert(data.message);

    if (data.success) {
        document.getElementById("otpBox").style.display = "none";
        document.getElementById("newPasswordBox").style.display = "block";
    }
}

// ================= RESET PASSWORD =================
async function resetPassword() {
    const phone = document.getElementById("forgotPhone").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword.trim() === "" || confirmPassword.trim() === "") {
        alert("Enter both passwords");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const response = await fetch("/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, newPassword })
    });

    const data = await response.json();
    alert(data.message);

    if (data.success) {
        showLogin();
    }
}