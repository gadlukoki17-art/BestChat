import { getToken } from './modules/storage.js';
import { getData, postData } from "./modules/api.js";

const chatBtn = document.getElementById("chat-btn");
const callBtn = document.getElementById("call-btn");
const personBtn = document.getElementById("person-btn");
const uploatBtn = document.getElementById("uploat-btn");
const settingBtn = document.getElementById("setting-btn");
const editBtn = document.getElementById("edit-btn");
const currentUserAvatar = document.getElementById("current-user-avatar");
const currentUserName = document.getElementById("current-user-name");
const currentUserStatus = document.getElementById("current-user-status");
const chatUserAvatar = document.getElementById("chat-user-avatar");
const chatUserName = document.getElementById("chat-user-name");
const chatUserStatus = document.getElementById("chat-user-status");
const searchConvesation = document.getElementById("search-convesation");
const conversationList = document.getElementById("conversation-list");
const callBtn2 = document.getElementById("call-btn2");
const videoBtn = document.getElementById("video-btn");
const menuBtn = document.getElementById("menu-btn");
const messagesContainer = document.getElementById("messages-container");
const messageForm = document.getElementById("message-form");
const addBtn = document.getElementById("add-btn");
const emojiBtn = document.getElementById("emoji-btn");
const messageInput = document.getElementById("message-input");

let selectedUser = null;
let activeConversationId = null;
let currentUserId = null;
let conversations = [];

async function openConversation(user) {
    const existingConversation = conversations.find((conversation) => {
        return conversation.participants?.some((participant) => {
            return participant.id === user.id;
        });
    });

    if (existingConversation) {
        activeConversationId = existingConversation.id;
        loadMessages(activeConversationId);
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
        loadMessages(activeConversationId);
    }
}

async function loadMessages(conversationId) {
    const result = await getData(
         `/conversations/${conversationId}/messages`,
        token
    );

    if(result.success) {
        messagesContainer.innerHTML = "";

        result.data.messages.forEach((message) => {
            const messageBubble = createMessageBubble(message);
            messagesContainer.appendChild(messageBubble);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function createMessageBubble(message) {
    const isMine = message.senderId === currentUserId;

    const wrapper = document.createElement("div");
    wrapper.className = isMine ? "flex justify-end" : "flex justify-start";
    
    const bubble = document.createElement("p");
    bubble.textContent = message.content;
    bubble.className = isMine
        ? "max-w-[70%] rounded-t-xl rounded-bl-xl px-4 py-2 text-sm bg-blue-600 text-white" 
        : "max-w-[70%] rounded-t-xl rounded-br-xl px-4 py-2 text-sm bg-gray-200 text-gray-900";

    const bubbleContainer = document.createElement("div");
    bubbleContainer.className = isMine
      ? "flex flex-col items-end"
      : "flex flex-col items-start";

    const time = document.createElement("span");
    time.className = "text-[11px] text-gray-400 mt-1";
    
    time.textContent = new Date(message.createdAt)
        .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    bubbleContainer.appendChild(bubble);
    bubbleContainer.appendChild(time);

    wrapper.appendChild(bubbleContainer);
    return wrapper;
}

async function loadConvesation() {
    const result = await getData("/conversations", token);

    if(result.success) {
        conversations = result.data.conversations;
        console.log("Conversations :", conversations);
    }
}

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
        loadMessages(activeConversationId);
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

loadCurrentUser();

async function loadUsers() {
    const result = await getData("/users", token);
    
    if(result.success) {
        conversationList.innerHTML = "";

        result.data.users.forEach((user) => {
            const userCard = createUserCard(user);
            conversationList.appendChild(userCard);
        });
    }
}

loadUsers();
loadConvesation();

function createUserCard(user) {
    const button = document.createElement("button");

    button.dataset.userId = user.id;

    button.className = 
     "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition text-left";

    const img = document.createElement("img");
    img.src = user.avatarUrl || "assets/images/avatar.avif";
    img.alt = user.fullName;
    img.className = "w-11 h-11 rounded-full object-cover";
    
    const div = document.createElement("div");
    div.className = "flex-1 min-w-0";

    const name = document.createElement("h3");
    name.textContent = user.fullName;
    name.className = "font-semibold text-sm text-gray-900 truncate";

    const status = document.createElement("p");
    status.textContent = user.bio || user.email //"Start a conversation";
    status.className = "text-xs text-gray-500 truncate";

    div.appendChild(name);
    div.appendChild(status);

    button.appendChild(img);
    button.appendChild(div);

    button.addEventListener("click", () => {

        selectedUser = user;

        document.querySelectorAll("#conversation-list button").forEach((btn) => {
            btn.classList.remove("bg-blue-100");
        })

        button.classList.add("bg-blue-100");

        updateChatHeader(selectedUser);
        openConversation(selectedUser);
        
    });

    return button;
}

function updateChatHeader(user) {
    chatUserName.textContent = user.fullName;
    chatUserStatus.textContent = "Active";
    chatUserAvatar.src =  user.avatarUrl || "assets/images/avatar.avif";
}

// Actualisatin automatique
setInterval(() => {

    if (activeConversationId) {
        loadMessages(activeConversationId);
    }

}, 3000);
