let authToken = localStorage.getItem("authToken");
let currentUsername = localStorage.getItem("username");
const API_URL = "https://task-managementapp-2.onrender.com/api";

// ============ Quotes Background ============
const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It's not about having time, it's about making time.", author: "Unknown" },
  { text: "Small daily improvements lead to stunning results.", author: "Robin Sharma" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Productivity is never an accident. It is always the result of commitment to excellence.", author: "Paul J. Meyer" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The key is not to prioritize your schedule, but to schedule your priorities.", author: "Stephen Covey" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" }
];

let currentQuoteIndex = 0;

function rotateQuote() {
  const quoteText = document.getElementById("quote-text");
  const quoteAuthor = document.getElementById("quote-author");
  
  if (quoteText && quoteAuthor) {
    const quote = quotes[currentQuoteIndex];
    quoteText.textContent = quote.text;
    quoteAuthor.textContent = quote.author;
    
    currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
  }
}


// ============ DOM Elements ============
const authContainer = document.getElementById("auth-container");
const taskContainer = document.getElementById("task-container");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const userDisplay = document.getElementById("user-display");
const logoutBtn = document.getElementById("logout-btn");
const registerBtn = document.getElementById("register-btn");
const loginBtn = document.getElementById("login-btn");

function getAuthHeaders(additionalHeaders = {}) {
  const headers = { ...additionalHeaders };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  return headers;
}

function setAuthData(data) {
  authToken = data.token;
  currentUsername = data.username;
  localStorage.setItem("authToken", authToken);
  localStorage.setItem("username", currentUsername);
  userDisplay.textContent = `Logged in as: ${currentUsername}`;
}

function clearAuthData() {
  authToken = null;
  currentUsername = null;
  localStorage.removeItem("authToken");
  localStorage.removeItem("username");
  userDisplay.textContent = "";
}

function showLoginForm(event) {
  if (event) event.preventDefault();
  registerForm.style.display = "none";
  loginForm.style.display = "block";
  authContainer.style.display = "block";
  taskContainer.style.display = "none";
}

function showRegisterForm(event) {
  if (event) event.preventDefault();
  registerForm.style.display = "block";
  loginForm.style.display = "none";
}

function showTaskApp() {
  authContainer.style.display = "none";
  taskContainer.style.display = "block";
  loadTasks();
}

async function registerUser(event) {
  event.preventDefault();

  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  if (!username || !password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      setAuthData(data);
      document.getElementById("register-username").value = "";
      document.getElementById("register-password").value = "";
      showTaskApp();
    } else {
      alert(data.message || "Registration failed");
    }
  } catch (error) {
    alert("Error registering. Check console.");
    console.error(error);
  }
}

async function loginUser(event) {
  event.preventDefault();

  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  if (!username || !password) {
    alert("Please fill in all fields");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      setAuthData(data);
      document.getElementById("login-username").value = "";
      document.getElementById("login-password").value = "";
      showTaskApp();
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    alert("Error logging in. Check console.");
    console.error(error);
  }
}

function logoutUser() {
  clearAuthData();
  taskList.innerHTML = "";
  showLoginForm();
}

registerBtn.addEventListener("click", registerUser);
registerForm.addEventListener("submit", registerUser);
loginBtn.addEventListener("click", loginUser);
loginForm.addEventListener("submit", loginUser);
logoutBtn.addEventListener("click", logoutUser);
document.getElementById("show-register").addEventListener("click", showRegisterForm);
document.getElementById("show-login").addEventListener("click", showLoginForm);

async function loadTasks() {
  if (!authToken) return;

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      clearAuthData();
      alert("Session expired. Please log in again.");
      showLoginForm();
      return;
    }

    const tasks = await response.json();
    taskList.innerHTML = "";

    if (!Array.isArray(tasks) || tasks.length === 0) {
      taskList.innerHTML = "<li>No tasks yet. Create one!</li>";
      return;
    }

    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = task.completed ? "completed" : "";
      li.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleTask(${task.id}, this.checked)">
        <span>${task.title}</span>
        <button onclick="deleteTask(${task.id})">Delete</button>
      `;
      taskList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ title })
    });

    if (response.ok) {
      taskInput.value = "";
      loadTasks();
    } else if (response.status === 401) {
      clearAuthData();
      showLoginForm();
      alert("Session expired. Please log in again.");
    } else {
      const data = await response.json();
      alert(data.message || "Error creating task");
    }
  } catch (error) {
    console.error("Error creating task:", error);
  }
});

async function toggleTask(taskId, completed) {
  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ completed })
    });

    if (response.status === 401) {
      clearAuthData();
      showLoginForm();
      alert("Session expired. Please log in again.");
      return;
    }

    loadTasks();
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

async function deleteTask(taskId) {
  if (!confirm("Are you sure?")) return;

  try {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    if (response.status === 401) {
      clearAuthData();
      showLoginForm();
      alert("Session expired. Please log in again.");
      return;
    }

    loadTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

function initApp() {
  // Initialize quotes
  rotateQuote();
  setInterval(rotateQuote, 8000); // Rotate every 8 seconds
  
  if (authToken && currentUsername) {
    userDisplay.textContent = `Logged in as: ${currentUsername}`;
    showTaskApp();
  } else {
    clearAuthData();
    showLoginForm();
  }
}

document.addEventListener("DOMContentLoaded", initApp);