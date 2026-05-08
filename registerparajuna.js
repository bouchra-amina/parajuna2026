const form = document.getElementById("registerForm");

/* =========================
   INPUTS
========================= */
const lastnameInput = document.getElementById("lastname");
const firstnameInput = document.getElementById("firstname");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const professionInput = document.getElementById("profession");
const statusInput = document.getElementById("status");
const yearInput = document.getElementById("year");
const wilayaInput = document.getElementById("wilaya");
const programInput = document.getElementById("program");

/* =========================
   UI
========================= */
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const closePopup = document.getElementById("closePopup");
const message = document.getElementById("message");

/* =========================
   HELPERS
========================= */
function showError(text) {
    message.style.color = "#ff4d4d";
    message.textContent = text;
}

function showSuccess(text) {
    message.style.color = "#00ffbf";
    message.textContent = text;
}

function clearMessage() {
    message.textContent = "";
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[0-9+\s]{8,15}$/.test(phone);
}

/* =========================
   LOGIQUE STATUT / ANNEE
========================= */
statusInput.addEventListener("change", function () {

    if (statusInput.value === "generaliste") {
        yearInput.value = "";
        yearInput.disabled = true;
        yearInput.style.opacity = "0.5";
        yearInput.style.cursor = "not-allowed";
    } else {
        yearInput.disabled = false;
        yearInput.style.opacity = "1";
        yearInput.style.cursor = "pointer";
    }

});

/* =========================
   SUBMIT FORM
========================= */
form.addEventListener("submit", async function (e) {
    e.preventDefault();

    clearMessage();

    const lastname = lastnameInput.value.trim();
    const firstname = firstnameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const profession = professionInput.value;
    const status = statusInput.value;
    const year = yearInput.value;
    const wilaya = wilayaInput.value;
    const program = programInput.value;

    /* =========================
       VALIDATION
    ========================= */
    if (
        !lastname ||
        !firstname ||
        !email ||
        !phone ||
        !profession ||
        !status ||
        !wilaya ||
        !program
    ) {
        showError("Veuillez remplir tous les champs.");
        return;
    }

    // année obligatoire sauf médecin généraliste
    if (status !== "generaliste" && !year) {
        showError("Veuillez sélectionner l'année.");
        return;
    }

    if (!isValidEmail(email)) {
        showError("Adresse email invalide.");
        return;
    }

    if (!isValidPhone(phone)) {
        showError("Numéro de téléphone invalide.");
        return;
    }

    /* =========================
       SEND DATA
    ========================= */
    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                lastname,
                firstname,
                fullName: `${lastname} ${firstname}`,
                email,
                phone,
                profession,
                status,
                year: status === "generaliste" ? null : year,
                wilaya,
                program
            })
        });

        const result = await response.json();

        if (result.success) {

            popupText.textContent =
                `Bienvenue ${firstname} ${lastname} ✨ Votre inscription est réussie !`;

            popup.classList.remove("hidden");

            form.reset();
            clearMessage();

            // reset year UI
            yearInput.disabled = false;
            yearInput.style.opacity = "1";
            yearInput.style.cursor = "pointer";

        } else {
            showError(result.message || "Erreur lors de l'inscription.");
        }

    } catch (error) {
        console.error(error);
        showError("Erreur serveur, veuillez réessayer.");
    }
});

/* =========================
   CLOSE POPUP
========================= */
closePopup.addEventListener("click", function () {
    popup.classList.add("hidden");
});

/* =========================
   CLOSE POPUP CLICK OUTSIDE
========================= */
popup.addEventListener("click", function (e) {
    if (e.target === popup) {
        popup.classList.add("hidden");
    }
});
