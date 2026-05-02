const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();

const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = "parajuna2026";

// =======================
// MIDDLEWARES
// =======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIX IMPORTANT : servir uniquement /public

app.use(express.static(__dirname));

// =======================
// DATABASE
// =======================
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
    port: process.env.MYSQLPORT
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection error:", err);
        return;
    }
    console.log("✔ Database connected successfully");
});

// =======================
// EMAIL
// =======================
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sayadbouchraamina@gmail.com",
        pass: "ujav qgup wquk fjkt"
    }
});

// =======================
// HOME
// =======================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "registerparajuna.html"));
});

// =======================
// REGISTER
// =======================
app.post("/api/register", (req, res) => {
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
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Erreur base de données"
            });
        }

        transporter.sendMail({
            from: "Parajuna <sayadbouchraamina@gmail.com>",
            to: email,
            subject: "Confirmation inscription",
            text: `Bonjour ${name}, inscription confirmée ✔`
        });

        res.json({ success: true });
    });
});

// =======================
// ADMIN
// =======================
app.post("/api/admin/login", (req, res) => {
    if (req.body.password !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false });
    }
    res.json({ success: true });
});

app.get("/api/admin/inscriptions", (req, res) => {
    db.query("SELECT * FROM inscriptions ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, inscriptions: results });
    });
});

// =======================
// START
// =======================
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
