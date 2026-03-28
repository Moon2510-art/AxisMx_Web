document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);

    const form = $("loginForm");
    const loginBtn = $("loginBtn");

    if ($("year")) $("year").textContent = new Date().getFullYear();

    checkAuth();

    form?.addEventListener("submit", handleLogin);

    const visitBtn = document.getElementById("visitBtn");

    visitBtn?.addEventListener("click", () => {
        window.location.href = "/visita.html";
    });

    document.querySelectorAll(".input-field input").forEach(input => {
        const parent = input.parentElement;

        const toggle = () => {
            parent.classList.toggle("focused", !!input.value || document.activeElement === input);
        };

        input.addEventListener("focus", toggle);
        input.addEventListener("blur", toggle);
        toggle();
    });

    const remembered = localStorage.getItem("remembered_user");
    if (remembered) {
        $("email_or_employee").value = remembered;
        $("remember").checked = true;
    }
});

async function handleLogin(e) {
    e.preventDefault();

    const $ = (id) => document.getElementById(id);

    const container = $("message-container");
    const btn = $("loginBtn");
    const btnText = btn?.querySelector(".btn-text");
    const loader = btn?.querySelector(".btn-loader");

    clearMessages(container);

    const email = $("email_or_employee")?.value.trim();
    const password = $("password")?.value;
    const remember = $("remember")?.checked;

    if (!email) return showMessage(container, "Ingresa tu usuario", "error");
    if (!password || password.length < 6) return showMessage(container, "Contraseña inválida", "error");

    btn.disabled = true;
    if (btnText) btnText.style.display = "none";
    if (loader) loader.style.display = "inline-block";

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-CSRF-TOKEN": getCsrfToken()
            },
            body: JSON.stringify({
                email_or_employee: email,
                password,
                device_name: "web_browser"
            })
        });

        let data = {};
        try { data = await res.json(); } catch {}

        if (!res.ok || !data.success) {
            throw new Error(data.message || `Error ${res.status}`);
        }

        const storage = remember ? localStorage : sessionStorage;

        storage.setItem("auth_token", data.data?.token || "");
        storage.setItem("user", JSON.stringify(data.data?.user || {}));

        remember
            ? localStorage.setItem("remembered_user", email)
            : localStorage.removeItem("remembered_user");

        showMessage(container, "Login exitoso", "success");

        setTimeout(() => location.href = "/dashboard.html", 1200);

    } catch (err) {
        let msg = err.message || "Error";

        if (msg.includes("401")) msg = "Credenciales incorrectas";
        else if (msg.includes("403")) msg = "Cuenta no activa";
        else if (msg.includes("429")) msg = "Demasiados intentos";
        else if (msg.toLowerCase().includes("fetch")) msg = "Sin conexión";

        showMessage(container, msg, "error");

        const card = document.querySelector(".login-card");
        card?.classList.add("shake");
        setTimeout(() => card?.classList.remove("shake"), 500);
    } finally {
        btn.disabled = false;
        if (btnText) btnText.style.display = "inline-block";
        if (loader) loader.style.display = "none";
    }
}

async function logout() {
    const token =
        sessionStorage.getItem("auth_token") ||
        localStorage.getItem("auth_token");

    if (token) {
        try {
            await fetch("/api/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken()
                }
            });
        } catch {}
    }
    
    sessionStorage.clear();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("remembered_user"); 
    location.href = "/login.html";
}

function checkAuth() {
    const token = sessionStorage.getItem("auth_token");
    const page = location.pathname.split("/").pop();

    const isAuthPage = ["login.html", "index.html", ""].includes(page);

    if (token && isAuthPage) location.href = "/dashboard.html";
    if (!token && !isAuthPage) location.href = "/login.html";
}

function togglePassword() {
    const input = document.getElementById("password");
    const icon = document.querySelector(".toggle-password i");

    if (!input || !icon) return;

    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    icon.classList.toggle("fa-eye", !isHidden);
    icon.classList.toggle("fa-eye-slash", isHidden);
}

function showMessage(container, message, type = "error") {
    if (!container) return;

    const div = document.createElement("div");
    div.className = `alert alert-${type}`;

    const icons = {
        success: "fa-check-circle",
        error: "fa-exclamation-circle",
        info: "fa-info-circle"
    };

    div.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(div);

    setTimeout(() => div.remove(), 5000);
}

function clearMessages(container) {
    if (container) container.innerHTML = "";
}

function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.content || "";
}

const style = document.createElement("style");
style.textContent = `
@keyframes shake {
    0%,100%{transform:translateX(0)}
    25%{transform:translateX(-5px)}
    75%{transform:translateX(5px)}
}
.shake{animation:shake .4s}
.input-field.focused label{color:var(--accent-blue)}
.input-field input:focus{
    border-color:var(--accent-blue);
    box-shadow:0 0 0 3px rgba(59,130,246,.1);
}`;
document.head.appendChild(style);