const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");

loginBtn.addEventListener("click", () => {
    window.location.href = "login.html"
});

registerBtn.addEventListener("click", () => {
    window.location.href = "register.html"
});