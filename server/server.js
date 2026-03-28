const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");

require("./db");
const briefRoutes = require("./routes/briefRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../client")));

app.use(session({
    secret: "brief_super_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }
}));

function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    return res.status(401).json({ error: "Неавторизований доступ" });
}

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345";

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        return res.json({ message: "Вхід успішний" });
    }

    return res.status(401).json({ error: "Невірний логін або пароль" });
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Вихід виконано" });
    });
});

app.get("/check-auth", (req, res) => {
    res.json({ authenticated: !!(req.session && req.session.isAdmin) });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "index.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "login.html"));
});

app.get("/admin.html", (req, res) => {
    if (req.session && req.session.isAdmin) {
        return res.sendFile(path.join(__dirname, "../client", "admin.html"));
    }
    return res.redirect("/login.html");
});

app.use("/api", briefRoutes);

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});