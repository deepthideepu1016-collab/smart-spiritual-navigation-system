// ================= SIGNUP =================
async function signup() {

    const user = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };
    //
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

            // 🔥 IMPORTANT CHANGE (stay in same page)
            showLogin();  

        } else {
            alert("Error: " + (data.message || "Signup failed"));
        }

    } catch (error) {
        alert("Server not running or error occurred");
        console.log(error);
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
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            alert("Login Successful");

            // 🔥 GO TO DASHBOARD
            window.location.href = "dashboard.html";

        } else {
            alert("Invalid Email or Password");
        }

    } catch (error) {
        alert("Server not running or backend error");
        console.log(error);
    }
}


// ================= UI TOGGLE =================
function showSignup() {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("signupBox").style.display = "block";
}

function showLogin() {
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("signupBox").style.display = "none";
}
function validatePhone() {
    const phone = document.getElementById("phone");

    if (phone.value.length === 0) {
        phone.style.border = "1px solid #ccc";
        return;
    }

    if (!/^[0-9]{10}$/.test(phone.value)) {
        phone.style.border = "2px solid red";
    } else {
        phone.style.border = "2px solid green";
    }
}
function validateEmail() {
    const email = document.getElementById("email");

    if (email.value.length === 0) {
        email.style.border = "1px solid #ccc";
        return;
    }

    if (!email.value.includes("@")) {
        email.style.border = "2px solid red";
    } else {
        email.style.border = "2px solid green";
    }
}
function validatePassword() {
    const password = document.getElementById("password");

    if (password.value.length === 0) {
        password.style.border = "1px solid #ccc";
        return;
    }

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
function togglePassword() {
    const password = document.getElementById("password");

    if (password.type === "password") {
        password.type = "text";
    } else {
        password.type = "password";
    }
}