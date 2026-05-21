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
const exportExcelBtn = document.getElementById("exportExcelBtn");

let allInscriptions = [];

/* =========================
   LOGIN ADMIN
========================= */
adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = adminPassword.value.trim();

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
   RENDER TABLE (CORRIGÉ)
========================= */
function renderInscriptions(inscriptions) {

    totalCount.textContent = inscriptions.length;

    if (inscriptions.length === 0) {
        inscriptionsTable.innerHTML = `
            <tr>
                <td colspan="14" style="text-align:center; padding:25px;">
                    Aucune inscription trouvée.
                </td>
            </tr>
        `;
        return;
    }

    inscriptionsTable.innerHTML = inscriptions.map(item => {

        const progLines = (item.program || "").split("\n");

        const dimanche = progLines[0]?.replace("Dimanche:", "").trim() || "-";
        const lundi = progLines[1]?.replace("Lundi:", "").trim() || "-";
        const mardi = progLines[2]?.replace("Mardi:", "").trim() || "-";
        const mercredi = progLines[3]?.replace("Mercredi:", "").trim() || "-";

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

                <!-- PROGRAMME PAR JOUR -->
                <td>${dimanche}</td>
                <td>${lundi}</td>
                <td>${mardi}</td>
                <td>${mercredi}</td>

                <td>${date}</td>

                <td>
                    <input type="checkbox"
                        class="presence-checkbox"
                        data-id="${item.id}"
                        ${item.presence == 1 ? "checked" : ""}>
                </td>

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
   PRESENCE UPDATE
========================= */
document.addEventListener("change", async (e) => {
    if (!e.target.classList.contains("presence-checkbox")) return;

    const id = e.target.dataset.id;
    const presence = e.target.checked ? 1 : 0;

    try {
        await fetch(`/api/admin/presence/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ presence })
        });
    } catch (err) {
        console.error(err);
    }
});

/* =========================
   SEARCH
========================= */
searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();

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
        }
    } catch (err) {
        console.error(err);
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

/* =========================
   EXPORT EXCEL
========================= */
exportExcelBtn.addEventListener("click", exportToExcel);

function exportToExcel() {

    const data = allInscriptions.map(item => ({
        Nom: item.lastname,
        Prenom: item.firstname,
        Email: item.email,
        Telephone: item.phone,
        Profession: item.profession,
        Statut: item.status,
        Wilaya: item.wilaya,
        Programme: item.program,
        Presence: item.presence == 1 ? "Présent" : "Absent",
        Date: item.created_at
            ? new Date(item.created_at).toLocaleDateString("fr-FR")
            : "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Inscriptions");

    XLSX.writeFile(workbook, "Parajuna_Inscriptions.xlsx");
}
