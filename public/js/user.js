const API = "/api";
const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token")

document.addEventListener("DOMContentLoaded", init);

function init() {
    if (!token) {
        window.location.href = "/login.html";
        return;
    }

    loadUser();
}

async function loadUser() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    try {
        const res = await fetch(`${API}/users/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        });

        if (!res.ok) throw new Error("Error al cargar usuario");

        const json = await res.json();
        const user = json.data;

        renderUser(user);

    } catch (e) {
        console.error(e);
    }
}

function renderUser(user) {

    setText("name", user.name);
    setText("role", user.role);

    setText("email", user.email);
    setText("phone", user.phone);
    setText("company", user.company);

    setText("matricula", user.matricula);
    setText("employee", user.employee_number);
    setText("roleDetail", user.role);

    setText("emailDetail", user.email);
    setText("phoneDetail", user.phone);

    const statusEl = document.getElementById("status");
    statusEl.textContent = user.status;
    statusEl.className = "status-badge";

    if (user.status === "Activo") {
        statusEl.classList.add("activo");
    }

    let progress = 0;
    if (user.email) progress += 20;
    if (user.phone) progress += 20;
    if (user.matricula) progress += 20;
    if (user.employee_number) progress += 20;
    if (user.company) progress += 20;

    document.getElementById("profileProgress").style.width = progress + "%";
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "-";
}