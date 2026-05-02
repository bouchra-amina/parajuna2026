const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminPassword = document.getElementById("adminPassword");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const inscriptionsTable = document.getElementById("inscriptionsTable");
const totalCount = document.getElementById("totalCount");
const dashboardMessage = document.getElementById("dashboardMessage");

// --- LOGIN ADMIN ---
adminLoginForm.addEventListener("submit", async function(e) {
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

    } catch (error) {
        showMessage(loginMessage, "Erreur serveur.", "#ef4444");
        console.error(error);
    }
});

// --- LOGOUT ---
logoutBtn.addEventListener("click", function() {
    localStorage.removeItem("parajunaAdmin");
    dashboard.classList.remove("active");
    loginCard.style.display = "block";
    adminPassword.value = "";
    loginMessage.textContent = "";
});

// --- SHOW DASHBOARD ---
function showDashboard() {
    loginCard.style.display = "none";
    dashboard.classList.add("active");
}

// --- LOAD INSCRIPTIONS ---
async function loadInscriptions() {
    try {
        const response = await fetch("/api/admin/inscriptions");
        const result = await response.json();

        if (!result.success) {
            showMessage(dashboardMessage, result.message || "Erreur de chargement.", "#ef4444");
            return;
        }

        renderInscriptions(result.inscriptions);

    } catch (error) {
        showMessage(dashboardMessage, "Impossible de charger les inscriptions.", "#ef4444");
        console.error(error);
    }
}

// --- RENDER TABLE (MISE À JOUR PRO) ---
function renderInscriptions(inscriptions) {
    totalCount.textContent = inscriptions.length;

    if (inscriptions.length === 0) {
        inscriptionsTable.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding: 30px;">Aucune inscription trouvée.</td>
            </tr>
        `;
        return;
    }

    inscriptionsTable.innerHTML = inscriptions.map((item) => {
        const date = item.created_at
            ? new Date(item.created_at).toLocaleDateString("fr-FR")
            : "-";

        return `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td>${item.email}</td>
                <td>${item.phone}</td>
                <td><span class="badge">${item.profession}</span></td>
                <td>${item.program}</td>
                <td>${date}</td>
                <td>
                    <button class="btn-delete" onclick="deleteInscription('${item._id || item.id}')">
                        Supprimer
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// --- DELETE INSCRIPTION (NOUVEAU) ---
async function deleteInscription(id) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet inscrit ? Cette action est irréversible.")) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/inscriptions/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (result.success) {
            // Recharger la liste après suppression
            loadInscriptions();
        } else {
            alert(result.message || "Erreur lors de la suppression");
        }
    } catch (error) {
        console.error("Erreur suppression:", error);
        alert("Erreur de connexion au serveur.");
    }
}

// --- UTILS ---
function showMessage(element, text, color) {
    element.style.color = color;
    element.textContent = text;
}

// --- AUTO LOGIN ---
if (localStorage.getItem("parajunaAdmin") === "connected") {
    showDashboard();
    loadInscriptions();
}
