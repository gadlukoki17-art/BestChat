import { getToken, postData } from './modules/storage.js';

const chatBtn = document.getElementById("chat-btn");
const callBtn = document.getElementById("call-btn");
const personBtn = document.getElementById("person-btn");
const uploatBtn = document.getElementById("uploat-btn");
const settingBtn = document.getElementById("setting-btn");
const editBtn = document.getElementById("edit-btn");
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

const token = getToken();

if(!token) {
    window.location.href = "login.html";
}