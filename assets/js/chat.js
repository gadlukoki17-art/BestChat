import { getToken, getTheme, saveTheme } from './modules/storage.js';
import { getData, postData, deleteData } from "./modules/api.js";

const chatBtn = document.getElementById("chat-btn");
const uploatBtn = document.getElementById("uploat-btn");
const settingBtn = document.querySelectorAll("[data-setting-btn]");
const newChatBtn = document.getElementById("new-chat-btn");
const currentUserAvatar = document.getElementById("current-user-avatar");
const currentUserName = document.getElementById("current-user-name");
const currentUserStatus = document.getElementById("current-user-status");
const chatUserAvatar = document.getElementById("chat-user-avatar");
const chatUserName = document.getElementById("chat-user-name");
const chatUserStatus = document.getElementById("chat-user-status");
const searchConvesations = document.getElementById("search-convesation");
const emptySearchMessage = document.getElementById("empty-search-message");
const conversationList = document.getElementById("conversation-list");
const emptyConversations = document.getElementById("empty-conversations");
const iconEdit = document.getElementById("icon-edit");
const iconBack = document.getElementById("icon-back");
const emojiPicker = document.getElementById("emoji-picker");
const emojiItems = document.querySelectorAll(".emoji-item");
const emojiBtn = document.getElementById("emoji-btn");
const conversationPanel = document.getElementById("conversation-panel");
const chatPanel = document.getElementById("chat-panel");
const mobileBackBtn = document.getElementById("mobile-back-btn");
const asidePanel = document.getElementById("aside-panel")
const settingPanel = document.getElementById("setting-panel")
const themeBtn = document.getElementById("theme")
const themeText = document.getElementById("theme-text");
const languageBtn = document.getElementById("language-btn");
const languageText = document.getElementById("language-text");
const profilBtn = document.getElementById("profil-btn");
const conversationMenu = document.getElementById("conversation-menu");
const viewProfileBtn = document.getElementById("view-profile-btn");
const deleteConversationBtn = document.getElementById("delete-conversation-btn");
const confirmModal = document.getElementById("confirm-modal");
const confirmTitle = document.getElementById("confirm-title");
const confirmMessage = document.getElementById("confirm-message");
const confirmCancel = document.getElementById("confirm-cancel");
const confirmOk = document.getElementById("confirm-ok");
const callBtn = document.getElementById("call-btn");
const personBtn = document.getElementById("person-btn");
const callBtn2 = document.getElementById("call-btn2");
const videoBtn = document.getElementById("video-btn");
const menuBtn = document.getElementById("menu-btn");
const messagesContainer = document.getElementById("messages-container");
const messageForm = document.getElementById("message-form");
const addBtn = document.getElementById("add-btn");
const messageInput = document.getElementById("message-input");

// All variable
let selectedUser = null;
let activeConversationId = null;
let currentUserId = null;
let conversations = [];
let listMode = "conversations";
let renderedMessageIds = new Set();
let confirmAction = null;

async function openConversation(user) {
    const existingConversation = conversations.find((conversation) => {
        return conversation.participants?.some((participant) => {
            return participant.id === user.id;
        });
    });   

    if (existingConversation) {
        activeConversationId = existingConversation.id;
        loadMessages(activeConversationId, true);
        showConversations();

        return;
    }

    const payload = {
        type: "private",
        name: user.fullName,
        participantIds: [user.id]
    };

    const result = await postData("/conversations", payload, token);

    if (result.success) {
        const conversation = result.data.conversation;

        conversations.push(conversation);

        activeConversationId = conversation.id;

        localStorage.setItem(
            "kadea_last_conversation",
            conversation.id
        );

        loadMessages(activeConversationId, true);
        showConversations();
    }
}

async function loadMessages(conversationId, reset = false) {
    const result = await getData(
        `/conversations/${conversationId}/messages`,
        token
    );

    if (!result.success) {
        return;
    }

    if (reset) {
        messagesContainer.innerHTML = "";
        renderedMessageIds.clear();
    }

    result.data.messages.forEach((message) => {
        if (renderedMessageIds.has(message.id)) {
            return;
        }

        const messageBubble = createMessageBubble(message);

        messagesContainer.appendChild(messageBubble);
        renderedMessageIds.add(message.id);
    });

    if (reset) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
} 

function createMessageBubble(message) {
    const isMine = message.senderId === currentUserId;

    const wrapper = document.createElement("div");
    wrapper.className = isMine  ? "w-full flex justify-end"
    : "w-full flex justify-start";
    
    const bubble = document.createElement("div");
    bubble.textContent = message.content;
    bubble.className = isMine
     ? "inline-block md:max-w-[38rem] max-w-[18rem] break-words whitespace-pre-wrap rounded-t-xl rounded-bl-xl px-4 py-2 text-sm bg-blue-600 text-white"
     : "inline-block md:max-w-[38rem] max-w-[18rem] break-words whitespace-pre-wrap rounded-t-xl rounded-br-xl px-4 py-2 text-sm bg-gray-200 text-gray-900 dark:bg-[#1E1F20] dark:text-white";
    const bubbleContainer = document.createElement("div");
    bubbleContainer.className = isMine
    ? "flex flex-col items-end"
    : "flex flex-col items-start";

    const actions = document.createElement("div");
    actions.className = "mt-1 flex justify-end";

    if(isMine) {
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "supprimer";
        deleteButton.className =
            "text-xs text-red-500 hover:text-red-700";

        deleteButton.addEventListener("click", () => {
            deleteMessage(message.id);
        });    

        actions.appendChild(deleteButton);
    }

    const time = document.createElement("span");
    time.className = "text-[11px] text-gray-400 mt-1";
    
    time.textContent = new Date(message.createdAt)
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    bubbleContainer.appendChild(bubble);
    bubbleContainer.appendChild(time);
    if(isMine) {
        bubbleContainer.appendChild(actions);
    }

    wrapper.appendChild(bubbleContainer);
    return wrapper;
}

//delete conversation function
async function deleteMessage(messageId) {
    openConfirmModal(
        "Delete message",
        "Are you sure you want to delete this message?",
        async () => {
            const result = await deleteData(
                `/messages/${messageId}`,
                token
            );

            if (!result.success) {
                showToast("Unable to delete the message.");
                return;
            }

            showToast("Message deleted.");

            await loadMessages(activeConversationId, true);
            await loadConversations();
        }
    );
}

async function loadConversations() {
    const result = await getData("/conversations", token);

    if (listMode !== "conversations") return;

    if (result.success) {
        conversations = result.data.conversations;

        //Last message
        const savedConversationId = localStorage.getItem(
           "kadea_last_conversation"
        );

        if (!activeConversationId && savedConversationId) {
            const savedConversation = conversations.find(
               (conversation) => conversation.id === savedConversationId
            );

            if (savedConversation) {
                activeConversationId = savedConversation.id;
            }
        }

        //Sort conversations by recent activity (latest message on top)
        conversations.sort((a, b) => {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);

            return dateB - dateA;
        });
        conversationList.innerHTML = "";

        conversations.forEach((conversation) => {
            const card = createConversationCard(conversation);
            if (card) {
                conversationList.appendChild(card);
            }
        });

        if (activeConversationId) {
            const activeConversation = conversations.find(
                (conversation) =>
                conversation.id === activeConversationId
            );

            if (activeConversation) {
                const otherParticipant =
                activeConversation.participants.find(
                    (participant) =>
                        participant.userId !== currentUserId
                );

                if (otherParticipant?.user) {
                    const otherUser = otherParticipant.user;

                    updateChatHeader(otherUser);

                    await loadMessages(
                       activeConversationId,
                        true
                    );
                }
            }
        }

        console.log("Conversations :", conversations);
    }
}
// messageform
messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const content = messageInput.value.trim();

    if (!content || !activeConversationId) return;

    const result = await postData(
        `/conversations/${activeConversationId}/messages`,
        { content },
        token
    );

    if(result.success) {
        messageInput.value = "";

        emojiPicker.classList.add("hidden");

        await loadMessages(activeConversationId, true);
        await loadConversations();
    }
});

searchConvesations.addEventListener("input", () => {
    const query = searchConvesations.value.toLowerCase().trim();
    const cards = conversationList.querySelectorAll("button");

    let visibleCount = 0;

    cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const isVisible = text.includes(query);

        card.classList.toggle("hidden", !isVisible);

        if (isVisible) {
            visibleCount++;
        }
    });

    if (visibleCount === 0) {
        emptySearchMessage.textContent =
            listMode === "users"
                ? "No users found"
                : "No conversations found";

        emptySearchMessage.classList.remove("hidden");
    } else {
        emptySearchMessage.classList.add("hidden");
    }
});

const token = getToken();

if(!token) {
    window.location.href = "login.html";
}

async function loadCurrentUser() {
    const result = await getData("/auth/me", token);

    if(result.success) {
        const user = result.data.user;

        currentUserId = user.id;

        currentUserName.textContent = user.fullName;
        currentUserStatus.textContent = user.bio || "Active";
        currentUserAvatar.src = user.avatarUrl || "assets/images/avatar.avif";
    } 
}

async function loadUsers() {
    const result = await getData("/users", token);

    if (listMode !== "users") return;
    
    if(result.success) {
        conversationList.innerHTML = "";

        result.data.users.forEach((user) => {
            const userCard = createUserCard(user);
            conversationList.appendChild(userCard);
        });
    }
}
//loadUsers();
async function initChat() {
    await loadCurrentUser();
    await loadConversations();
}

initChat();

function createUserCard(user, clickCallback = null) {
    const button = document.createElement("button");

    const displayName =
        user.fullName ||
        user.email ||
        user.name ||
        "Unknown user";

    button.dataset.userId = user.id;

    button.className =
        "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition text-left hover:dark:bg-[#1E1F20]";

    const img = document.createElement("img");
    img.src = user.avatarUrl || "assets/images/avatar.avif";
    img.alt = displayName;
    img.className = "w-11 h-11 rounded-full object-cover";

    const div = document.createElement("div");
    div.className = "flex-1 min-w-0";

    const name = document.createElement("h3");
    name.textContent = displayName;
    name.className =
        "font-semibold text-sm text-gray-900 truncate dark:text-white";

    const status = document.createElement("p");
    status.textContent = user.bio || user.email || "Start a conversation";
    status.className = "text-xs text-gray-500 truncate";

    div.appendChild(name);
    div.appendChild(status);

    button.appendChild(img);
    button.appendChild(div);

    button.addEventListener("click", async () => {
        document
            .querySelectorAll("#conversation-list button")
            .forEach((btn) => {
                btn.classList.remove(
                    "bg-blue-100",
                    "dark:bg-[#1E1F20]"
                );
            });

        button.classList.add(
            "bg-blue-100",
            "dark:bg-[#1E1F20]"
        );

        if (clickCallback) {
            await clickCallback();
            return;
        }

        // Ce comportement est seulement utilisé pour la liste des utilisateurs.
        selectedUser = user;

        updateChatHeader(user);
        openMobileChat();

        await openConversation(user);
    });

    return button;
}

function updateChatHeader(user) {
    chatUserName.textContent = user.fullName;
    chatUserStatus.textContent = "Active";
    chatUserAvatar.src =  user.avatarUrl || "assets/images/avatar.avif";
}

function createConversationCard(conversation) {
    const otherParticipant = conversation.participants.find(
        (participant) => participant.userId !== currentUserId
    );

    if (!otherParticipant || !otherParticipant.user) {
        return null;
    }

    const otherUser = {
        id: otherParticipant.user.id,
        fullName: otherParticipant.user.fullName,
        email: otherParticipant.user.email || "",
        avatarUrl: otherParticipant.user.avatarUrl,
        bio: otherParticipant.user.bio || ""
    };

    const lastMessage = conversation.messages?.[conversation.messages.length - 1];

    const button = createUserCard(otherUser);
    if (conversation.id === activeConversationId) {
    button.classList.add("bg-blue-100", "dark:bg-[#1E1F20]");
}

    const name = button.querySelector("h3");

    const lastMessageTime = document.createElement("span");
    lastMessageTime.className = "text-[11px] text-gray-400 ml-auto shrink-0 dark:text-gray-300";
    lastMessageTime.textContent = lastMessage
        ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })
        : "";

    const nameRow = document.createElement("div");
    nameRow.className = "flex items-center gap-2 w-full";

    name.parentNode.insertBefore(nameRow, name);
    nameRow.appendChild(name);
    nameRow.appendChild(lastMessageTime);

    const status = button.querySelector("p");
    status.textContent = lastMessage
    ? lastMessage.content
    : "Start a conversation";

    button.addEventListener("click", async () => {
       activeConversationId = conversation.id;

       localStorage.setItem(
          "kadea_last_conversation",
           conversation.id
       );

       updateChatHeader(otherUser);
       openMobileChat();

       await loadMessages(conversation.id);
    });

    return button;
}

//Add a new user function
function showConversations() {
    listMode = "conversations";

    searchConvesations.value = "";
    searchConvesations.placeholder = "Search conversations...";

    emptySearchMessage.classList.add("hidden");

    iconBack.classList.add("hidden");
    iconEdit.classList.remove("hidden");
    loadConversations();
}

function showUsers() {
    listMode = "users";
    searchConvesations.value = "";
    searchConvesations.placeholder = "Search users...";

    emptySearchMessage.classList.add("hidden");  

    iconEdit.classList.add("hidden");
    iconBack.classList.remove("hidden");

    if (window.innerWidth < 768) {
        chatPanel.classList.add("hidden");
        chatPanel.classList.remove("flex");

        conversationPanel.classList.remove("hidden");
        asidePanel.classList.remove("hidden");
    }

    loadUsers();
}

function toggleList() {

    if(listMode === "conversations") {
        showUsers();
    } else {
        showConversations();
    }
}

//mobiles functions
function openMobileChat() {
    if(window.innerWidth >= 768) return;

    conversationPanel.classList.add("hidden");
    asidePanel.classList.add("hidden");

    

    chatPanel.classList.remove("hidden");
    chatPanel.classList.add("flex");

    chatPanel.style.display = "flex";
}

function showMobileConversation() {
    if(window.innerWidth >= 768) return;

    chatPanel.classList.add("hidden");
    chatPanel.classList.remove("flex");
    chatPanel.style.display = "";

    conversationPanel.classList.remove("hidden");
    asidePanel.classList.remove("hidden");
}


//language
function updateLanguageText() {
    const language = localStorage.getItem("bestchat_language") || "en";

    languageText.textContent =
        language === "en" ? "English" : "Français";
}

updateLanguageText();

const translations = {
    en: {
        search: "Search conversations...",
        active: "Active",
        engage: "Start a conversation",
        settings: "Settings"
    },

    fr: {
        search: "Rechercher une conversation...",
        active: "Actif",
        engage: "Commencer une conversation",
        settings: "Paramètres"
    }
};

//flex detecte panel
function applyLanguage(language) {
    searchConvesations.placeholder = translations[language].search;
}

function openConfirmModal(title, message, callback) {

    confirmTitle.textContent = title;
    confirmMessage.textContent = message;

    confirmAction = callback;

    confirmModal.classList.remove("hidden");
    confirmModal.classList.add("flex");
}

function closeConfirmModal() {

    confirmModal.classList.add("hidden");
    confirmModal.classList.remove("flex");

    confirmAction = null;

}

//mode dark
function updateThemeText() {
    const isDark = document.documentElement.classList.contains("dark");

    themeText.textContent = isDark ? "Dark" : "Light";
}

updateThemeText();

function applyTheme(theme) {
    document.documentElement.classList.toggle(
        "dark",
        theme === "dark"
    );
}

const savedTheme = localStorage.getItem("bestchat_theme") || "dark";
applyTheme(savedTheme);

function showToast(message) {
    const toast = document.createElement("div");

    toast.textContent = message;

    toast.className =
        "fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-pulse";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Actualisation automatique
setInterval(() => {

    if (activeConversationId) {
        loadMessages(activeConversationId);
    }

}, 3000);

document.addEventListener("click", () => {
    settingPanel.classList.add("hidden");
    conversationMenu.classList.add("hidden");
});

//newChat button
newChatBtn.addEventListener("click", toggleList);

//emoji button
emojiBtn.addEventListener("click", () => {
    emojiPicker.classList.toggle("hidden");
});

emojiItems.forEach((emojiButton) => {
    emojiButton.addEventListener("click", () => {
         messageInput.value += emojiButton.textContent;
        messageInput.focus();
    });
});

//back button
mobileBackBtn.addEventListener("click", showMobileConversation)

//setting btn
settingBtn.forEach((btn) => {
    btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        settingPanel.classList.toggle("hidden")
    });
});

// setting panel
settingPanel.addEventListener("click", (event) => {
    event.stopPropagation();
})

//themeBtn
themeBtn.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");

    const newTheme = isDark ? "light" : "dark";

    applyTheme(newTheme);
    saveTheme(newTheme);

    updateThemeText();
});

//languageBtn
languageBtn.addEventListener("click", () => {

    const language = localStorage.getItem("bestchat_language") || "en";

    const newLanguage = language === "en" ? "fr" : "en";

    localStorage.setItem("bestchat_language", newLanguage);

    updateLanguageText();
    applyLanguage(newLanguage);

});

//Profil
profilBtn.addEventListener("click", () => {
    window.location.href = "profil.html";
});  

//menu button 
menuBtn.addEventListener("click", (event) => {
    event.stopPropagation();

    conversationMenu.classList.toggle("hidden");
});

//convesation menu
conversationMenu.addEventListener("click", () => {
    event.stopPropagation();
});

//Delete ConversationBtn
deleteConversationBtn.addEventListener("click", () => {

    openConfirmModal(
        "Delete conversation",
        "Are you sure you want to delete this conversation? This action cannot be undone.",

        async () => {

            const result = await deleteData(
                `/conversations/${activeConversationId}`,
                token
            );

            if (!result.success) {
                alert("Unable to delete conversation.");
                return;
            }

            activeConversationId = null;
            selectedUser = null;

            localStorage.removeItem(
                "kadea_last_conversation"
            );

            messagesContainer.innerHTML = "";

            chatUserName.textContent = "Select a conversation";
            chatUserStatus.textContent = "No conversation selected";
            chatUserAvatar.src = "assets/images/avatar.avif";

            await loadConversations();

            if (window.innerWidth < 768) {
                showMobileConversation();
            }

        }

    );

});

confirmCancel.addEventListener("click", closeConfirmModal);

confirmOk.addEventListener("click", async () => {

    if (confirmAction) {
        await confirmAction();
    }

    closeConfirmModal();

});

messageInput.addEventListener("input", () => {
    if (messageInput.value.length === 500) {
        showToast("Maximum 500 caractères.");
    }
});