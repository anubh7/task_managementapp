const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const taskList = document.getElementById("task-list");

const API_URL = "http://localhost:5000/api/tasks";

async function loadTasks() {
  try {
    const response = await fetch(API_URL);
    const tasks = await response.json();

    taskList.innerHTML = "";

    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.textContent = task.title;
      taskList.appendChild(li);
    });
  } catch (error) {
    taskList.innerHTML = "<li>Backend not running yet</li>";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = input.value.trim();
  if (!title) return;

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title })
    });

    input.value = "";
    loadTasks();
  } catch (error) {
    alert("Could not add task. Is backend running?");
  }
});

loadTasks();