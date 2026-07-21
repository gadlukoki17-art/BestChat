import { getToken, removeToken, saveTheme } from "./modules/storage.js";
import { getData, patchData } from "./modules/api.js";
import { initializeTheme, applyTheme } from "./modules/theme.js";


// 1. DÉCLARATION DES VARIABLES & ÉLÉMENTS DOM
const profileAvatar = document.getElementById("profile-avatar");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profileBio = document.getElementById("profile-bio");
const editProfileBtn = document.getElementById("edit-profile-btn");
const logoutBtn = document.getElementById("logout-btn");
const chatBtn = document.getElementById("chat-btn");
const asidePanel = document.getElementById("aside-panel");
const settingPanel = document.getElementById("setting-panel");
const themeBtn = document.getElementById("theme");
const themeText = document.getElementById("theme-text");
const settingBtn = document.querySelectorAll("[data-setting-btn]");
const editProfileModal = document.getElementById("edit-profile-modal");
const editProfileForm = document.getElementById("edit-profile-form");
const editFullnameInput = document.getElementById("edit-fullname");
const editBioInput = document.getElementById("edit-bio");
const cancelEditProfileBtn = document.getElementById("cancel-edit-profile");
const saveProfileBtn = document.getElementById("save-profile-btn");
const editProfileMessage = document.getElementById("edit-profile-message");
const profilePhone = document.getElementById("profile-phone");
const editEmailInput = document.getElementById("edit-email");
const editPhoneInput = document.getElementById("edit-phone");

let currentUser = null; 
let isEditing = false;

// 2. VÉRIFICATION DU TOKEN
const token = getToken();
if (!token) {
    window.location.href = "login.html";
}

// 3. LOGIQUE DU MODE SOMBRE (Déclarée et exécutée immédiatement)
function updateThemeText() {
    if (!themeText) return;
    const isDark = document.documentElement.classList.contains("dark");
    themeText.textContent = isDark ? "Dark" : "Light";
}

// Initialisation du thème dès le départ
initializeTheme();
updateThemeText();
window.addEventListener("storage", (event) => {
    if (event.key === "bestchat_theme") {
        applyTheme(event.newValue);
        updateThemeText();
    }
});

// 4. CHARGEMENT DU PROFIL
async function loadProfile() {
    try {
        const result = await getData("/auth/me", token);

        if (!result.success) {
            console.error(result.message);
            return;
        }

        currentUser = result.data.user;
        const user = currentUser;

        profileAvatar.src = user.avatarUrl || "assets/images/avatar.avif";
        profileAvatar.alt = user.fullName || "User profile";
        profileName.textContent = user.fullName || "Unknown user";
        profileEmail.textContent = user.email || "";
        profileBio.textContent = user.bio || "No bio added yet";

        const savedPhone = localStorage.getItem("bestchat_phone");
        profilePhone.textContent = savedPhone || "No phone number";

    } catch (error) {
        console.error("Unable to load profile:", error);
    }
}

loadProfile();

// 5. MODAL DE MODIFICATION DU PROFIL
function openEditProfileModal() {
    if (!currentUser) return;

    editFullnameInput.value = currentUser.fullName || "";
    editEmailInput.value = currentUser.email || "";
    editBioInput.value = currentUser.bio || "";
    editPhoneInput.value = localStorage.getItem("bestchat_phone") || "";

    editProfileMessage.textContent = "";
    editProfileMessage.className = "hidden";

    editProfileModal.classList.remove("hidden");
    editProfileModal.classList.add("flex");

    editFullnameInput.focus();
}

function closeEditProfileModal() {
    editProfileModal.classList.add("hidden");
    editProfileModal.classList.remove("flex");
}

// 6. ÉCOUTEURS D'ÉVÉNEMENTS (LISTENERS)

// Navigation & Déconnexion
logoutBtn.addEventListener("click", () => {
    removeToken();
    window.location.href = "login.html";
});

chatBtn.addEventListener("click", () => {
    window.location.href = "chat.html";
});

// Menu Paramètres Dropdown
document.addEventListener("click", () => {
    if (settingPanel) settingPanel.classList.add("hidden");
});

settingBtn.forEach((btn) => {
    btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (settingPanel) settingPanel.classList.toggle("hidden");
    });
});

if (settingPanel) {
    settingPanel.addEventListener("click", (event) => {
        event.stopPropagation();
    });
}

// Clic Changement de Thème (Correction bouton)
if (themeBtn) {
    themeBtn.addEventListener("click", () => {
        const isDark = document.documentElement.classList.contains("dark");
        const newTheme = isDark ? "light" : "dark";

        applyTheme(newTheme);
        saveTheme(newTheme); // Sauvegarde via ton module storage
        updateThemeText();
    });
}

// Modals Triggers
editProfileBtn.addEventListener("click", openEditProfileModal);
cancelEditProfileBtn.addEventListener("click", closeEditProfileModal);

editProfileModal.addEventListener("click", (event) => {
    if (event.target === editProfileModal) {
        closeEditProfileModal();
    }
});

// Formulaire Édition Profil Submit
editProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const fullName = editFullnameInput.value.trim();
    const email = editEmailInput.value.trim();
    const bio = editBioInput.value.trim();
    const phone = editPhoneInput.value.trim();

    if (!fullName) {
        editProfileMessage.textContent = "Full name is required.";
        editProfileMessage.className = "text-sm text-red-600";
        return;
    }

    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = "Saving...";

    try {
        const result = await patchData("/users/me", { fullName, bio, email }, token);

        if (!result.success) {
            editProfileMessage.textContent = result.message || "Unable to update profile.";
            editProfileMessage.className = "text-sm text-red-600";
            return;
        }

        localStorage.setItem("bestchat_phone", phone);
        await loadProfile();
        closeEditProfileModal();
    } catch (error) {
        console.error(error);
        editProfileMessage.textContent = "Something went wrong. Please try again.";
        editProfileMessage.className = "text-sm text-red-600";
    } finally {
        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = "Save";
    }
});