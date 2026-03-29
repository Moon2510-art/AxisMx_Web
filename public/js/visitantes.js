document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("visitantesTable");
  const searchInput = document.getElementById("search");
  const estadoSelect = document.getElementById("estado");
  const btnPDF = document.getElementById("btnPDF");
  const btnExcel = document.getElementById("btnExcel");
  const pdfContent = document.getElementById("pdfContent");

  let visitantes = [];

  function getAuthHeaders() {
  const token = localStorage.getItem('api_token'); 
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };

}

document.getElementById("userCard")?.addEventListener("click", () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    if (user?.id) {
        window.location.href = `/user.html?id=${user.id}`;
    }
});

async function loadVisitantes() {
  showMessageRow("Cargando...");
  try {
    const res = await fetch('/api/visitantes', {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      let errText = `Error ${res.status}`;
      try { const errJson = await res.json(); errText = errJson.message || JSON.stringify(errJson); } catch(e) { errText = await res.text(); }
      throw new Error(errText);
    }
    const json = await res.json();
    visitantes = normalizeResponse(json);
    renderTable();
  } catch (err) {
    console.error("Error cargando visitantes:", err);
    showMessageRow("Error al cargar visitantes. Revisa la consola.");
  }
}

  function normalizeResponse(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && typeof data === "object" && Object.keys(data).length > 0) return [data];
    return [];
  }

  function showMessageRow(text) {
    tableBody.innerHTML = `<tr><td colspan="8">${text}</td></tr>`;
  }

  async function loadVisitantes() {
    showMessageRow("Cargando...");
    try {
      const res = await fetch("/api/visitantes", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        credentials: "include" 
      });

      if (!res.ok) {
        let errText = `Error ${res.status}`;
        try {
          const errJson = await res.json();
          errText = errJson.message || JSON.stringify(errJson);
        } catch (e) {
          errText = await res.text();
        }
        throw new Error(errText);
      }

      const json = await res.json();
      visitantes = normalizeResponse(json);
      renderTable();
    } catch (err) {
      console.error("Error cargando visitantes:", err);
      showMessageRow("Error al cargar visitantes. Revisa la consola.");
    }
  }

  function renderTable() {
    if (!Array.isArray(visitantes) || visitantes.length === 0) {
      showMessageRow("Sin resultados");
      return;
    }

    const search = (searchInput.value || "").toLowerCase();
    const estado = estadoSelect.value;

    const filtered = visitantes.filter(v => {
      const nombre = (v.Nombre || "").toLowerCase();
      const compania = (v.Compania || "").toLowerCase();
      const fecha = (v.Fecha || "").toLowerCase();
      const matchesSearch = nombre.includes(search) || compania.includes(search) || (v.Email || "").toLowerCase().includes(search) || fecha.includes(search);
      const matchesEstado = estado ? v.Estado === estado : true;
      return matchesSearch && matchesEstado;
    });

    if (filtered.length === 0) {
      showMessageRow("Sin resultados");
      return;
    }

    tableBody.innerHTML = filtered.map(v => {
      const qrCell = v.QR ? `<div id="qr-${v.ID_Visitante}"></div>` : "-";
      const accionesPendiente = v.Estado === "Pendiente"
        ? `<button class="btn-approve" data-id="${v.ID_Visitante}">Aprobar</button>
           <button class="btn-reject" data-id="${v.ID_Visitante}">Rechazar</button>`
        : "";
      return `
        <tr>
          <td>${v.ID_Visitante}</td>
          <td>${escapeHtml(v.Nombre)}</td>
          <td>${escapeHtml(v.Compania || "-")}</td>
          <td>${escapeHtml(v.Email)}</td>
          <td>${escapeHtml(v.Telefono)}</td>
          <td>${escapeHtml(v.Fecha || "-")}</td>
          <td>${escapeHtml(v.Estado)}</td>
          <td>${qrCell}</td>
          <td>
            ${accionesPendiente}
            <button class="btn-delete" data-id="${v.ID_Visitante}">Eliminar</button>
          </td>
        </tr>
      `;
    }).join("");

    filtered.forEach(v => {
      if (v.QR) {
        const qrDiv = document.getElementById(`qr-${v.ID_Visitante}`);
        if (qrDiv && qrDiv.children.length === 0) {
          try {
            new QRCode(qrDiv, { text: v.QR, width: 64, height: 64 });
          } catch (e) {
            console.warn("QR generation failed for", v.ID_Visitante, e);
          }
        }
      }
    });

    tableBody.querySelectorAll(".btn-approve").forEach(btn => {
      btn.addEventListener("click", () => aprobar(btn.dataset.id));
    });
    tableBody.querySelectorAll(".btn-reject").forEach(btn => {
      btn.addEventListener("click", () => rechazar(btn.dataset.id));
    });
    tableBody.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", () => eliminar(btn.dataset.id));
    });
  }

  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function aprobar(id) {
    if (!confirm("¿Aprobar visitante?")) return;
    try {
      const res = await fetch(`/api/visitantes/${id}/aprobar`, {
        method: "POST",
        headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" },
        credentials: "include"
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await loadVisitantes();
    } catch (err) {
      console.error("Error al aprobar:", err);
      alert("No se pudo aprobar. Revisa la consola.");
    }
  }

  async function rechazar(id) {
    if (!confirm("¿Rechazar visitante?")) return;
    try {
      const res = await fetch(`/api/visitantes/${id}/rechazar`, {
        method: "POST",
        headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" },
        credentials: "include"
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await loadVisitantes();
    } catch (err) {
      console.error("Error al rechazar:", err);
      alert("No se pudo rechazar. Revisa la consola.");
    }
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar visitante? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`/api/visitantes/${id}`, {
        method: "DELETE",
        headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest" },
        credentials: "include"
      });
      if (!res.ok) {
        let err = await res.text();
        throw new Error(err || `Error ${res.status}`);
      }
      await loadVisitantes();
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("No se pudo eliminar. Revisa la consola.");
    }
  }

  btnPDF.addEventListener("click", () => {
    if (!pdfContent) return;
    html2pdf().from(pdfContent).save("visitantes.pdf");
  });

  btnExcel.addEventListener("click", () => {
    if (!Array.isArray(visitantes) || visitantes.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    const wsData = visitantes.map(v => ({
      ID: v.ID_Visitante,
      Nombre: v.Nombre,
      Compania: v.Compania || "",
      Email: v.Email,
      Telefono: v.Telefono,
      Fecha: v.fecha || "",
      Estado: v.Estado,
      QR: v.QR || ""
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Visitantes");
    XLSX.writeFile(wb, "visitantes.xlsx");
  });

  searchInput.addEventListener("input", renderTable);
  estadoSelect.addEventListener("change", renderTable);

  loadVisitantes();
});
