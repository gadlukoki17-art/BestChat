import { postData } from './modules/api.js';
import { saveToken } from "./modules/storage.js";
import { initializeTheme } from "./modules/theme.js";


const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const eyeOpen = document.getElementById("eye-open");
const eyeClosed = document.getElementById("eye-closed");
const remember = document.getElementById("remember");
const loginBtn = document.getElementById("loginbtn");
const spinner = document.getElementById("spinner");
const hidebtn = document.getElementById("hidebtn");
const btnText = document.getElementById("btn-text");
const formMessage = document.getElementById("from-message");

//init theme
initializeTheme();
window.addEventListener("storage", (event) => {
    if (event.key === "bestchat_theme") {
        applyTheme(event.newValue);
    }
});

function hideMessage() {
    formMessage.textContent = "";
    formMessage.className = "hidden";
}

function showError(message) {
    formMessage.textContent;
    formMessage.className = 
    "rounded-lg p-3 text-sm bg-red-100 text-red-700 border border-red-300";

    formMessage.innerHTML = `
    <div class="flex items-center gap-2">
        <i class="fa-solid fa-circle-xmark text-red-500"></i>
        <span>${message}</span>
    </div>
`;
}

function setLoading(isloading) {
    if(isloading) {
        loginBtn.disabled = true;
        spinner.classList.remove("hidden");
        btnText.textContent = "Logging in ...";

    } else {
        loginBtn.disabled = false;
        spinner.classList.add("hidden");
        btnText.textContent = "Login"
    }
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if(!email || !password) {
        showError("Please fill in all fields.");
        return;
    }

    const payload = {
        email,
        password
    };

    try {
       setLoading(true);
       
       const result = await postData("/auth/login", payload);

       console.log("Login response:", result);

       if(result.success) {
            saveToken(result.data.token, remember.ckeked);
            window.location.href = "chat.html";
       } else {
            showError(result.message);
       }
       
    } catch (error) {
        console.error(error);
        showError("Something went wrong. Please try again.");
        
    } finally {
        setLoading(false);
    }
});

hidebtn.addEventListener("click", () => {
    if(passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }

    eyeOpen.classList.toggle("hidden");
    eyeClosed.classList.toggle("hidden");
})