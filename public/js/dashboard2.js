const API = "/api";

const token =
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("auth_token");

function getUser() {
    try {
        return JSON.parse(
            sessionStorage.getItem("user") ||
            localStorage.getItem("user") ||
            "null"
        );
    } catch {
        return null;
    }
}

const currentUser = getUser();

google.charts.load('current', { packages: ['corechart'] });

document.addEventListener("DOMContentLoaded", () => {
    loadStats();
    loadCharts();
    loadActivity();

    document.getElementById("userCard")?.addEventListener("click", () => {
        if (currentUser?.id) {
            window.location.href = `/user2.html?id=${currentUser.id}`;
        }
    });
});

async function fetchData(endpoint) {
    const res = await fetch(`${API}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
        }
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("API ERROR:", text);
        throw new Error("Error en API");
    }

    return res.json();
}

async function loadStats() {
    try {
        const data = await fetchData("/dashboard/stats");

        const usersEl = document.getElementById("usersCount");
        const vehiclesEl = document.getElementById("vehiclesCount");
        const accessEl = document.getElementById("accessToday");

        if (usersEl) usersEl.textContent = data.users ?? 0;
        if (vehiclesEl) vehiclesEl.textContent = data.vehicles ?? 0;
        if (accessEl) accessEl.textContent = data.access_today ?? 0;

    } catch (e) {
        console.error("Stats error:", e);
    }
}

async function loadCharts() {
    try {
        const accessData = await fetchData("/dashboard/chart-access");
        const typeData = await fetchData("/dashboard/chart-types");

        google.charts.setOnLoadCallback(() => {

            const accessContainer = document.getElementById("accessChart");
            if (accessContainer && accessData?.length) {

                const accessArray = [
                    ['Fecha', 'Accesos'],
                    ...accessData.map(d => {
                        const [y, m, day] = d.fecha.split('-');
                        return [new Date(y, m - 1, day), Number(d.total)];
                    })
                ];

                const accessTable = google.visualization.arrayToDataTable(accessArray);

                const chart = new google.visualization.LineChart(accessContainer);
                chart.draw(accessTable, {
                    backgroundColor: 'transparent',
                    chartArea: { width: '85%', height: '70%' },
                    curveType: 'function',
                    legend: { position: 'none' },
                    hAxis: { format: 'MMM d' },
                    vAxis: { minValue: 0 },
                    colors: ['#00aeff'],
                    lineWidth: 3,
                    pointSize: 5
                });
            }

            const typeContainer = document.getElementById("typeChart");
            if (typeContainer && typeData?.length) {

                const typeArray = [
                    ['Tipo', 'Total'],
                    ...typeData.map(d => [d.Nombre_Tipo, Number(d.total)])
                ];

                const typeTable = google.visualization.arrayToDataTable(typeArray);

                const chart = new google.visualization.PieChart(typeContainer);
                chart.draw(typeTable, {
                    pieHole: 0.6,
                    backgroundColor: 'transparent',
                    chartArea: { width: '90%', height: '80%' },
                    legend: { position: 'bottom' }
                });
            }

        });

    } catch (e) {
        console.error("Charts error:", e);
    }
}

async function loadActivity() {
    try {
        const res = await fetchData("/dashboard/recent-accesses");
        const data = res.data || [];

        const container = document.getElementById("activityList");
        if (!container) return;

        container.innerHTML = "";

        data.forEach(item => {
            const div = document.createElement("div");
            div.className = `activity-item ${item.Acceso_Autorizado ? "ok" : "fail"}`;

            div.innerHTML = `
                <span>${item.usuario || "Desconocido"}</span>
                <span>${item.Acceso_Autorizado ? "✔" : "✖"}</span>
                <span>${new Date(item.Fecha_Hora).toLocaleString()}</span>
            `;

            container.appendChild(div);
        });

    } catch (e) {
        console.error("Activity error:", e);
    }
}