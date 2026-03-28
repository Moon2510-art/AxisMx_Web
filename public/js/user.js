const API = "/api";
const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");

function init() {
    if (!token) {
        window.location.href = "/login.html";
        return;
    }

    loadUser();

    window.addEventListener("click", (e) => {
        const modal = document.getElementById("passwordModal");
        if (e.target === modal) closePasswordModal();
    });
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
        renderUser(json.data);

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
    if (statusEl) {
        statusEl.textContent = user.status;
        statusEl.className = "status-badge";

        if (user.status === "Activo") {
            statusEl.classList.add("activo");
        }
    }

    let progress = 0;
    if (user.email) progress += 20;
    if (user.phone) progress += 20;
    if (user.matricula) progress += 20;
    if (user.employee_number) progress += 20;
    if (user.company) progress += 20;

    const bar = document.getElementById("profileProgress");
    if (bar) bar.style.width = progress + "%";
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "-";
}

async function changePassword() {
    const current = document.getElementById("currentPassword")?.value;
    const newPass = document.getElementById("newPassword")?.value;
    const confirm = document.getElementById("confirmPassword")?.value;

    if (!current || !newPass || !confirm) {
        alert("Completa todos los campos");
        return;
    }

    if (newPass.length < 6) {
        alert("La nueva contraseña debe tener al menos 6 caracteres");
        return;
    }

    if (newPass !== confirm) {
        alert("Las contraseñas no coinciden");
        return;
    }

    try {
        const res = await fetch(`${API}/auth/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            },
            body: JSON.stringify({
                current_password: current,
                new_password: newPass,
                new_password_confirmation: confirm
            })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Error al cambiar contraseña");
        }

        alert("Contraseña actualizada");

        closePasswordModal();

    } catch (err) {
        alert(err.message);
        console.error(err);
    }
}

function openPasswordModal() {
    document.getElementById("passwordModal")?.classList.add("show");
}

function closePasswordModal() {
    document.getElementById("passwordModal")?.classList.remove("show");

    ["currentPassword","newPassword","confirmPassword"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

function logout() {
    const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");

    if (token) {
        fetch("/api/auth/logout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        }).catch(() => {});
    }

    sessionStorage.clear();
    localStorage.removeItem("auth_token");

    window.location.href = "/login.html";
}
init();