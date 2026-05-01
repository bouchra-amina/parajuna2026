const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminPassword = document.getElementById("adminPassword");
const loginMessage = document.getElementById("loginMessage");
const logoutBtn = document.getElementById("logoutBtn");
const inscriptionsTable = document.getElementById("inscriptionsTable");
const totalCount = document.getElementById("totalCount");
const dashboardMessage = document.getElementById("dashboardMessage");

adminLoginForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const password = adminPassword.value.trim();

    if (!password) {
        loginMessage.style.color = "#ef4444";
        loginMessage.textContent = "Veuillez saisir le mot de passe.";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password })
        });

        const result = await response.json();

        if (!result.success) {
            loginMessage.style.color = "#ef4444";
            loginMessage.textContent = result.message || "Mot de passe incorrect.";
            return;
        }

        localStorage.setItem("parajunaAdmin", "connected");
        showDashboard();
        loadInscriptions();
    } catch (error) {
        loginMessage.style.color = "#ef4444";
        loginMessage.textContent = "Erreur : serveur non connecté.";
        console.error(error);
    }
});

logoutBtn.addEventListener("click", function() {
    localStorage.removeItem("parajunaAdmin");
    dashboard.classList.remove("active");
    loginCard.style.display = "block";
    adminPassword.value = "";
    loginMessage.textContent = "";
});

function showDashboard() {
    loginCard.style.display = "none";
    dashboard.classList.add("active");
}

async function loadInscriptions() {
    try {
        const response = await fetch("http://localhost:3000/api/admin/inscriptions");
        const result = await response.json();

        if (!result.success) {
            dashboardMessage.style.color = "#ef4444";
            dashboardMessage.textContent = result.message || "Erreur de chargement.";
            return;
        }

        renderInscriptions(result.inscriptions);
    } catch (error) {
        dashboardMessage.style.color = "#ef4444";
        dashboardMessage.textContent = "Impossible de charger les inscriptions.";
        console.error(error);
    }
}

function renderInscriptions(inscriptions) {
    totalCount.textContent = inscriptions.length;

    if (inscriptions.length === 0) {
        inscriptionsTable.innerHTML = `
            <tr>
                <td colspan="6">Aucune inscription trouvée.</td>
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
                <td>${item.name}</td>
                <td>${item.email}</td>
                <td>${item.phone}</td>
                <td>${item.profession}</td>
                <td>${item.program}</td>
                <td>${date}</td>
            </tr>
        `;
    }).join("");
}

if (localStorage.getItem("parajunaAdmin") === "connected") {
    showDashboard();
    loadInscriptions();
}
