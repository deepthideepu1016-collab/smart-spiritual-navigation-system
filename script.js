let signupOtpVerified = false;

async function signup(){
    const user = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value.trim()
    };

    const res = await fetch("/signup", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(user)
    });

    const data = await res.json();
    return data;
}

async function sendSignupOTP(){
    if(!/^[0-9]{10}$/.test(phone.value)){
        alert("Enter valid 10 digit mobile number");
        return;
    }

    const res = await fetch("/send-signup-otp", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ phone: phone.value })
    });

    const data = await res.json();
    alert(data.message);

    if(data.success){
        signupOtpBox.style.display = "block";
    }
}

async function verifySignupOTP(){
    const res = await fetch("/verify-otp", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
            phone: document.getElementById("phone").value.trim(),
            otp: document.getElementById("signupOtp").value.trim()
        })
    });

    const data = await res.json();

    if(data.success){
        const registerData = await signup();

        if(registerData.success){
            alert("OTP Verified Successfully.\nUser Registered Successfully");
            showLogin();
        }else{
            alert(registerData.message);
        }
    }else{
        alert("OTP not matched. Please enter correct OTP");
    }
}

async function login(){
    const res = await fetch("/login", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
            email: loginEmail.value,
            password: loginPassword.value
        })
    });

    const data = await res.json();
    alert(data.message);

    if(data.success){
        localStorage.setItem("loggedUser", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
    }
}

function showSignup(){
    loginForm.style.display = "none";
    signupBox.style.display = "block";
    forgotBox.style.display = "none";
}

function showLogin(){
    loginForm.style.display = "block";
    signupBox.style.display = "none";
    forgotBox.style.display = "none";
}

function showForgotPassword(){
    loginForm.style.display = "none";
    signupBox.style.display = "none";
    forgotBox.style.display = "block";
}

function togglePassword(){
    password.type = password.type === "password" ? "text" : "password";
}

function toggleLoginPassword(){
    loginPassword.type = loginPassword.type === "password" ? "text" : "password";
}

function validatePhone() {
    const phone = document.getElementById("phone");

    const valid = /^[6-9][0-9]{9}$/.test(phone.value);

    phone.style.border = valid
        ? "2px solid green"
        : "2px solid red";
}

function validateEmail(){
    email.style.border = email.value.includes("@")
        ? "2px solid green"
        : "2px solid red";
}

function validatePassword(){
    const ok = /^[A-Z]/.test(password.value) &&
               /[0-9]/.test(password.value) &&
               /[!@#$%^&*]/.test(password.value);

    password.style.border = ok ? "2px solid green" : "2px solid red";
}

loginForm.addEventListener("submit", function(e){
    e.preventDefault();
    login();
});