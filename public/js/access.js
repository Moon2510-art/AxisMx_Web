const API = "/api/access/logs";
const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");
let debounceTimer = null;

document.addEventListener("DOMContentLoaded", () => {
    if (!token) {
        window.location.href = "/login.html";
        return;
    }

    loadLogs();

    const searchInput = document.getElementById("search");

    searchInput?.addEventListener("input", () => {
        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            loadLogs();
        }, 400); 
    });

    document.getElementById("userCard")?.addEventListener("click", () => {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.id) {
            window.location.href = `/user.html?id=${user.id}`;
        }
    });

    ["tipo", "estado", "fecha"].forEach(id => {
        document.getElementById(id)?.addEventListener("change", loadLogs);
    });
});

async function loadLogs() {

    const params = new URLSearchParams({
        search: document.getElementById("search")?.value || "",
        tipo: document.getElementById("tipo")?.value || "",
        estado: document.getElementById("estado")?.value || "",
        fecha: document.getElementById("fecha")?.value || ""
    });

    try {
        const res = await fetch(`${API}?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json"
            }
        });

        if (!res.ok) throw new Error("Error al cargar registros");

        const json = await res.json();

        renderTable(json.data);

    } catch (err) {
        console.error(err);
        showError("Error al cargar datos");
    }
}

function renderTable(data) {

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">Sin resultados</td></tr>`;
        return;
    }

    data.forEach(log => {

        const fechaObj = new Date(log.Fecha_Hora);

        const fecha = fechaObj.toLocaleDateString();
        const hora = fechaObj.toLocaleTimeString();

        const acceso = log.credencial || log.vehiculo || "-";

        const estado = log.Acceso_Autorizado
            ? `<span class="ok">✔ Permitido</span>`
            : `<span class="fail">✖ Denegado</span>`;

        const tipoClass = (log.tipo || "").toLowerCase();

        const row = `
            <tr>
                <td>${fecha}</td>
                <td>${hora}</td>
                <td>${log.usuario || "-"}</td>
                <td>${acceso}</td>
                <td><span class="tag ${tipoClass}">${log.tipo || "-"}</span></td>
                <td>${estado}</td>
            </tr>
        `;

        tbody.innerHTML += row;
    });
}

function showError(msg) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = `<tr><td colspan="6">${msg}</td></tr>`;
}

const btnPDF = document.getElementById('btnPDF');

if(btnPDF){
    btnPDF.addEventListener('click', async () => {
        const element = document.getElementById('pdfContent');
        if(!element) return;

        const buttons = document.querySelectorAll('.no-print');
        buttons.forEach(b => b.style.display = 'none');

        const opt = {
            margin: 10,
            filename: `Bitácora de Acceso.pdf`, 
            image: {type: 'jpeg', quality: 1},
            html2canvas: {
                scale: 3, 
                backgroundColor: '#ffffff' 
            },
            jsPDF: {unit: 'mm', format: 'letter', orientation: 'landscape'} 
        };
        
        await html2pdf().set(opt).from(element).save();
        buttons.forEach(b => b.style.display = 'flex');
    });
}

const btnExcel = document.getElementById('btnExcel');

if (btnExcel) {
    btnExcel.addEventListener('click', () => {

        const data = [
            ["Fecha", "Hora", "Usuario", "Credencial / Vehículo", "Tipo", "Estado"]
        ];

        const rows = document.querySelectorAll('#tableBody tr');

        if (rows.length === 0 || rows[0].innerText.includes('Cargando')) {
            alert('No hay datos para exportar.');
            return;
        }

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');

            if (cells.length >= 6) {
                data.push([
                    cells[0].innerText.trim(),
                    cells[1].innerText.trim(),
                    cells[2].innerText.trim(),
                    cells[3].innerText.trim(),
                    cells[4].innerText.trim(),
                    cells[5].innerText.trim()
                ]);
            }
        });

        try {
            const ws = XLSX.utils.aoa_to_sheet(data);

            ws['!cols'] = [
                { wch: 12 },
                { wch: 10 },
                { wch: 25 },
                { wch: 30 },
                { wch: 15 },
                { wch: 15 }
            ];

            const headerStyle = {
                font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
                fill: { fgColor: { rgb: "1F4E78" } },
                alignment: { horizontal: "center", vertical: "center" }
            };

            const centerStyle = {
                alignment: { horizontal: "center", vertical: "center" }
            };

            const leftStyle = {
                alignment: { horizontal: "left", vertical: "center" }
            };

            const aprobadoStyle = {
                font: { color: { rgb: "2E7D32" }, bold: true },
                alignment: { horizontal: "center" }
            };

            const rechazadoStyle = {
                font: { color: { rgb: "C62828" }, bold: true },
                alignment: { horizontal: "center" }
            };

            const pendienteStyle = {
                font: { color: { rgb: "F9A825" }, bold: true },
                alignment: { horizontal: "center" }
            };

            const range = XLSX.utils.decode_range(ws['!ref']);

            for (let C = 0; C <= range.e.c; ++C) {
                const cell = XLSX.utils.encode_cell({ c: C, r: 0 });
                if (ws[cell]) ws[cell].s = headerStyle;
            }

            for (let R = 1; R <= range.e.r; ++R) {
                for (let C = 0; C <= range.e.c; ++C) {
                    const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
                    const cell = ws[cellRef];

                    if (!cell) continue;

                    if (C === 0 || C === 1 || C === 4 || C === 5) {
                        cell.s = centerStyle;
                    } else {
                        cell.s = leftStyle;
                    }

                    if (C === 5) {
                        if (cell.v === 'Aprobada') cell.s = aprobadoStyle;
                        else if (cell.v === 'Rechazada') cell.s = rechazadoStyle;
                        else cell.s = pendienteStyle;
                    }
                }
            }

            ws['!rows'] = [{ hpt: 25 }];
            for (let i = 1; i <= range.e.r; i++) {
                ws['!rows'][i] = { hpt: 20 };
            }

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Bitácora");

            XLSX.writeFile(wb, "Bitacora_Acceso.xlsx");

        } catch (error) {
            console.error("Error al exportar:", error);
            alert("Error al generar el Excel.");
        }
    });
}