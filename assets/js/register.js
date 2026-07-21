import { postData } from './modules/api.js';
import { initializeTheme } from "./modules/theme.js";


const arrowback = document.getElementById("arrowback");
const registerform = document.getElementById("register-form")
const fullnameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput= document.getElementById("password");
const confirmpasswordInput = document.getElementById("confirmpwd");
const hidebtn1 = document.getElementById("hidebtn1");
const hidebtn2 = document.getElementById("hidebtn2");
const eyeOpen1 = document.getElementById("eye-open-1");
const eyeClosed1 = document.getElementById("eye-closed-1");
const eyeOpen2 = document.getElementById("eye-open-2");
const eyeClosed2 = document.getElementById("eye-closed-2");
const formMessage = document.getElementById("from-message");
const createbtnText = document.getElementById("createbtn-text");

//init theme
initializeTheme();
window.addEventListener("storage", (event) => {
    if (event.key === "bestchat_theme") {
        applyTheme(event.newValue);
    }
});

function showError(message) {
    formMessage.textContent = message;

    formMessage.className = 
    "rounded-lg p-3 text-sm bg-red-100 text-red-700 border border-red-300";

    formMessage.innerHTML = `
    <div class="flex items-center gap-2">
        <i class="fa-solid fa-circle-xmark text-red-500"></i>
        <span>${message}</span>
    </div>
`;
}

function hideMessage() {
    formMessage.textContent = "";

    formMessage.className = "hidden";
}

function showSuccess(message) {
    formMessage.textContent = message;
    formMessage.className = 
    "rounded-lg p-3 text-sm bg-green-100 text-green-700 border border-green-300";
}

function setLoading(isloading) {
    if(isloading) {
        createbtnText.disabled = true;
        createbtnText.textContent = "Creating account...";
        createbtnText.classList.add("opacity-70", "cursor-not-allowed");
    } else {
        createbtnText.disabled = false;
        createbtnText.textContent = "Creating account";
        createbtnText.classList.remove("opacity-70", "cursor-not-allowed");
    }
}

arrowback.addEventListener("click", () => {
    window.location.href = "index.html"
});

registerform.addEventListener("submit", async (event) => {
    event.preventDefault();

    hideMessage();

    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmpasseword = confirmpasswordInput.value.trim();

    if(!fullname || !email || !password || !confirmpasseword) {
       showError("Please fill in all required fields.");
       return;
    }

    if(password !== confirmpasseword) {
       showError("Passwords do not match!");
       return;
    }

    const payload = {
        fullName: fullname,
        email: email,
        password: password
    };


    try {

        setLoading(true);

        const result = await postData("/auth/register", payload);

        console.log("Réponse de l'API :", result);

        if (result.success) {
            showSuccess("Account successfully created!");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
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

hidebtn1.addEventListener("click", () => {
    if(passwordInput.type === "password") {
        passwordInput.type = "text"
    } else {
        passwordInput.type = "password";
    }

    eyeOpen1.classList.toggle("hidden");  
    eyeClosed1.classList.toggle("hidden");
});

hidebtn2.addEventListener("click", () => {
    if(confirmpasswordInput.type === "password") {
        confirmpasswordInput.type = "text"
    } else {
        confirmpasswordInput.type = "password";
    }

    eyeOpen2.classList.toggle("hidden");  
    eyeClosed2.classList.toggle("hidden");
});