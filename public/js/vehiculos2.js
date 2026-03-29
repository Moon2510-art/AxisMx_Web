const API = "/api/vehiculos";
const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        window.location.href = "/login.html";
        return;
    }

    let timeout;
    document.getElementById("search")?.addEventListener("input", () => {
        clearTimeout(timeout);
        timeout = setTimeout(loadVehiculos, 400);
    });

    document.getElementById("estado")?.addEventListener("change", loadVehiculos);

    loadVehiculos();
    loadModelos();
    loadUsers();
});

document.getElementById("userCard")?.addEventListener("click", () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user?.id) {
        window.location.href = `/user2.html?id=${user.id}`;
    }
});

async function loadVehiculos() {
    const params = new URLSearchParams({
        search: document.getElementById("search")?.value || "",
        estado: document.getElementById("estado")?.value || ""
    });

    try {
        const res = await fetch(`${API}?${params}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const json = await res.json();
        renderTable(json.data);

    } catch {
        document.getElementById("tableBody").innerHTML =
            `<tr><td colspan="8">Error cargando vehículos</td></tr>`;
    }
}

function renderTable(data) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if (!data.length) {
        tbody.innerHTML = `<tr><td colspan="8">Sin resultados</td></tr>`;
        return;
    }

    data.forEach(v => {
        const estadoClass = v.status === "Activo" ? "active" : "inactive";

        tbody.innerHTML += `
        <tr>
            <td>${v.id}</td>
            <td>${v.placa}</td>
            <td>${v.modelo}</td>
            <td>${v.anio || "-"}</td>
            <td>${v.color || "-"}</td>
            <td>${v.propietario}</td>
            <td><span class="status ${estadoClass}">${v.status}</span></td>
            <td class="actions">
                <button class="btn small" onclick="editVehiculo(${v.id})">Editar</button>
                <button class="btn small" onclick="deleteVehiculo(${v.id})">Eliminar</button>
                <button class="btn small" onclick="toggleVehiculo(${v.id}, '${v.status}')">
                    ${v.status === "Activo" ? "Suspender" : "Activar"}
                </button>
            </td>
        </tr>`;
    });
}

async function loadModelos() {
    try {
        const res = await fetch("/api/modelos", {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
        });
        const json = await res.json();
        const select = document.getElementById("modelo");
        select.innerHTML = `<option value="">Seleccionar modelo</option>`;
        json.data.forEach(m => {
            select.innerHTML += `<option value="${m.ID_Modelo}">${m.Nombre_Marca} ${m.Nombre_Modelo}</option>`;
        });
    } catch (err) {
        console.error("Error cargando modelos", err);
    }
}

async function loadUsers() {
    try {
        const res = await fetch("/api/users", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        const select = document.getElementById("user");
        select.innerHTML = `<option value="">Seleccionar usuario</option>`;
        json.data.forEach(u => {
            select.innerHTML += `<option value="${u.id}">${u.name}</option>`;
        });
    } catch (err) {
        console.error(err);
    }
}

function openCreateModal() {
    document.getElementById("vehiculo_id").value = "";
    document.getElementById("placa").value = "";
    document.getElementById("modelo").value = "";
    document.getElementById("anio").value = "";
    document.getElementById("color").value = "";
    document.getElementById("user").value = "";

    document.getElementById("modalTitle").textContent = "Nuevo Vehículo";
    document.getElementById("vehiculoModal").classList.add("show");
}

function closeModal() {
    document.getElementById("vehiculoModal").classList.remove("show");
}

async function saveVehiculo() {
    const id = document.getElementById("vehiculo_id").value;
    const userId = document.getElementById("user").value;

    if (!userId) {
        alert("Selecciona un propietario");
        return;
    }

    const data = {
        Placa: document.getElementById("placa").value,
        ID_Modelo: document.getElementById("modelo").value,
        Anio: document.getElementById("anio").value,
        Color: document.getElementById("color").value,
        ID_Usuario: userId
    };

    const url = id ? `${API}/${id}` : API;
    const method = id ? "PUT" : "POST";

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const err = await res.text();
        console.error(err);
        alert("Error al guardar");
        return;
    }

    closeModal();
    loadVehiculos();
}

async function editVehiculo(id) {
    const res = await fetch(`${API}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    const v = json.data;

    document.getElementById("vehiculo_id").value = v.ID_Vehiculo;
    document.getElementById("placa").value = v.Placa;
    document.getElementById("anio").value = v.Anio;
    document.getElementById("color").value = v.Color;
    document.getElementById("user").value = v.ID_Usuario;
    document.getElementById("modelo").value = v.ID_Modelo;

    document.getElementById("modalTitle").textContent = "Editar Vehículo";
    document.getElementById("vehiculoModal").classList.add("show");
}

async function deleteVehiculo(id) {
    if (!confirm("¿Eliminar vehículo?")) return;

    await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });

    loadVehiculos();
}

async function toggleVehiculo(id, status) {
    const action = status === "Activo" ? "suspend" : "activate";

    await fetch(`${API}/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
    });

    loadVehiculos();
}