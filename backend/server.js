const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();

const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.log("DB error:", err);
  else console.log("SQLite connected");
});

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
      time TEXT,
      endTime TEXT
    )
  `);

  db.run("ALTER TABLE appointments ADD COLUMN endTime TEXT", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.log("ALTER error:", err.message);
    }
  });
});

const serviceDurations = {
  "Šišanje": 30,
  "Feniranje": 30,
  "Farbanje": 60,
  "Svečana frizura": 60,
};

const allTimes = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function calculateEndTime(startTime, service) {
  const services = service.split(",").map((s) => s.trim());

  const totalDuration = services.reduce((sum, s) => {
    return sum + (serviceDurations[s] || 0);
  }, 0);

  return minutesToTime(timeToMinutes(startTime) + totalDuration);
}

app.get("/", (req, res) => {
  res.send("Backend radi");
});

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

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ message: "Greška" });

    if (!user) {
      return res.status(401).json({ message: "Nalog ne postoji" });
    }

    const ok = bcrypt.compareSync(password, user.password);

    if (!ok) {
      return res.status(401).json({ message: "Pogrešna lozinka" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, "tajni_kljuc");

    res.json({
      token,
      userId: user.id,
    });
  });
});

app.get("/available-times/:date", (req, res) => {
  const { date } = req.params;

  db.all("SELECT * FROM appointments WHERE date = ?", [date], (err, rows) => {
    if (err) {
      return res.status(500).json([]);
    }

    const availableTimes = allTimes.filter((time) => {
      const currentStart = timeToMinutes(time);
      const currentEnd = currentStart + 60;

      const busy = rows.some((appointment) => {
        const existingStart = timeToMinutes(appointment.time);
        const existingEnd = timeToMinutes(appointment.endTime || appointment.time);

        return currentStart < existingEnd && currentEnd > existingStart;
      });

      return !busy;
    });

    res.json(availableTimes);
  });
});

app.post("/appointments", (req, res) => {
  const { userId, service, date, time } = req.body;

  if (!userId || !service || !date || !time) {
    return res.status(400).json({ message: "Nedostaju podaci za termin" });
  }

  const newStart = timeToMinutes(time);
  const endTime = calculateEndTime(time, service);
  const newEnd = timeToMinutes(endTime);

  db.all("SELECT * FROM appointments WHERE date = ?", [date], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Greška" });
    }

    const conflict = rows.some((appointment) => {
      const existingStart = timeToMinutes(appointment.time);
      const existingEnd = timeToMinutes(appointment.endTime || appointment.time);

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (conflict) {
      return res.status(400).json({
        message: "Termin je zauzet u tom periodu",
      });
    }

    db.run(
      "INSERT INTO appointments (userId, service, date, time, endTime) VALUES (?, ?, ?, ?, ?)",
      [userId, service, date, time, endTime],
      function (err) {
        if (err) {
          return res.status(500).json({ message: "Greška" });
        }

        res.json({ message: "Termin dodat", endTime });
      }
    );
  });
});

app.get("/appointments/occupied/:date", (req, res) => {
  const { date } = req.params;

  db.all("SELECT time FROM appointments WHERE date = ?", [date], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Greška" });
    }

    res.json({
      occupied: rows.map((r) => r.time),
    });
  });
});

app.get("/appointments/:userId", (req, res) => {
  const userId = parseInt(req.params.userId, 10);

  if (isNaN(userId)) {
    return res.status(400).json({
      message: "Nevalidan userId",
      appointments: [],
    });
  }

  db.all("SELECT * FROM appointments WHERE userId = ?", [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: "Greška na serveru",
        appointments: [],
      });
    }

    res.json({
      message: "OK",
      appointments: rows,
    });
  });
});

app.delete("/appointments/:id", (req, res) => {
  db.run("DELETE FROM appointments WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ message: "Greška" });

    res.json({ message: "Obrisano" });
  });
});

app.put("/appointments/:id", (req, res) => {
  const { id } = req.params;
  const { service, date, time } = req.body;

  if (!service || !date || !time) {
    return res.status(400).json({ message: "Nedostaju podaci" });
  }

  const newStart = timeToMinutes(time);
  const endTime = calculateEndTime(time, service);
  const newEnd = timeToMinutes(endTime);

  db.all("SELECT * FROM appointments WHERE date = ? AND id != ?", [date, id], (err, rows) => {
    if (err) return res.status(500).json({ message: "Greška" });

    const conflict = rows.some((appointment) => {
      const existingStart = timeToMinutes(appointment.time);
      const existingEnd = timeToMinutes(appointment.endTime || appointment.time);

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (conflict) {
      return res.status(400).json({ message: "Termin je zauzet" });
    }

    db.run(
      "UPDATE appointments SET service = ?, date = ?, time = ?, endTime = ? WHERE id = ?",
      [service, date, time, endTime, id],
      function (err) {
        if (err) return res.status(500).json({ message: "Greška" });

        res.json({ message: "Termin ažuriran" });
      }
    );
  });
});

const PORT = 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:" + PORT);
});