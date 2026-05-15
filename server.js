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
app.use(express.static(__dirname));

/* =========================
   DATABASE (FIX RAILWAY)
========================= */

/* DEBUG ENV (important pour Railway) */
console.log("MYSQL_URL =", process.env.MYSQL_URL);
console.log({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT
});

/* CONNECTION SAFE */
let db;

if (process.env.MYSQL_URL) {
    // Railway recommended way
    db = mysql.createPool(process.env.MYSQL_URL);
} else {
    // fallback manual
    db = mysql.createPool({
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER || "root",
        password: process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || "",
        database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || "railway",
        port: process.env.MYSQLPORT || 3306,
        waitForConnections: true,
        connectionLimit: 10
    });
}

/* TEST CONNECTION */
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ MySQL connection error:", err);
        return;
    }
    console.log("✔ MySQL connecté avec succès");
    connection.release();
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
        (lastname, firstname, fullName, email, phone, profession, status, wilaya, program)
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

        transporter.sendMail({
            from: "Parajuna <sayadbouchraamina@gmail.com>",
            to: email,
            subject: "Confirmation inscription Parajuna",
            text: `Bonjour ${firstname} ${lastname},

Votre inscription à PARAJUNA est confirmée ✔`
        });

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

    const sql = "SELECT * FROM inscriptions ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Erreur lecture :", err);
            return res.status(500).json({ success: false });
        }

        res.json({
            success: true,
            inscriptions: results
        });
    });
});

/* =========================
   DELETE
========================= */
app.delete("/api/admin/inscriptions/:id", (req, res) => {

    db.query(
        "DELETE FROM inscriptions WHERE id = ?",
        [req.params.id],
        (err, result) => {

            if (err) {
                return res.status(500).json({ success: false });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false });
            }

            res.json({ success: true });
        }
    );
});

/* =========================
   UPDATE PRESENCE
========================= */
app.put("/api/admin/presence/:id", (req, res) => {

    db.query(
        "UPDATE inscriptions SET presence = ? WHERE id = ?",
        [req.body.presence, req.params.id],
        (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur base de données."
                });
            }

            res.json({ success: true });
        }
    );
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
