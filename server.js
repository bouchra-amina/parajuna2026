const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   ADMIN PASSWORD
========================= */
const ADMIN_PASSWORD = "parajuna2026";

/* =========================
   MIDDLEWARES
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* fichiers statiques */
app.use(express.static(__dirname));

/* =========================
   DATABASE
========================= */
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
    port: process.env.MYSQLPORT
});

db.connect((err) => {
    if (err) {
        console.error("❌ Erreur connexion MySQL :", err);
        return;
    }

    console.log("✔ Base de données connectée");
});

/* =========================
   EMAIL CONFIG
========================= */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sayadbouchraamina@gmail.com",
        pass: "ujav qgup wquk fjkt"
    }
});

/* =========================
   HOME PAGE
========================= */
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "parajuna.html"));
});

/* =========================
   REGISTER
========================= */
app.post("/api/register", (req, res) => {

    const {
        lastname,
        firstname,
        fullName,
        email,
        phone,
        profession,
        status,
        
        wilaya,
        program
    } = req.body;

    /* validation */
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
        return res.status(400).json({
            success: false,
            message: "Veuillez remplir tous les champs."
        });
    }

    const finalFullName = fullName || `${lastname} ${firstname}`;

    const sql = `
        INSERT INTO inscriptions
        (
            lastname,
            firstname,
            fullName,
            email,
            phone,
            profession,
            status,
            
            wilaya,
            program
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        lastname,
        firstname,
        finalFullName,
        email,
        phone,
        profession,
        status,
        
        wilaya,
        program
    ];

    db.query(sql, values, (err) => {

        if (err) {
            console.error("❌ Erreur insertion :", err);

            return res.status(500).json({
                success: false,
                message: "Erreur base de données."
            });
        }

        /* email confirmation */
        transporter.sendMail(
            {
                from: "Parajuna <sayadbouchraamina@gmail.com>",
                to: email,
                subject: "Confirmation inscription Parajuna",
                text:
`Bonjour ${firstname} ${lastname},

Votre inscription à PARAJUNA est confirmée ✔

Informations :
Nom : ${lastname}
Prénom : ${firstname}
Email : ${email}
Téléphone : ${phone}
Filière : ${profession}
Statut : ${status}
Wilaya : ${wilaya}
Programme : ${program}

Merci et à bientôt.`
            },
            (mailError) => {
                if (mailError) {
                    console.error("⚠ Erreur envoi email :", mailError);
                }
            }
        );

        return res.json({
            success: true,
            message: "Inscription réussie."
        });
    });
});

/* =========================
   ADMIN LOGIN
========================= */
app.post("/api/admin/login", (req, res) => {

    if (req.body.password !== ADMIN_PASSWORD) {
        return res.status(401).json({
            success: false,
            message: "Mot de passe incorrect."
        });
    }

    res.json({ success: true });
});

/* =========================
   GET INSCRIPTIONS
========================= */
app.get("/api/admin/inscriptions", (req, res) => {

    const sql = `
        SELECT *
        FROM inscriptions
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("❌ Erreur lecture :", err);

            return res.status(500).json({
                success: false
            });
        }

        res.json({
            success: true,
            inscriptions: results
        });
    });
});

/* =========================
   DELETE INSCRIPTION
========================= */
app.delete("/api/admin/inscriptions/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM inscriptions WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.error("❌ Erreur suppression :", err);

            return res.status(500).json({
                success: false,
                message: "Erreur base de données."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Inscription introuvable."
            });
        }

        res.json({
            success: true,
            message: "Inscription supprimée avec succès."
        });
    });
});
/* =========================
   UPDATE PRESENCE
========================= */
app.put("/api/admin/presence/:id", (req, res) => {

    const id = req.params.id;
    const { presence } = req.body;

    const sql = "UPDATE inscriptions SET presence = ? WHERE id = ?";

    db.query(sql, [presence, id], (err) => {

        if (err) {
            console.error("❌ Erreur update presence :", err);
            return res.status(500).json({
                success: false,
                message: "Erreur base de données."
            });
        }

        res.json({
            success: true,
            message: "Presence mise à jour"
        });
    });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
