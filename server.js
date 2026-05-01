const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

const ADMIN_PASSWORD = "parajuna2026";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..")));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "parajuna_db"
});

db.connect((err) => {
    if (err) {
        console.error("Erreur connexion base de données :", err);
        return;
    }

    console.log("Base de données connectée ✔️");
});

app.get("/", (req, res) => {
    res.send("Backend Parajuna fonctionne ✔️");
});

app.post("/api/register", (req, res) => {
    const { name, email, phone, profession, program } = req.body;

    if (!name || !email || !phone || !profession || !program) {
        return res.status(400).json({
            success: false,
            message: "Veuillez remplir tous les champs."
        });
    }

    const sql = `
        INSERT INTO inscriptions 
        (name, email, phone, profession, program)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, email, phone, profession, program], (err) => {
        if (err) {
            console.error("Erreur insertion :", err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de l'inscription."
            });
        }

        res.json({
            success: true,
            message: "Inscription enregistrée avec succès."
        });
    });
});

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
        message: "Connexion réussie."
    });
});

app.get("/api/admin/inscriptions", (req, res) => {
    const sql = "SELECT * FROM inscriptions ORDER BY created_at DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Erreur chargement inscriptions :", err);
            return res.status(500).json({
                success: false,
                message: "Erreur lors du chargement des inscriptions."
            });
        }

        res.json({
            success: true,
            inscriptions: results
        });
    });
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
