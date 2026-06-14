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
            headers: {
                "Content-Type": "application/json"
            },
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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
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
}

function showLogin() {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("signupBox").style.display = "none";
}


// ================= PHONE VALIDATION =================
function validatePhone() {

    const phone = document.getElementById("phone");

    if (/^[0-9]{10}$/.test(phone.value)) {
        phone.style.border = "2px solid green";
    } else {
        phone.style.border = "2px solid red";
    }
}


// ================= EMAIL VALIDATION =================
function validateEmail() {

    const email = document.getElementById("email");

    if (email.value.includes("@")) {
        email.style.border = "2px solid green";
    } else {
        email.style.border = "2px solid red";
    }
}


// ================= PASSWORD VALIDATION =================
function validatePassword() {

    const password = document.getElementById("password");

    const value = password.value;

    const hasCapital = /^[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (hasCapital && hasNumber && hasSymbol) {
        password.style.border = "2px solid green";
    } else {
        password.style.border = "2px solid red";
    }
}


// ================= SHOW PASSWORD =================
function togglePassword() {

    const password = document.getElementById("password");

    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }
}


// ================= LOGIN FORM SUBMIT =================
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            login();
        });
    }

});document.addEventListener("DOMContentLoaded", () => {

    const passwordBox = document.getElementById("loginPassword");

    if (passwordBox) {

        passwordBox.addEventListener("keydown", function(event) {

            if (event.key === "Enter") {

                event.preventDefault();
                login();

            }

        });

    }

});