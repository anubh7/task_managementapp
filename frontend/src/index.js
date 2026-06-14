let authToken = localStorage.getItem("authToken");
let currentUsername = localStorage.getItem("username");
let currentIsAdmin = localStorage.getItem("isAdmin") === "true";

// Use production API when deployed, localhost for local development
const API_URL = window.location.hostname === "localhost"
  ? `http://localhost:5000/api`
  : "https://task-managementapp-2.onrender.com/api";

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
const locationBtn = document.getElementById("location-btn");
const locationDisplay = document.getElementById("location-display");
const mapContainer = document.getElementById("map");
const adminLocationPanel = document.getElementById("admin-location-panel");
const sharedLocationList = document.getElementById("shared-location-list");

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

function requestLocationPermission() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error("Geolocation request timed out."));
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve(position);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
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
  if (locationDisplay) {
    locationDisplay.textContent = message;
  }

  if (!isAdminUser()) {
    return;
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
    loadSharedLocations();
    locationBtn.style.display = "inline-block";
    adminLocationPanel.style.display = "block";
  } else {
    locationDisplay.textContent = "";
    mapContainer.style.display = "none";
    locationBtn.style.display = "none";
    adminLocationPanel.style.display = "none";
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
      if (navigator.geolocation) {
        requestLocation();
        startLocationTracking();
      }
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
      if (navigator.geolocation) {
        requestLocation();
        startLocationTracking();
      }
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

function attachEventListeners() {
  registerBtn.addEventListener("click", registerUser);
  registerForm.addEventListener("submit", registerUser);
  loginBtn.addEventListener("click", loginUser);
  loginForm.addEventListener("submit", loginUser);
  logoutBtn.addEventListener("click", logoutUser);
  document.getElementById("show-register").addEventListener("click", showRegisterForm);
  document.getElementById("show-login").addEventListener("click", showLoginForm);
  locationBtn.addEventListener("click", toggleLocationTracking);
}

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

async function loadSharedLocations() {
  if (!authToken || !isAdminUser()) return;

  try {
    const response = await fetch(`${API_URL}/tasks/location/all`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      console.error("Failed to load shared locations");
      return;
    }

    const data = await response.json();
    sharedLocationList.innerHTML = "";

    if (!Array.isArray(data.locations) || data.locations.length === 0) {
      sharedLocationList.innerHTML = "<li>No user locations shared yet.</li>";
      return;
    }

    data.locations.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.username}: ${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)} (${new Date(item.location.updatedAt).toLocaleString()})`;
      sharedLocationList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading shared locations:", error);
  }
}

function initApp() {
  // Initialize quotes
  rotateQuote();
  setInterval(rotateQuote, 8000);

  // Attach event listeners
  attachEventListeners();
  
  if (authToken && currentUsername) {
    userDisplay.textContent = `Logged in as: ${currentUsername}`;
    showTaskApp();
  } else {
    clearAuthData();
    showLoginForm();
  }
}

document.addEventListener("DOMContentLoaded", initApp);