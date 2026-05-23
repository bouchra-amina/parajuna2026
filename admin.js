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
   LOGIN
========================= */
adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = adminPassword.value.trim();

    const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    });

    const result = await response.json();

    if (!result.success) {
        loginMessage.textContent = result.message || "Mot de passe incorrect";
        loginMessage.style.color = "red";
        return;
    }

    localStorage.setItem("parajunaAdmin", "connected");
    showDashboard();
    loadInscriptions();
});

/* =========================
   DASHBOARD
========================= */
function showDashboard() {
    loginCard.style.display = "none";
    dashboard.classList.add("active");
}

/* =========================
   LOAD
========================= */
async function loadInscriptions() {
    const response = await fetch("/api/admin/inscriptions");
    const result = await response.json();

    allInscriptions = result.inscriptions || [];
    renderInscriptions(allInscriptions);
}

/* =========================
   CLEAN TEXT
========================= */
function clean(value) {
    return (value || "-").replace(/^(dim_|lun_|mar_|mer_)/, "");
}

/* =========================
   EXTRACTION MERCREDI MATIN
========================= */
function extractMercrediMatin(program) {
    const match = program.match(/Mercredi matin:\s*([\s\S]*?)(\n\n|$)/);
    return match ? match[1].trim() : "-";
}

/* =========================
   RENDER
========================= */
function renderInscriptions(data) {

    totalCount.textContent = data.length;

    inscriptionsTable.innerHTML = data.map(item => {

        const program = item.program || "";

        const dimanche = clean((program.match(/Dimanche:\s*(.*)/) || [])[1]);
        const lundi = clean((program.match(/Lundi:\s*(.*)/) || [])[1]);
        const mardi = clean((program.match(/Mardi:\s*(.*)/) || [])[1]);
        const mercredi = clean((program.match(/Mercredi:\s*(.*)/) || [])[1]);

        const mercrediMatin = extractMercrediMatin(program);

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

                <td>${dimanche}</td>
                <td>${lundi}</td>
                <td>${mardi}</td>
                <td>${mercredi}</td>

                <!-- MERCREDI MATIN -->
                <td>${mercrediMatin}</td>

                <td>${date}</td>

                <td>
                    <input type="checkbox"
                        class="presence-checkbox"
                        data-id="${item.id}"
                        ${item.presence == 1 ? "checked" : ""}>
                </td>

                <td>
                    <button onclick="deleteInscription('${item.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

/* =========================
   SEARCH
========================= */
searchInput.addEventListener("input", function () {

    const v = this.value.toLowerCase();

    const filtered = allInscriptions.filter(item =>
        Object.values(item).join(" ").toLowerCase().includes(v)
    );

    renderInscriptions(filtered);
});

/* =========================
   DELETE
========================= */
async function deleteInscription(id) {
    await fetch(`/api/admin/inscriptions/${id}`, { method: "DELETE" });
    loadInscriptions();
}

/* =========================
   EXPORT
========================= */
function exportToExcel() {

    const data = allInscriptions.map(item => {

        const program = item.program || "";

        const dimanche = (program.match(/Dimanche:\s*(.*)/) || [])[1] || "-";
        const lundi = (program.match(/Lundi:\s*(.*)/) || [])[1] || "-";
        const mardi = (program.match(/Mardi:\s*(.*)/) || [])[1] || "-";
        const mercredi = (program.match(/Mercredi:\s*(.*)/) || [])[1] || "-";

        const mercrediMatin = (program.match(/Mercredi matin:\s*([\s\S]*)/) || [])[1]
            ? (program.match(/Mercredi matin:\s*([\s\S]*)/)[1]).trim()
            : "-";

        return {
            Nom: item.lastname,
            Prenom: item.firstname,
            Email: item.email,
            Telephone: item.phone,
            Profession: item.profession,
            Statut: item.status,
            Wilaya: item.wilaya,

            Dimanche: dimanche,
            Lundi: lundi,
            Mardi: mardi,
            Mercredi: mercredi,
            "Mercredi matin": mercrediMatin,

            Presence: item.presence == 1 ? "Présent" : "Absent",

            Date: item.created_at
                ? new Date(item.created_at).toLocaleDateString("fr-FR")
                : "-"
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Inscriptions");

    XLSX.writeFile(workbook, "Parajuna_Inscriptions.xlsx");
}
