
const form = document.getElementById("taskForm");
const titleInput = document.getElementById("taskTitle");
const descriptionInput = document.getElementById("taskDescription");
const dateInput = document.getElementById("taskDate");
const priorityInput = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const filterInput = document.getElementById("filter");
const submitBtn = document.getElementById("submitBtn");
const cancelEdit = document.getElementById("cancelEdit");

let tasks = [];
let editingId = null;

try {
  tasks = JSON.parse(localStorage.getItem("studentTasks") || "[]");
  if (!Array.isArray(tasks)) tasks = [];
} catch {
  tasks = [];
}

function saveTasks() {
  localStorage.setItem("studentTasks", JSON.stringify(tasks));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function renderTasks() {
  document.getElementById("total").textContent = tasks.length;
  document.getElementById("pending").textContent =
    tasks.filter(task => !task.completed).length;
  document.getElementById("completed").textContent =
    tasks.filter(task => task.completed).length;

  const filter = filterInput.value;
  const visibleTasks = tasks.filter(task => {
    if (filter === "Pending") return !task.completed;
    if (filter === "Completed") return task.completed;
    return true;
  });

  if (visibleTasks.length === 0) {
    taskList.innerHTML =
      '<div class="empty">No tasks found. Add your first task!</div>';
    return;
  }

  taskList.innerHTML = visibleTasks.map(task => `
    <article class="task-card ${task.completed ? "done" : ""}">
      <h3>${escapeHTML(task.title)}</h3>
      <p>${escapeHTML(task.description || "No description")}</p>
      <div class="task-meta">
        Due: ${escapeHTML(task.date || "Not set")} |
        Priority: <span class="priority">${escapeHTML(task.priority)}</span> |
        ${task.completed ? "Completed" : "Pending"}
      </div>
      <button data-action="toggle" data-id="${escapeHTML(task.id)}">
        ${task.completed ? "Mark Pending" : "Complete"}
      </button>
      <button data-action="edit" data-id="${escapeHTML(task.id)}">
        Edit
      </button>
      <button data-action="delete" data-id="${escapeHTML(task.id)}"
        class="secondary">Delete</button>
    </article>
  `).join("");
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (!title) return;

  const data = {
    title,
    description: descriptionInput.value.trim(),
    date: dateInput.value,
    priority: priorityInput.value
  };

  if (editingId !== null) {
    tasks = tasks.map(task =>
      task.id === editingId ? { ...task, ...data } : task
    );
  } else {
    tasks.unshift({
      id: String(Date.now()) + Math.random().toString(16).slice(2),
      ...data,
      completed: false
    });
  }

  saveTasks();
  form.reset();
  editingId = null;
  submitBtn.textContent = "+ Add Task";
  cancelEdit.classList.add("hidden");
  renderTasks();
});

taskList.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const task = tasks.find(item => item.id === button.dataset.id);
  if (!task) return;

  const action = button.dataset.action;

  if (action === "toggle") {
    task.completed = !task.completed;
  } else if (action === "delete") {
    if (!confirm("Are you sure you want to delete this task?")) return;
    tasks = tasks.filter(item => item.id !== task.id);
    if (editingId === task.id) resetForm();
  } else if (action === "edit") {
    editingId = task.id;
    titleInput.value = task.title;
    descriptionInput.value = task.description || "";
    dateInput.value = task.date || "";
    priorityInput.value = task.priority || "Medium";
    submitBtn.textContent = "Save Changes";
    cancelEdit.classList.remove("hidden");
    titleInput.focus();
    return;
  }

  saveTasks();
  renderTasks();
});

function resetForm() {
  form.reset();
  editingId = null;
  submitBtn.textContent = "+ Add Task";
  cancelEdit.classList.add("hidden");
}

cancelEdit.addEventListener("click", resetForm);
filterInput.addEventListener("change", renderTasks);

renderTasks();
