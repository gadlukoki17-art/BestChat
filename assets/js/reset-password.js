import { postData } from './modules/api.js';

const resetForm = document.getElementById("reset-form");
const codeInput = document.getElementById("verification-code");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");
const resetBtn = document.getElementById("resetbtn");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btn-text");
const formMessage = document.getElementById("form-message");

const hideBtn1 = document.getElementById("hidebtn1");
const hideBtn2 = document.getElementById("hidebtn2");
const eyeOpen1 = document.getElementById("eye-open-1");
const eyeClosed1 = document.getElementById("eye-closed-1");
const eyeOpen2 = document.getElementById("eye-open-2");
const eyeClosed2 = document.getElementById("eye-closed-2");

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

function setLoading(isLoading) {
    resetBtn.disabled = isLoading;
    spinner.classList.toggle("hidden", !isLoading);
    btnText.textContent = isLoading ? "Resetting..." : "Reset Password";
}

resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideMessage();

    const code = codeInput.value.trim();
    const newPassword = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    
    if(!code || !newPassword || !confirmPassword) {
        showError("Please fill in all fields.");
        return;
    }

    if(newPassword !== confirmPassword) {
        showError("Passwords do not match.");
        return;
    }

    try {
        setLoading(true);

        const result = await postData("/auth/reset-password", {
            code,
            newPassword
        });

        if(result.success) {
            showSuccess("Password reset successfully.");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
        } else {
            showError(result.message || "Unable to reset password.");
        }
    } catch (error) {
        console.error(error);
        showError("Something went wrong. Please try again.");
    } finally {
        setLoading(false);
    }
});

hideBtn1.addEventListener("click", () => {
    passwordInput.type = passwordInput.type === "password" ? "text" : "password";
    eyeOpen1.classList.toggle("hidden");
    eyeClosed1.classList.toggle("hidden");
});

hideBtn2.addEventListener("click", () => {
    confirmPasswordInput.type = confirmPasswordInput.type === "password" ? "text" : "password";
    eyeOpen2.classList.toggle("hidden");
    eyeClosed2.classList.toggle("hidden");
});