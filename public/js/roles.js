const API = "/api/roles";
const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");

let editingRoleId = null;

document.addEventListener("DOMContentLoaded", () => {

    if (!token) {
        window.location.href = "/login.html";
        return;
    }

    loadRoles();

    document.querySelector(".search")?.addEventListener("input", () => {
        loadRoles();
    });

    document.querySelector(".btn.add")?.addEventListener("click", () => {
        openCreateModal();
    });
});

document.getElementById("userCard")?.addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
        window.location.href = `/user.html?id=${user.id}`;
    }
});

async function loadRoles() {

    const search = document.querySelector(".search")?.value || "";

    try {
        const res = await fetch(`${API}?search=${encodeURIComponent(search)}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("BACKEND ERROR:", text);
            throw new Error("Error al cargar roles");
        }

        const json = await res.json();

        renderTable(json.data);

    } catch (err) {
        console.error(err);
        renderError();
    }
}

function renderTable(data) {

    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="4">Sin resultados</td></tr>`;
        return;
    }

    data.forEach(role => {
        tbody.innerHTML += `
        <tr>
            <td>${role.id}</td>
            <td>${role.name}</td>
            <td>${role.description || "-"}</td>
            <td class="actions">
                <button class="btn" onclick="editRole(${role.id})">Editar</button>
                <button class="btn" onclick="deleteRole(${role.id})">Eliminar</button>
            </td>
        </tr>`;
    });
}

function renderError() {
    document.querySelector("tbody").innerHTML =
        `<tr><td colspan="4">Error al cargar roles</td></tr>`;
}

function openCreateModal() {
    editingRoleId = null;
    clearForm();
    document.getElementById("roleModal").classList.add("show");
}

function closeRoleModal() {
    document.getElementById("roleModal").classList.remove("show");
}

async function editRole(id) {

    try {
        const res = await fetch(`${API}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(text);
            throw new Error("Error al obtener rol");
        }

        const json = await res.json();
        const role = json.data;

        editingRoleId = role.id;

        document.getElementById("rol_nombre").value = role.name || "";
        document.getElementById("rol_desc").value = role.description || ""; 

        document.getElementById("roleModal").classList.add("show");

    } catch (err) {
        console.error(err);
        alert("Error al cargar rol");
    }
}

async function saveRole() {

    const data = {
        Nombre_Rol: document.getElementById("rol_nombre")?.value,
        Descripcion: document.getElementById("rol_desc")?.value
    };

    if (!data.Nombre_Rol) {
        alert("El nombre del rol es obligatorio");
        return;
    }

    try {

        let res;

        if (editingRoleId) {
            res = await fetch(`${API}/${editingRoleId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                },
                body: JSON.stringify(data)
            });
        } else {
            res = await fetch(API, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                },
                body: JSON.stringify(data)
            });
        }

        const response = await res.json();

        if (!res.ok) {
            console.error("BACKEND ERROR:", response);
            throw new Error(response.message || "Error al guardar");
        }

        alert(editingRoleId ? "Rol actualizado" : "Rol creado");

        closeRoleModal();
        loadRoles();
        clearForm();

    } catch (err) {
        console.error(err);
        alert(err.message || "Error al guardar rol");
    }
}

async function deleteRole(id) {

    if (!confirm("¿Eliminar rol?")) return;

    try {
        const res = await fetch(`${API}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(text);
            throw new Error("Error al eliminar");
        }

        loadRoles();

    } catch {
        alert("Error al eliminar rol");
    }
}

function clearForm() {
    document.getElementById("rol_nombre").value = "";
    document.getElementById("rol_desc").value = "";
}