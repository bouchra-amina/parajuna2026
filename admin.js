const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminPassword = document.getElementById("adminPassword");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const inscriptionsTable = document.getElementById("inscriptionsTable");
const totalCount = document.getElementById("totalCount");
const dashboardMessage = document.getElementById("dashboardMessage");
const searchInput = document.getElementById("searchInput");

let allInscriptions = [];

/* =========================
   LOGIN ADMIN
========================= */
adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = adminPassword.value.trim();

    if (!password) {
        showMessage(loginMessage, "Veuillez saisir le mot de passe.", "#ef4444");
        return;
    }

    try {
        const response = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (!result.success) {
            showMessage(loginMessage, result.message || "Mot de passe incorrect.", "#ef4444");
            return;
        }

        localStorage.setItem("parajunaAdmin", "connected");
        showDashboard();
        loadInscriptions();

    } catch (err) {
        console.error(err);
        showMessage(loginMessage, "Erreur serveur.", "#ef4444");
    }
});

/* =========================
   LOGOUT
========================= */
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("parajunaAdmin");
    dashboard.classList.remove("active");
    loginCard.style.display = "block";
    adminPassword.value = "";
    loginMessage.textContent = "";
});

/* =========================
   DASHBOARD
========================= */
function showDashboard() {
    loginCard.style.display = "none";
    dashboard.classList.add("active");
}

/* =========================
   LOAD DATA
========================= */
async function loadInscriptions() {
    try {
        const response = await fetch("/api/admin/inscriptions");
        const result = await response.json();

        if (!result.success) {
            showMessage(dashboardMessage, "Erreur de chargement.", "#ef4444");
            return;
        }

        allInscriptions = result.inscriptions;
        renderInscriptions(allInscriptions);

    } catch (err) {
        console.error(err);
        showMessage(dashboardMessage, "Erreur serveur.", "#ef4444");
    }
}

/* =========================
   RENDER TABLE
========================= */
function renderInscriptions(inscriptions) {
    totalCount.textContent = inscriptions.length;

    if (inscriptions.length === 0) {
        inscriptionsTable.innerHTML = `
            <tr>
                <td colspan="11" style="text-align:center; padding:25px;">
                    Aucune inscription trouvée.
                </td>
            </tr>
        `;
        return;
    }

    inscriptionsTable.innerHTML = inscriptions.map(item => {

        const date = item.created_at
            ? new Date(item.created_at).toLocaleDateString("fr-FR")
            : "-";

        return `
            <tr>
                <td>${item.lastname || "-"}</td>
                <td>${item.firstname || "-"}</td>
                <td>${item.email || "-"}</td>
                <td>${item.phone || "-"}</td>
                <td>${item.profession || "-"}</td>
                <td>${item.status || "-"}</td>
                <td>${item.wilaya || "-"}</td>
                <td>${item.program || "-"}</td>
                <td>${date}</td>

                <!-- PRESENCE -->
                <td>
                    <input type="checkbox"
                        class="presence-checkbox"
                        data-id="${item.id}"
                        ${item.presence == 1 ? "checked" : ""}>
                </td>

                <!-- ACTION -->
                <td>
                    <button class="btn-delete" onclick="deleteInscription('${item.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

/* =========================
   PRESENCE UPDATE (GLOBAL LISTENER)
========================= */
document.addEventListener("change", async (e) => {
    if (!e.target.classList.contains("presence-checkbox")) return;

    const id = e.target.dataset.id;
    const presence = e.target.checked ? 1 : 0;

    try {
        await fetch(`/api/admin/presence/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ presence })
        });

    } catch (err) {
        console.error("Erreur presence:", err);
        alert("Erreur serveur");
    }
});

/* =========================
   SEARCH
========================= */
searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase().trim();

    const filtered = allInscriptions.filter(item =>
        (item.lastname && item.lastname.toLowerCase().includes(value)) ||
        (item.firstname && item.firstname.toLowerCase().includes(value)) ||
        (item.email && item.email.toLowerCase().includes(value)) ||
        (item.phone && item.phone.includes(value)) ||
        (item.profession && item.profession.toLowerCase().includes(value)) ||
        (item.status && item.status.toLowerCase().includes(value)) ||
        (item.wilaya && item.wilaya.toLowerCase().includes(value)) ||
        (item.program && item.program.toLowerCase().includes(value))
    );

    renderInscriptions(filtered);
});

/* =========================
   DELETE
========================= */
async function deleteInscription(id) {
    if (!confirm("Supprimer cet inscrit ?")) return;

    try {
        const response = await fetch(`/api/admin/inscriptions/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (result.success) {
            loadInscriptions();
        } else {
            alert(result.message || "Erreur suppression");
        }

    } catch (err) {
        console.error(err);
        alert("Erreur serveur");
    }
}

/* =========================
   MESSAGE
========================= */
function showMessage(element, text, color) {
    element.style.color = color;
    element.textContent = text;
}

/* =========================
   AUTO LOGIN
========================= */
if (localStorage.getItem("parajunaAdmin") === "connected") {
    showDashboard();
    loadInscriptions();
}
