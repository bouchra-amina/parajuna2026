document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       FORM
    ========================== */
    const form = document.getElementById("registerForm");

    /* =========================
       INPUTS
    ========================== */
    const lastnameInput = document.getElementById("lastname");
    const firstnameInput = document.getElementById("firstname");
    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const professionInput = document.getElementById("profession");
    const statusInput = document.getElementById("status");
    const wilayaInput = document.getElementById("wilaya");

    // ✔️ CORRECTION ICI (remplacement de programInput)
    const progDimancheInput = document.getElementById("prog_dimanche");
    const progLundiInput = document.getElementById("prog_lundi");
    const progMardiInput = document.getElementById("prog_mardi");
    const progMercrediInput = document.getElementById("prog_mercredi");

    /* =========================
       UI
    ========================== */
    const popup = document.getElementById("popup");
    const popupText = document.getElementById("popupText");
    const closePopup = document.getElementById("closePopup");
    const message = document.getElementById("message");

    if (!form) {
        console.error("Formulaire introuvable");
        return;
    }

    /* =========================
       HELPERS
    ========================== */
    function showError(text) {
        message.style.color = "#ff4d4d";
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
       SUBMIT
    ========================== */
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        clearMessage();

        const lastname = lastnameInput.value.trim();
        const firstname = firstnameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const profession = professionInput.value;
        const status = statusInput.value;
        const wilaya = wilayaInput.value;

        /* ✔️ CORRECTION ICI */
        const progDimanche = progDimancheInput.value;
        const progLundi = progLundiInput.value;
        const progMardi = progMardiInput.value;
        const progMercredi = progMercrediInput.value;

        // ✔️ NOUVEAU CHAMP programme (fusion)
        const program = `
Dimanche: ${progDimanche}
Lundi: ${progLundi}
Mardi: ${progMardi}
Mercredi: ${progMercredi}
`;

        /* =========================
           VALIDATION
        ========================== */
        if (
            !lastname ||
            !firstname ||
            !email ||
            !phone ||
            !profession ||
            !status ||
            !wilaya ||
            !progDimanche ||
            !progLundi ||
            !progMardi ||
            !progMercredi
        ) {
            showError("Veuillez remplir tous les champs.");
            return;
        }

        if (!isValidEmail(email)) {
            showError("Email invalide.");
            return;
        }

        if (!isValidPhone(phone)) {
            showError("Téléphone invalide.");
            return;
        }

        /* =========================
           SEND TO SERVER
        ========================== */
        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    lastname,
                    firstname,
                    email,
                    phone,
                    profession,
                    status,
                    wilaya,
                    program
                })
            });

            const result = await response.json();

            if (result.success) {

                popupText.textContent =
                    `Bienvenue ${firstname} ${lastname} ✨ Inscription réussie !`;

                popup.classList.remove("hidden");

                form.reset();
                clearMessage();

            } else {
                showError(result.message || "Erreur lors de l'inscription.");
            }

        } catch (err) {
            console.error(err);
            showError("Erreur serveur, veuillez réessayer.");
        }

    });

    /* =========================
       POPUP
    ========================== */
    closePopup.addEventListener("click", () => {
        popup.classList.add("hidden");
    });

    popup.addEventListener("click", (e) => {
        if (e.target === popup) {
            popup.classList.add("hidden");
        }
    });

});
