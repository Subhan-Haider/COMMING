const API_BASE = window.VOIDFORGE_API_BASE || "";
const loginPanel = document.getElementById("login-panel");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const dashboardMessage = document.getElementById("dashboard-message");
const rows = document.getElementById("subscriber-rows");
const totalCount = document.getElementById("total-count");
const activeCount = document.getElementById("active-count");
const refreshButton = document.getElementById("refresh");
const logoutButton = document.getElementById("logout");

let authHeader = sessionStorage.getItem("voidforgeAdminAuth") || "";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  })[character]);
}

function setLoggedIn(value) {
  loginPanel.hidden = value;
  dashboard.hidden = !value;
}

function formatDate(date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Admin request failed.");
  return data;
}

async function loadSubscribers() {
  dashboardMessage.textContent = "Syncing registry...";
  const data = await api("/api/admin/subscribers");
  totalCount.textContent = data.total;
  activeCount.textContent = data.active;
  rows.innerHTML = data.subscribers.map((subscriber) => `
    <tr>
      <td>${escapeHtml(subscriber.email)}</td>
      <td>${escapeHtml(subscriber.status)}</td>
      <td>${escapeHtml(formatDate(subscriber.createdAt))}</td>
      <td><button class="danger-button" data-id="${subscriber._id}" type="button">Delete</button></td>
    </tr>
  `).join("");
  dashboardMessage.textContent = data.total ? "Registry online." : "No subscribers yet.";
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  authHeader = `Basic ${btoa(`${username}:${password}`)}`;
  loginMessage.textContent = "Authenticating...";

  try {
    await loadSubscribers();
    sessionStorage.setItem("voidforgeAdminAuth", authHeader);
    setLoggedIn(true);
    loginMessage.textContent = "";
  } catch (error) {
    sessionStorage.removeItem("voidforgeAdminAuth");
    authHeader = "";
    loginMessage.textContent = error.message;
  }
});

rows.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-id]");
  if (!button) return;

  dashboardMessage.textContent = "Deleting subscriber...";
  try {
    await api(`/api/admin/subscribers/${button.dataset.id}`, { method: "DELETE" });
    await loadSubscribers();
  } catch (error) {
    dashboardMessage.textContent = error.message;
  }
});

refreshButton.addEventListener("click", () => {
  loadSubscribers().catch((error) => {
    dashboardMessage.textContent = error.message;
  });
});

logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem("voidforgeAdminAuth");
  authHeader = "";
  setLoggedIn(false);
});

if (authHeader) {
  loadSubscribers()
    .then(() => setLoggedIn(true))
    .catch(() => {
      sessionStorage.removeItem("voidforgeAdminAuth");
      authHeader = "";
      setLoggedIn(false);
    });
} else {
  setLoggedIn(false);
}
