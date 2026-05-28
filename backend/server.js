const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./salon.db");

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

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    `
    INSERT INTO users (email, password)
    VALUES (?, ?)
  `,
    [email, hashedPassword],
    function (err) {
      if (err) {
        return res.status(400).json({
          message: "Korisnik već postoji",
        });
      }

      res.json({
        message: "Uspešna registracija",
      });
    }
  );
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    `
    SELECT * FROM users WHERE email = ?
  `,
    [email],
    async (err, user) => {
      if (!user) {
        return res.status(401).json({
          message: "Pogrešan email",
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
        {
          id: user.id,
          email: user.email,
        },
        "tajni_kljuc"
      );

      res.json({
        token,
        userId: user.id,
      });
    }
  );
});

app.post("/appointments", (req, res) => {
  const { userId, service, date, time } = req.body;

  db.get(
    `
    SELECT * FROM appointments
    WHERE date = ? AND time = ?
  `,
    [date, time],
    (err, existingAppointment) => {
      if (existingAppointment) {
        return res.status(400).json({
          message: "Termin je zauzet",
        });
      }

      db.run(
        `
        INSERT INTO appointments
        (userId, service, date, time)
        VALUES (?, ?, ?, ?)
      `,
        [userId, service, date, time],
        function (err) {
          if (err) {
            return res.status(500).json({
              message: "Greška",
            });
          }

          res.json({
            message: "Termin uspešno dodat",
          });
        }
      );
    }
  );
});

app.get("/appointments/:userId", (req, res) => {
  const { userId } = req.params;

  db.all(
    `
    SELECT * FROM appointments
    WHERE userId = ?
  `,
    [userId],
    (err, rows) => {
      res.json(rows);
    }
  );
});

app.delete("/appointments/:id", (req, res) => {
  const { id } = req.params;

  db.run(
    `
    DELETE FROM appointments
    WHERE id = ?
  `,
    [id],
    function (err) {
      res.json({
        message: "Termin obrisan",
      });
    }
  );
});

app.listen(3000, () => {
  console.log("Server radi na portu 3000");
});