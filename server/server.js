const express = require("express");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const db = require("./db");
const briefRoutes = require("./routes/briefRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../client")));

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "12345";

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = crypto.randomBytes(32).toString("hex");

        db.run(
            "INSERT INTO admin_tokens (token, createdAt) VALUES (?, ?)",
            [token, Date.now()],
            (err) => {
                if (err) {
                    console.error("LOGIN TOKEN ERROR:", err.message);
                    return res.status(500).json({ error: "Помилка сервера" });
                }

                return res.json({
                    message: "Вхід успішний",
                    token
                });
            }
        );

        return;
    }

    return res.status(401).json({ error: "Невірний логін або пароль" });
});

app.post("/logout", (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (token) {
        db.run("DELETE FROM admin_tokens WHERE token = ?", [token], () => {});
    }
    res.json({ message: "Вихід виконано" });
});

app.get("/check-auth", (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
        return res.json({ authenticated: false });
    }

    db.get("SELECT token FROM admin_tokens WHERE token = ?", [token], (err, row) => {
        if (err || !row) {
            return res.json({ authenticated: false });
        }
        res.json({ authenticated: true });
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "index.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "login.html"));
});

app.get("/admin.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "admin.html"));
});

app.use("/api", briefRoutes);

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
