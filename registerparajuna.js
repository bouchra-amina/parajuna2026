const form = document.getElementById("registerForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const professionInput = document.getElementById("profession");
const programInput = document.getElementById("program");
const message = document.getElementById("message");

form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const profession = professionInput.value;
    const program = programInput.value;

    // validation
    if (!name || !email || !phone || !profession || !program) {
        message.style.color = "#ff4d4d";
        message.textContent = "Veuillez remplir tous les champs.";
        return;
    }

    if (!email.includes("@")) {
        message.style.color = "#ff4d4d";
        message.textContent = "Email invalide.";
        return;
    }

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                profession,
                program
            })
        });

        const result = await response.json();

        if (result.success) {
            message.style.color = "#00ff99";
            message.textContent = "Inscription réussie ✔";
            form.reset();
        } else {
            message.style.color = "#ff4d4d";
            message.textContent = result.message || "Erreur lors de l'inscription.";
        }

    } catch (error) {
        message.style.color = "#ff4d4d";
        message.textContent = "Erreur serveur.";
        console.error(error);
    }
});
