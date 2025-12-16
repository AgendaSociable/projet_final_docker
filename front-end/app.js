const API_BASE_URL = "http://localhost:8000";
async function loadUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    if (!response.ok) {
      throw new Error("Erreur API " + response.status);
    }

    const users = await response.json();

    const countSpan = document.getElementById("user-count");
    countSpan.textContent = users.length;

    const container = document.getElementById("users-container");
    container.innerHTML = "";

    users.forEach((user) => {
      const userDiv = document.createElement("div");
      userDiv.className = "user-block";

      const line = document.createElement("p");
      line.innerHTML = `<strong>${user.name}</strong> : <span id="counter-${user.id}">${user.counter}</span>`;

      const btn = document.createElement("button");
      btn.textContent = "increment counter";
      btn.addEventListener("click", () => incrementUserCounter(user.id));

      userDiv.appendChild(line);
      userDiv.appendChild(btn);
      container.appendChild(userDiv);
    });
  } catch (err) {
    console.error(err);
    document.getElementById("user-count").textContent = "Erreur";
  }
}

async function handleAddUser(event) {
  event.preventDefault();

  const input = document.getElementById("username-input");
  const name = input.value.trim();
  if (!name) return;

  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error("Erreur API " + response.status);
    }

    input.value = "";
    await loadUsers(); 
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur :", err);
  }
}

async function incrementUserCounter(userId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/increment`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error("Erreur API " + response.status);
    }

    const updatedUser = await response.json();

    const span = document.getElementById(`counter-${userId}`);
    if (span) {
      span.textContent = updatedUser.counter;
    }
  } catch (err) {
    console.error("Erreur lors de l'incrément :", err);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadUsers();

  document
    .getElementById("refresh-btn")
    .addEventListener("click", loadUsers);


  document
    .getElementById("add-user-form")
    .addEventListener("submit", handleAddUser);
});
