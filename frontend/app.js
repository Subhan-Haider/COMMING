const API_BASE = window.VOIDFORGE_API_BASE || "";
const launchDate = new Date(window.VOIDFORGE_LAUNCH_DATE || "2026-12-31T23:59:59-05:00");

const ids = ["days", "hours", "minutes", "seconds"];
const countdownEls = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
const form = document.getElementById("subscribe-form");
const emailInput = document.getElementById("email");
const formMessage = document.getElementById("form-message");

function pad(value, size = 2) {
  return String(value).padStart(size, "0");
}

function updateCountdown() {
  const remaining = Math.max(0, launchDate.getTime() - Date.now());
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining / 3_600_000) % 24);
  const minutes = Math.floor((remaining / 60_000) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  countdownEls.days.textContent = pad(days, 3);
  countdownEls.hours.textContent = pad(hours);
  countdownEls.minutes.textContent = pad(minutes);
  countdownEls.seconds.textContent = pad(seconds);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "Transmitting signal...";

  try {
    const response = await fetch(`${API_BASE}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput.value.trim() }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Subscription failed");
    form.reset();
    formMessage.textContent = data.message || "Signal locked. Welcome to VOIDFORGE.";
  } catch (error) {
    formMessage.textContent = error.message || "Unable to reach the VOIDFORGE relay.";
  }
});

updateCountdown();
setInterval(updateCountdown, 1000);
