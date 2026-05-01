const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

const app = express();

// ✅ PORT RAILWAY
const PORT = process.env.PORT || 3000;

// 🔐 Admin password
const ADMIN_PASSWORD = "parajuna2026";

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📂 Static files
app.use(express.static(__dirname));

// ⚠️ DATABASE (Railway MySQL)
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

// 🔍 DEBUG MYSQL VARIABLES
console.log("MYSQLHOST =", process.env.MYSQLHOST);
console.log("MYSQLUSER =", process.env.MYSQLUSER);
console.log("MYSQLDATABASE =", process.env.MYSQLDATABASE);

// Connexion DB
db.connect((err) => {
    if (err) {
        console.error("❌ Erreur connexion base de données :", err);
        return;
    }
    console.log("✔ Base de données connectée");
});


// 🏠 HOME PAGE
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "parajuna.html"));
});


// 📝 INSCRIPTION
app.post("/api/register", (req, res) => {
    console.log("📩 INSCRIPTION REÇUE :", req.body);

    const { name, email, phone, profession, program } = req.body;

    if (!name || !email || !phone || !profession || !program) {
        return res.status(400).json({
            success: false,
            message: "Veuillez remplir tous les champs."
        });
    }

    const sql = `
        INSERT INTO inscriptions (name, email, phone, profession, program)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, email, phone, profession, program], (err) => {
        if (err) {
            console.error("❌ SQL ERROR FULL:", err);

            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.json({
            success: true,
            message: "Inscription enregistrée ✔"
        });
    });
});


// 🔐 ADMIN LOGIN
app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({
            success: false,
            message: "Mot de passe incorrect."
        });
    }

    res.json({
        success: true,
        message: "Connexion réussie ✔"
    });
});


// 📋 LISTE INSCRIPTIONS
app.get("/api/admin/inscriptions", (req, res) => {
    const sql = "SELECT * FROM inscriptions ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Erreur chargement :", err);
            return res.status(500).json({
                success: false,
                message: "Erreur serveur"
            });
        }

        res.json({
            success: true,
            inscriptions: results
        });
    });
});


// 🚀 START SERVER
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur port ${PORT}`);
});
