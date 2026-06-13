let authToken = localStorage.getItem("authToken");
let currentUsername = localStorage.getItem("username");
const API_URL = "http://localhost:5000/api";

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

function showLoginForm() {
  registerForm.style.display = "none";
  loginForm.style.display = "block";
  authContainer.style.display = "block";
  taskContainer.style.display = "none";
}

function showRegisterForm() {
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
loginBtn.addEventListener("click", loginUser);
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
  if (authToken && currentUsername) {
    userDisplay.textContent = `Logged in as: ${currentUsername}`;
    showTaskApp();
  } else {
    clearAuthData();
    showLoginForm();
  }
}

document.addEventListener("DOMContentLoaded", initApp);
