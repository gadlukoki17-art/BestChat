import { postData } from './modules/api.js';
import { initializeTheme } from "./modules/theme.js";


const forgotForm = document.getElementById("forgot-form");
const emailInput = document.getElementById("email");
const resetBtn = document.getElementById("resetbtn");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btn-text");
const formMessage = document.getElementById("form-message");

function showError(message) {
    formMessage.textContent = message;
    formMessage.className = 
        "rounded-lg p-3 text-sm bg-red-100 text-red-700 border border-red-300";
}

function showSuccess(message) {
    formMessage.textContent = message;
    formMessage.className = 
        "rounded-lg p-3 text-sm bg-green-100 text-green-700 border border-green-300";

}

function hideMessage() {
    formMessage.textContent = "";
    formMessage.className = "hidden";
}

function setLoading(isloading) {
    resetBtn.disabled = isloading;
    spinner.classList.toggle("hidden", !isloading);
    btnText.textContent = isloading ? "Sending code..." : "Reset Password";
}

forgotForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideMessage();

    const email = emailInput.value.trim();

    if (!email) {
        showError("Please enter your email address.");
        return;
    }

    try{
        setLoading(true);

        const result = await postData("/auth/forgot-password", { email }); 

        if (result.success) {
            showSuccess("Reset code sent. Check your email.");

            setTimeout(() => {
                window.location.href = "reset-password.html";
            }, 1200);
        } else {
            showError(result.message || "Unable to send reset code.");
        }
    } catch (error) {
        console.error(error);
        showError("Something went wrong. Please try again.");     
    } finally {
        setLoading(false)
    }
});