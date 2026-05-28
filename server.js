const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   POSTGRES CONNECTION
========================= */
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/* =========================
   INIT DATABASE TABLES
========================= */
async function initDB() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL,
        service TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL
      );
    `);

    console.log("Database ready");
  } catch (err) {
    console.log("DB init error:", err);
  }
}

initDB();

/* =========================
   REGISTER
========================= */
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (email, password) VALUES ($1, $2)",
      [email, hashedPassword]
    );

    res.json({ message: "Uspešna registracija" });
  } catch (err) {
    res.status(400).json({
      message: "Korisnik već postoji",
    });
  }
});

/* =========================
   LOGIN
========================= */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        message: "Nalog ne postoji. Molimo registrujte se.",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        message: "Pogrešna lozinka",
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      "tajni_kljuc"
    );

    res.json({
      token,
      userId: user.id,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
    });
  }
});

/* =========================
   CREATE APPOINTMENT
========================= */
app.post("/appointments", async (req, res) => {
  const { userId, service, date, time } = req.body;

  try {
    const existing = await db.query(
      "SELECT * FROM appointments WHERE date = $1 AND time = $2",
      [date, time]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Termin je zauzet",
      });
    }

    await db.query(
      "INSERT INTO appointments (userId, service, date, time) VALUES ($1, $2, $3, $4)",
      [userId, service, date, time]
    );

    res.json({ message: "Termin uspešno dodat" });
  } catch (err) {
    res.status(500).json({ message: "Greška na serveru" });
  }
});

/* =========================
   GET USER APPOINTMENTS
========================= */
app.get("/appointments/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM appointments WHERE userId = $1",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json([]);
  }
});

/* =========================
   DELETE APPOINTMENT
========================= */
app.delete("/appointments/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(
      "DELETE FROM appointments WHERE id = $1",
      [id]
    );

    res.json({ message: "Termin obrisan" });
  } catch (err) {
    res.status(500).json({ message: "Greška" });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server radi na portu " + PORT);
});