const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

const app = express();

// =======================
// PORT
// =======================
const PORT = process.env.PORT || 3000;

// =======================
// ADMIN PASSWORD
// =======================
const ADMIN_PASSWORD = "parajuna2026";

// =======================
// MIDDLEWARES
// =======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// STATIC FILES (frontend)
// =======================
app.use(express.static(__dirname));

// =======================
// DATABASE (Railway MySQL)
// =======================
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
    port: process.env.MYSQLPORT
});

// =======================
// DEBUG ENV
// =======================
console.log("MYSQLHOST =", process.env.MYSQLHOST);
console.log("MYSQLUSER =", process.env.MYSQLUSER);
console.log("MYSQLDATABASE =", process.env.MYSQLDATABASE);

// =======================
// DB CONNECTION
// =======================
db.connect((err) => {
    if (err) {
        console.error("❌ Database connection error:", err);
        return;
    }
    console.log("✔ Database connected successfully");
});

// =======================
// HOME ROUTE
// =======================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "parajuna.html"));
});

// =======================
// REGISTER USER
// =======================
app.post("/api/register", (req, res) => {
    console.log("📩 NEW REGISTER:", req.body);

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
            console.error("❌ SQL ERROR:", err);

            return res.status(500).json({
                success: false,
                message: "Erreur base de données"
            });
        }

        res.json({
            success: true,
            message: "Inscription enregistrée ✔"
        });
    });
});

// =======================
// ADMIN LOGIN
// =======================
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

// =======================
// GET ALL INSCRIPTIONS
// =======================
app.get("/api/admin/inscriptions", (req, res) => {
    const sql = "SELECT * FROM inscriptions ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Error loading data:", err);

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

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
