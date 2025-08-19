let tasks = [];
const API_URL = "/api/tasks";

async function fetchTasks(filter = "all") {
  const res = await fetch(API_URL);
  tasks = await res.json();
  renderTasks(filter);
}

async function addTask(e) {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const dueDate = document.getElementById("dueDate").value;
  const priority = document.getElementById("priority").value;
  const description = document.getElementById("description").value;

  const task = { title, dueDate, priority, description, completed: false };

  await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });

  document.querySelector(".task-form").reset();
  fetchTasks();
}

function renderTasks(filter = "all") {
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  let filtered = tasks;

  if (filter === "completed") filtered = tasks.filter((t) => t.completed);
  else if (filter === "incomplete")
    filtered = tasks.filter((t) => !t.completed);
  else if (filter === "high")
    filtered = tasks.filter((t) => t.priority === "High");
  else if (filter === "medium")
    filtered = tasks.filter((t) => t.priority === "Medium");
  else if (filter === "low")
    filtered = tasks.filter((t) => t.priority === "Low");

  filtered.forEach((task) => {
    const div = document.createElement("div");
    div.className = "task" + (task.completed ? " complete" : "");
    div.innerHTML = `
      <strong>${task.title}</strong><br>${task.priority} Priority<br>Date: ${
      task.dueDate.split("T")[0]
    }<br>
      Description: ${task.description || ""}
      <br>
      <div class="task-buttons">
        <button onclick="toggleComplete('${task._id}')">${
      task.completed ? "Undo" : "Complete"
    }</button>
        <button onclick="startEditTask('${task._id}')">Edit</button>
        <button onclick="deleteTask('${task._id}')">Delete</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function filterTasks() {
  const value = document.getElementById("filter").value;
  renderTasks(value);
}

async function toggleComplete(id) {
  const task = tasks.find((t) => t._id === id);
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...task, completed: !task.completed }),
  });
  fetchTasks(document.getElementById("filter").value);
}

async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  fetchTasks(document.getElementById("filter").value);
}

async function clearCompletedTasks() {
  await fetch(`${API_URL}/completed`, { method: "DELETE" });
  fetchTasks(document.getElementById("filter").value);
}

async function clearAllTasks() {
  if (confirm("Are you sure you want to delete all tasks?")) {
    await fetch(API_URL, { method: "DELETE" });
    fetchTasks();
  }
}

function startEditTask(id) {
  const task = tasks.find((t) => t._id === id);
  document.getElementById("title").value = task.title;
  document.getElementById("dueDate").value = task.dueDate.split("T")[0];
  document.getElementById("priority").value = task.priority;
  document.getElementById("description").value = task.description;

  document.querySelector(".task-form").onsubmit = (e) => updateTask(e, id);
}

async function updateTask(e, id) {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const dueDate = document.getElementById("dueDate").value;
  const priority = document.getElementById("priority").value;
  const description = document.getElementById("description").value;

  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, dueDate, priority, description }),
  });

  document.querySelector(".task-form").reset();
  document.querySelector(".task-form").onsubmit = addTask;
  fetchTasks();
}

fetchTasks();
