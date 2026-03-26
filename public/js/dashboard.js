const API = "/api";
const token = sessionStorage.getItem("auth_token") || localStorage.getItem("auth_token");

google.charts.load('current', { packages: ['corechart'] });

document.addEventListener("DOMContentLoaded", () => {
    loadStats();
    loadCharts();
    loadActivity();
});

document.getElementById("userCard")?.addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user?.id) {
        window.location.href = `/user.html?id=${user.id}`;
    }
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

        document.getElementById("usersCount").textContent = data.users ?? 0;
        document.getElementById("vehiclesCount").textContent = data.vehicles ?? 0;
        document.getElementById("accessToday").textContent = data.access_today ?? 0;

    } catch (e) {
        console.error("Stats error:", e);
    }
}

async function loadCharts() {
    try {
        const accessData = await fetchData("/dashboard/chart-access");
        const typeData = await fetchData("/dashboard/chart-types");

        google.charts.setOnLoadCallback(() => {

            const accessArray = [
                ['Fecha', 'Accesos'],
                ...accessData.map(d => {
                    const [y, m, day] = d.fecha.split('-');
                    return [new Date(y, m - 1, day), Number(d.total)];
                })
            ];

            const accessTable = google.visualization.arrayToDataTable(accessArray);

            const accessOptions = {
                backgroundColor: 'transparent',

                chartArea: {
                    width: '85%',
                    height: '70%'
                },

                curveType: 'function',

                legend: { position: 'none' },

                hAxis: {
                    format: 'MMM d',
                    textStyle: { color: '#157693' },
                    gridlines: { color: '#eaf4f8' }
                },

                vAxis: {
                    minValue: 0,
                    textStyle: { color: '#15aef5' },
                    gridlines: { color: '#eaf4f8' }
                },

                colors: ['#00aeff'], 

                lineWidth: 3,

                pointSize: 5,
                pointShape: 'circle',

                animation: {
                    startup: true,
                    duration: 800,
                    easing: 'out'
                },

                tooltip: {
                    textStyle: { color: '#219ad2' },
                    showColorCode: true
                }
            };

            const accessChart = new google.visualization.LineChart(
                document.getElementById('accessChart')
            );

            accessChart.draw(accessTable, accessOptions);


            const typeArray = [
                ['Tipo', 'Total'],
                ...typeData.map(d => [d.Nombre_Tipo, Number(d.total)])
            ];

            const typeTable = google.visualization.arrayToDataTable(typeArray);

            const typeOptions = {
                pieHole: 0.6,

                backgroundColor: 'transparent',

                chartArea: {
                    width: '90%',
                    height: '80%'
                },

                legend: {
                    position: 'bottom',
                    textStyle: { color: '#608da2', fontSize: 12 }
                },

                colors: [
                    '#0045f5',
                    '#07d45c',
                    '#7200dd',
                    '#eaff31'
                ],

                pieSliceText: 'none',

                tooltip: {
                    text: 'percentage'
                },

                animation: {
                    startup: true,
                    duration: 800,
                    easing: 'out'
                }
            };

            const typeChart = new google.visualization.PieChart(
                document.getElementById('typeChart')
            );

            typeChart.draw(typeTable, typeOptions);

        });

    } catch (e) {
        console.error("Charts error:", e);
    }
}

async function loadActivity() {
    try {
        const res = await fetchData("/dashboard/recent-accesses");
        const data = res.data; 

        const container = document.getElementById("activityList");
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