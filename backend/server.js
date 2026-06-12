const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   SQLITE DATABASE
========================= */
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.log("DB error:", err);
  } else {
    console.log("SQLite connected");
  }
});

/* =========================
   INIT TABLES
========================= */
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      service TEXT,
      date TEXT,
      time TEXT
    )
  `);
});

/* =========================
   REGISTER
========================= */
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const hashed = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashed],
    function (err) {
      if (err) {
        return res.status(400).json({ message: "Korisnik već postoji" });
      }

      res.json({ message: "Registracija uspešna" });
    }
  );
});

/* =========================
   LOGIN
========================= */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, user) => {
      if (err) return res.status(500).json({ message: "Greška" });

      if (!user) {
        return res.status(401).json({ message: "Nalog ne postoji" });
      }

      const ok = bcrypt.compareSync(password, user.password);

      if (!ok) {
        return res.status(401).json({ message: "Pogrešna lozinka" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        "tajni_kljuc"
      );

      res.json({
        token,
        userId: user.id,
      });
    }
  );
});

/* =========================
   APPOINTMENTS
========================= */
app.post("/appointments", (req, res) => {
  const { userId, service, date, time } = req.body;

  db.get(
    "SELECT * FROM appointments WHERE date=? AND time=?",
    [date, time],
    (err, row) => {
      if (row) {
        return res.status(400).json({ message: "Termin zauzet" });
      }

      db.run(
        "INSERT INTO appointments (userId, service, date, time) VALUES (?, ?, ?, ?)",
        [userId, service, date, time],
        function (err) {
          if (err) {
            return res.status(500).json({ message: "Greška" });
          }

          res.json({ message: "Termin dodat" });
        }
      );
    }
  );
});

/* =========================
   GET APPOINTMENTS
========================= */
app.get("/appointments/:userId", (req, res) => {
  db.all(
    "SELECT * FROM appointments WHERE userId=?",
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json([]);

      res.json(rows);
    }
  );
});

/* =========================
   DELETE APPOINTMENT
========================= */
app.delete("/appointments/:id", (req, res) => {
  db.run(
    "DELETE FROM appointments WHERE id=?",
    [req.params.id],
    function (err) {
      if (err) {
        return res.status(500).json({ message: "Greška" });
      }

      res.json({ message: "Obrisano" });
    }
  );
});


/* =========================
   START SERVER
========================= */
const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:" + PORT);
});


