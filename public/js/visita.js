const API = '/api/visitantes';
const form = document.getElementById('visitaForm');
const message = document.getElementById('message');
const statusSection = document.getElementById('statusSection');
const estadoText = document.getElementById('estadoText');
const statusMessage = document.getElementById('statusMessage');
const qrContainer = document.getElementById('qrContainer');

const statusBtn = document.getElementById('statusBtn');
const statusModal = document.getElementById('statusModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const checkStatusBtn = document.getElementById('checkStatusBtn');
const modalEmail = document.getElementById('modalEmail');
const modalStatusSection = document.getElementById('modalStatusSection');
const modalEstadoText = document.getElementById('modalEstadoText');
const modalStatusMessage = document.getElementById('modalStatusMessage');
const modalQrContainer = document.getElementById('modalQrContainer');
const modalMessage = document.getElementById('modalMessage');

document.addEventListener('DOMContentLoaded', () => {
    form.addEventListener('submit', handleSubmit);

    statusBtn.addEventListener('click', () => {
        statusModal.style.display = 'flex';
        modalEmail.value = '';
        modalStatusSection.style.display = 'none';
        modalMessage.innerHTML = '';
    });

    closeModalBtn.addEventListener('click', () => {
        statusModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === statusModal) statusModal.style.display = 'none';
    });

    checkStatusBtn.addEventListener('click', async () => {
        modalMessage.innerHTML = '';
        modalStatusSection.style.display = 'none';

        const email = modalEmail.value.trim();
        if (!email) {
            modalMessage.innerHTML = `<div class="alert alert-error">Ingresa un email válido</div>`;
            return;
        }

        try {
            const res = await fetch(`${API}/email/${encodeURIComponent(email)}`);
            if (!res.ok) throw new Error('No se encontró la visita con ese email');
            const visitante = await res.json();

            renderModalStatus(visitante);
        } catch (err) {
            modalMessage.innerHTML = `<div class="alert alert-error">${err.message}</div>`;
        }
    });
});

async function handleSubmit(e) {
    e.preventDefault();
    clearMessage();

    const nombre = document.getElementById('nombre').value.trim();
    const compania = document.getElementById('compania').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const fecha = document.getElementById('fecha').value; // ✅ get fecha from input

    if (!nombre || !email || !telefono || !fecha) {
        showMessage('Completa todos los campos requeridos, incluyendo la fecha', 'error');
        return;
    }

    try {
        const existing = await fetch(`${API}/email/${encodeURIComponent(email)}`);
        if (existing.ok) {
            const visitante = await existing.json();
            renderStatus(visitante);
            return;
        }
    } catch {}

    try {
        const res = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ 
                Nombre: nombre, 
                Compania: compania, 
                Email: email, 
                Telefono: telefono,
                Fecha: fecha // ✅ include fecha
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error');

        renderStatus(data);
        showMessage('Visita registrada correctamente', 'success');
    } catch (err) {
        showMessage(err.message || 'Error al registrar', 'error');
    }
}

function renderStatus(v) {
    statusSection.style.display = 'block';
    estadoText.textContent = `Estado: ${v.Estado}`;
    qrContainer.innerHTML = '';

    if (v.Estado === 'Aprobada' && v.QR) {
        new QRCode(qrContainer, { text: v.QR, width: 180, height: 180 });
        statusMessage.textContent = 'Muestra este código QR en tu acceso';
    } else if (v.Estado === 'Rechazada') {
        statusMessage.textContent = 'Tu solicitud fue rechazada';
    } else {
        statusMessage.textContent = 'Tu solicitud está en revisión';
    }
}

function renderModalStatus(v) {
    modalStatusSection.style.display = 'block';
    modalEstadoText.textContent = `Estado: ${v.Estado}`;
    modalQrContainer.innerHTML = '';

    if (v.Estado === 'Aprobada' && v.QR) {
        new QRCode(modalQrContainer, { text: v.QR, width: 180, height: 180 });
        modalStatusMessage.textContent = 'Muestra este código QR en tu acceso';
    } else if (v.Estado === 'Rechazada') {
        modalStatusMessage.textContent = 'Tu solicitud fue rechazada';
    } else {
        modalStatusMessage.textContent = 'Tu solicitud está en revisión';
    }
}

function showMessage(text, type) {
    message.innerHTML = `<div class="alert alert-${type}">${text}</div>`;
}

function clearMessage() {
    message.innerHTML = '';
}