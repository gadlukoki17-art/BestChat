import { getToken } from './modules/storage.js';
import { getData, postData } from "./modules/api.js";

const chatBtn = document.getElementById("chat-btn");
const callBtn = document.getElementById("call-btn");
const personBtn = document.getElementById("person-btn");
const uploatBtn = document.getElementById("uploat-btn");
const settingBtn = document.getElementById("setting-btn");
const newChatBtn = document.getElementById("new-chat-btn");
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
let listMode = "conversations";

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
        loadMessages(activeConversationId, true);
        showConversations();
    }
}

async function loadMessages(conversationId, forceScroll = false) {
    const result = await getData(
        `/conversations/${conversationId}/messages`,
        token
    );

    if (result.success) {
        const isNearBottom =
            messagesContainer.scrollHeight -
            messagesContainer.scrollTop -
            messagesContainer.clientHeight < 80;

        messagesContainer.innerHTML = "";

        result.data.messages.forEach((message) => {
            const messageBubble = createMessageBubble(message);
            messagesContainer.appendChild(messageBubble);
        });

        if (forceScroll || isNearBottom) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
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
     ? "inline-block max-w-[420px] break-words whitespace-pre-wrap rounded-t-xl rounded-bl-xl px-4 py-2 text-sm bg-blue-600 text-white"
     : "inline-block max-w-[420px] break-words whitespace-pre-wrap rounded-t-xl rounded-br-xl px-4 py-2 text-sm bg-gray-200 text-gray-900";
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

async function loadConversations() {
    const result = await getData("/conversations", token);

    if (result.success) {
        conversations = result.data.conversations;
        conversationList.innerHTML = "";

        conversations.forEach((conversation) => {
            const card = createConversationCard(conversation);
            if (card) {
                conversationList.appendChild(card);
            }
        });

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
        loadMessages(activeConversationId, true);
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

function createUserCard(user) {
    const button = document.createElement("button");

    const displayName = user.fullName || user.email || user.name || "Unknown user";

    button.dataset.userId = user.id;

    button.className = 
     "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition text-left";

    const img = document.createElement("img");
    img.src = user.avatarUrl || "assets/images/avatar.avif";
    img.alt = displayName;
    img.className = "w-11 h-11 rounded-full object-cover";
    
    const div = document.createElement("div");
    div.className = "flex-1 min-w-0";

    const name = document.createElement("h3");
    name.textContent = displayName;
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

    const status = button.querySelector("p");
    status.textContent = lastMessage
        ? lastMessage.content
        : "Engage une conversation";

    button.addEventListener("click", () => {
        selectedUser = otherUser;
        activeConversationId = conversation.id;

        updateChatHeader(otherUser);
        loadMessages(activeConversationId, true);
    });

    return button;
}

function showConversations() {
    listMode = "conversations";
    searchConvesation.placeholder = "Search conversations...";
    loadConversations();
}

function showUsers() {
    listMode = "users";
    searchConvesation.placeholder = "Search users...";
    loadUsers();
}

function toggleList() {
    if(listMode === "conversations") {
        showUsers();
    } else {
        showConversations();
    }
}

// Actualisatin automatique
setInterval(() => {

    if (activeConversationId) {
        loadMessages(activeConversationId);
    }

}, 3000);

//newChat button
newChatBtn.addEventListener("click", showUsers);
