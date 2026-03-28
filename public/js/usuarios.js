const API = "/api/users";
const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");

let currentEditId = null; 

document.addEventListener("DOMContentLoaded", () => {

    if (!token) {
        window.location.href = "/login.html";
        return;
    }

    loadUsers();

    let timeout;

    document.getElementById("search")?.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(loadUsers, 400);
    });

    document.getElementById("empresa")?.addEventListener("change", loadUsers);
    document.getElementById("estado")?.addEventListener("change", loadUsers);
});

document.getElementById("userCard")?.addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
        window.location.href = `/user.html?id=${user.id}`;
    }
});

async function loadUsers() {

    const params = new URLSearchParams({
        search: document.getElementById("search")?.value || "",
        empresa: document.getElementById("empresa")?.value || "",
        estado: document.getElementById("estado")?.value || ""
    });

    try {
        const res = await fetch(`${API}?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("BACKEND ERROR:", text);
            throw new Error("Error al cargar usuarios");
        }

        const json = await res.json();
        renderTable(json.data);

    } catch (err) {
        console.error(err);
        showError("Error al cargar usuarios");
    }
}

function renderTable(data) {

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="9">Sin resultados</td></tr>`;
        return;
    }

    data.forEach(user => {

        const estadoClass = user.status === "Activo" ? "active" : "inactive";

        tbody.innerHTML += `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.matricula || "-"}</td>
            <td>${user.employee_number || "-"}</td>
            <td>${user.email}</td>
            <td>${user.phone || "-"}</td>
            <td>${user.company || "-"}</td>
            <td>${user.role || "-"}</td>
            <td><span class="status ${estadoClass}">${user.status}</span></td>
            <td class="actions">
                <button class="btn small" onclick="editUser(${user.id})">Editar</button>
                <button class="btn small" onclick="deleteUser(${user.id})">Eliminar</button>
                <button class="btn small" onclick="toggleUser(${user.id}, '${user.status}')">
                    ${user.status === "Activo" ? "Suspender" : "Activar"}
                </button>
            </td>
        </tr>`;
    });
}

function showError(msg) {
    document.getElementById("tableBody").innerHTML =
        `<tr><td colspan="9">${msg}</td></tr>`;
}

async function deleteUser(id) {

    if (!confirm("¿Eliminar usuario permanentemente?")) return;

    try {
        const res = await fetch(`${API}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        });

        if (!res.ok) throw new Error();

        loadUsers();

    } catch {
        alert("Error al eliminar");
    }
}

async function toggleUser(id, status) {

    const action = status === "Activo" ? "suspend" : "activate";

    try {
        const res = await fetch(`/api/users/${id}/${action}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        });

        if (!res.ok) throw new Error();

        loadUsers();

    } catch {
        alert("Error al actualizar estado");
    }
}

async function editUser(id) {

    currentEditId = id; 

    try {
        const res = await fetch(`${API}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        });

        const json = await res.json();
        const user = json.data;

        const nameParts = (user.name || "").split(" ");

        document.getElementById("nombre").value = nameParts[0] || "";
        document.getElementById("ap_paterno").value = nameParts[1] || "";
        document.getElementById("ap_materno").value = nameParts[2] || "";

        document.getElementById("email").value = user.email || "";
        document.getElementById("telefono").value = user.phone || "";
        document.getElementById("matricula").value = user.matricula || "";
        document.getElementById("numero_empleado").value = user.employee_number || "";
        document.getElementById("empresaInput").value = user.company || "";
        document.getElementById("rol").value = user.ID_Rol || "";

        document.getElementById("password").value = "";

        document.querySelector("#userModal h3").textContent = "Editar Usuario";
        document.querySelector("#userModal .btn:not(.cancel)").onclick = updateUser;

        document.getElementById("userModal").classList.add("show");

    } catch (err) {
        console.error(err);
        alert("Error al cargar usuario");
    }
}

async function updateUser() {

    if (!currentEditId) {
        alert("Error: ID no definido");
        return;
    }

    const data = {
        Nombre: document.getElementById("nombre")?.value,
        Ap_Paterno: document.getElementById("ap_paterno")?.value,
        Ap_Materno: document.getElementById("ap_materno")?.value,
        Email: document.getElementById("email")?.value,
        Telefono: document.getElementById("telefono")?.value,
        Matricula: document.getElementById("matricula")?.value,
        Numero_Empleado: document.getElementById("numero_empleado")?.value,
        Empresa: document.getElementById("empresaInput")?.value,
        ID_Rol: document.getElementById("rol")?.value
    };

    try {
        const res = await fetch(`${API}/${currentEditId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error();

        alert("Usuario actualizado");

        closeUserModal();
        loadUsers();

    } catch {
        alert("Error al actualizar");
    }
}

function createUser() {

    currentEditId = null; 

    clearForm(); 

    document.querySelector("#userModal h3").textContent = "Nuevo Usuario";
    document.querySelector("#userModal .btn:not(.cancel)").onclick = saveUser;

    document.getElementById("userModal").classList.add("show");
}

async function saveUser() {

    const data = {
        Nombre: document.getElementById("nombre")?.value,
        Ap_Paterno: document.getElementById("ap_paterno")?.value,
        Ap_Materno: document.getElementById("ap_materno")?.value,
        Email: document.getElementById("email")?.value,
        Telefono: document.getElementById("telefono")?.value,
        Matricula: document.getElementById("matricula")?.value,
        Numero_Empleado: document.getElementById("numero_empleado")?.value,
        Empresa: document.getElementById("empresaInput")?.value,
        Contrasena: document.getElementById("password")?.value,
        ID_Rol: document.getElementById("rol")?.value
    };

    if (!data.Nombre || !data.Ap_Paterno || !data.Email || !data.Contrasena) {
        alert("Completa los campos obligatorios");
        return;
    }

    if (!data.Matricula && !data.Numero_Empleado) {
        alert("Debes ingresar Matrícula o Número de Empleado");
        return;
    }

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error();

        alert("Usuario creado");

        closeUserModal();
        loadUsers();
        clearForm();

    } catch {
        alert("Error al guardar usuario");
    }
}

function closeUserModal() {
    document.getElementById("userModal").classList.remove("show");
}

function clearForm() {
    [
        "nombre",
        "ap_paterno",
        "ap_materno",
        "email",
        "telefono",
        "matricula",
        "numero_empleado",
        "empresaInput",
        "password",
        "rol"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}