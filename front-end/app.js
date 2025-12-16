const API_BASE_URL = "http://localhost:8000"; // FastAPI exposé sur l’hôte

async function loadUserCount() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error("Erreur API " + response.status);
    }
    const users = await response.json();
    const countSpan = document.getElementById("user-count");
    countSpan.textContent = users.length;
  } catch (err) {
    console.error(err);
    document.getElementById("user-count").textContent = "Erreur";
  }
}

document.getElementById("refresh-btn").addEventListener("click", loadUserCount);

window.addEventListener("DOMContentLoaded", loadUserCount);
