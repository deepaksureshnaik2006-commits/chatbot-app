const API = "http://127.0.0.1:8000";

let currentChat = "New Chat";
let chats = {};

// TAB SWITCH
function showTab(tab) {
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(t => {
    t.classList.remove("border-b-2", "border-blue-500", "text-blue-500");
    t.classList.add("text-gray-500");
  });

  const active = document.querySelector(`[onclick="showTab('${tab}')"]`);
  active.classList.add("border-b-2", "border-blue-500", "text-blue-500");
  active.classList.remove("text-gray-500");

  document.getElementById("loginTab").classList.add("hidden");
  document.getElementById("signupTab").classList.add("hidden");
  document.getElementById("deleteTab").classList.add("hidden");

  document.getElementById(tab + "Tab").classList.remove("hidden");
}

function setMessage(text) {
  let msgEl = document.getElementById("msg");
  if (msgEl) msgEl.innerText = text;
}

// LOGIN
function login() {
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;

  fetch(API + "/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ email: email, password: password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      alert("Login success");
      window.location.href = "chat.html";
    } else {
      setMessage("Invalid login");
    }
  })
  .catch(err => {
    console.error(err);
    setMessage("Server error: check backend console and CORS settings.");
  });
}

// SIGNUP
function signup() {
  let email = document.getElementById("s_email").value;
  let password = document.getElementById("s_pass").value;

  fetch(API + "/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {"Content-Type": "application/json"}
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "created") setMessage("Account created!");
    else if (data.status === "exists") setMessage("Account already exists.");
    else setMessage("Unable to create account.");
  })
  .catch(err => {
    console.error(err);
    setMessage("Signup error");
  });
}

// DELETE
function deleteAcc() {
  let email = document.getElementById("d_email").value;
  let password = document.getElementById("d_pass").value;

  fetch(API + "/delete", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {"Content-Type": "application/json"}
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "deleted") setMessage("Deleted!");
    else setMessage("Delete failed: invalid email/password.");
  })
  .catch(err => {
    console.error(err);
    setMessage("Delete error");
  });
}

// GUEST
function guest() {
  localStorage.setItem("user", "guest");
  window.location = "chat.html";
}

// CHAT SYSTEM (frontend-only memory)
function loadChats() {
  chats = JSON.parse(localStorage.getItem("chats") || "{}");
  if (!chats[currentChat]) chats[currentChat] = [];
}

function saveChats() {
  localStorage.setItem("chats", JSON.stringify(chats));
}

function renderChats() {
  let list = document.getElementById("chatList");
  list.innerHTML = "";

  Object.keys(chats).forEach(name => {
    list.innerHTML += `<div onclick="switchChat('${name}')" class="p-2 cursor-pointer bg-gray-200 mb-1 rounded">${name}</div>`;
  });

  document.getElementById("chatTitle").innerText = "Chat: " + currentChat;
}

function switchChat(name) {
  currentChat = name;
  renderMessages();
  renderChats();
}

function newChat() {
  currentChat = "Chat " + (Object.keys(chats).length + 1);
  chats[currentChat] = [];
  saveChats();
  renderChats();
  renderMessages(); // <-- ensure messages are updated
}

function renameChat() {
  let newName = document.getElementById("renameInput").value;
  if (!newName) return;
  chats[newName] = chats[currentChat];
  delete chats[currentChat];
  currentChat = newName;
  saveChats();
  renderChats();      // refresh sidebar
  renderMessages();   // refresh messages
}

function deleteChat() {
  delete chats[currentChat];
  currentChat = "New Chat";
  chats[currentChat] = [];
  saveChats();
  renderChats();      // refresh sidebar
  renderMessages();   // refresh messages
}

function logout() {
  // Clear user session if any
  localStorage.removeItem("user");
  // Redirect to login page
  window.location.href = "login.html";
}

function renderMessages() {
  let box = document.getElementById("chatBox");
  box.innerHTML = "";

  chats[currentChat].forEach(m => {

    let content = m.content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\* /gm, '• ')
      .replace(/\n/g, '<br>');

    if (m.role === "user") {
      // USER BUBBLE (RIGHT SIDE)
      box.innerHTML += `
        <div class="flex justify-end mb-2">
          <div class="bg-blue-500 text-white px-4 py-2 rounded-2xl max-w-xs shadow">
            ${content}
          </div>
        </div>
      `;
    } else {
      // BOT BUBBLE (LEFT SIDE)
      box.innerHTML += `
        <div class="flex justify-start mb-2">
          <div class="bg-white text-gray-800 px-4 py-2 rounded-2xl max-w-md shadow border">
            ${content}
          </div>
        </div>
      `;
    }

  });

  // Auto scroll down
  box.scrollTop = box.scrollHeight;
}

// SEND MESSAGE
function send() {
  let input = document.getElementById("msg");
  let message = input.value;
  if (!message) return;

  chats[currentChat].push({role:"user", content:message});
  input.value = "";
  renderMessages();

  fetch(API + "/chat", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ message })
  })
  .then(res => res.json())
  .then(data => {
    chats[currentChat].push({role:"assistant", content:data.response});
    saveChats();
    renderMessages();
  });
}

function sendEmoji(e) {
  document.getElementById("msg").value = e;
  send();
}

// INIT
window.onload = function() {
  loadChats();
  renderChats();
  renderMessages();

  // Enable Enter to send
  document.getElementById("msg").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
      send();
    }
  });
};