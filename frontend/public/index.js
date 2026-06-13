let authToken = localStorage.getItem("authToken");
let currentUsername = localStorage.getItem("username");
let currentIsAdmin = localStorage.getItem("isAdmin") === "true";
const API_URL = "https://task-managementapp-2back.onrender.com/api";

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
const locationBtn = document.getElementById("location-btn");
const locationDisplay = document.getElementById("location-display");
const mapContainer = document.getElementById("map");

let map = null;
let locationMarker = null;
let locationWatchId = null;

function isAdminUser() {
  return currentIsAdmin;
}

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
  currentIsAdmin = !!data.isAdmin;
  localStorage.setItem("authToken", authToken);
  localStorage.setItem("username", currentUsername);
  localStorage.setItem("isAdmin", currentIsAdmin.toString());
  userDisplay.textContent = `Logged in as: ${currentUsername}`;
}

function clearAuthData() {
  authToken = null;
  currentUsername = null;
  currentIsAdmin = false;
  localStorage.removeItem("authToken");
  localStorage.removeItem("username");
  localStorage.removeItem("isAdmin");
  userDisplay.textContent = "";
  locationDisplay.textContent = "";
  if (mapContainer) {
    mapContainer.style.display = "none";
  }
  stopLocationTracking();
}

function initMap() {
  if (!map) {
    map = L.map("map").setView([0, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }
  mapContainer.style.display = "block";
}

function showLocation(message, latitude, longitude) {
  if (!isAdminUser()) {
    return;
  }

  if (locationDisplay) {
    locationDisplay.textContent = message;
  }

  if (typeof latitude === "number" && typeof longitude === "number") {
    initMap();
    if (locationMarker) {
      locationMarker.setLatLng([latitude, longitude]);
    } else {
      locationMarker = L.marker([latitude, longitude]).addTo(map);
    }
    map.setView([latitude, longitude], 13);
  }
}

function stopLocationTracking() {
  if (locationWatchId !== null) {
    navigator.geolocation.clearWatch(locationWatchId);
    locationWatchId = null;
  }
  if (locationBtn) {
    locationBtn.textContent = "Start Tracking Location";
  }
}

function startLocationTracking() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  if (locationBtn) {
    locationBtn.textContent = "Stop Tracking Location";
  }

  if (isAdminUser()) {
    showLocation("Starting live location tracking...");
  }

  locationWatchId = navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      if (isAdminUser()) {
        showLocation(`Live location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, latitude, longitude);
      }
      await sendLocationToServer(latitude, longitude);
    },
    (error) => {
      console.error("Geolocation error:", error);
      alert("Location permission denied or unavailable.");
      showLocation("Unable to track location.");
      stopLocationTracking();
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000
    }
  );
}

function toggleLocationTracking() {
  if (locationWatchId !== null) {
    stopLocationTracking();
    showLocation("Location tracking stopped.");
  } else {
    startLocationTracking();
  }
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

  if (isAdminUser()) {
    loadLocation();
    locationBtn.style.display = "inline-block";
  } else {
    locationDisplay.textContent = "";
    mapContainer.style.display = "none";
    locationBtn.style.display = "none";
    stopLocationTracking();
  }
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
      requestLocation();
      startLocationTracking();
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
      requestLocation();
      startLocationTracking();
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    alert("Error logging in. Check console.");
    console.error(error);
  }
}

async function logoutUser() {
  clearAuthData();
  taskList.innerHTML = "";
  locationDisplay.textContent = "";
  showLoginForm();
}

async function sendLocationToServer(latitude, longitude) {
  try {
    const response = await fetch(`${API_URL}/tasks/location`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ latitude, longitude })
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.message || "Unable to update location");
      return;
    }

    const data = await response.json();
    showLocation(`Location shared: ${data.location.latitude.toFixed(4)}, ${data.location.longitude.toFixed(4)}`, data.location.latitude, data.location.longitude);
  } catch (error) {
    console.error("Error sending location:", error);
    alert("Could not send location to server.");
  }
}

function requestLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  showLocation("Requesting location...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      sendLocationToServer(latitude, longitude);
    },
    (error) => {
      console.error("Geolocation error:", error);
      alert("Location permission denied or unavailable.");
      showLocation("");
    }
  );
}

registerBtn.addEventListener("click", registerUser);
registerForm.addEventListener("submit", registerUser);
loginBtn.addEventListener("click", loginUser);
loginForm.addEventListener("submit", loginUser);
logoutBtn.addEventListener("click", logoutUser);
document.getElementById("show-register").addEventListener("click", showRegisterForm);
document.getElementById("show-login").addEventListener("click", showLoginForm);
locationBtn.addEventListener("click", toggleLocationTracking);

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

async function loadLocation() {
  if (!authToken) return;

  try {
    const response = await fetch(`${API_URL}/tasks/location`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    if (data.location) {
      showLocation(`Last shared location: ${data.location.latitude.toFixed(4)}, ${data.location.longitude.toFixed(4)}`, data.location.latitude, data.location.longitude);
    } else {
      showLocation("Location not shared yet.");
    }
  } catch (error) {
    console.error("Error loading location:", error);
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
