const express = require("express");
const router = express.Router();
const db = require("../db");

function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    return res.status(401).json({ error: "Неавторизований доступ" });
}

function parseBriefRow(row) {
    return {
        ...row,
        goals: JSON.parse(row.goals || "[]"),
        audience: JSON.parse(row.audience || "[]"),
        sections: JSON.parse(row.sections || "[]")
    };
}

// ПУБЛІЧНИЙ маршрут: будь-хто може надсилати бриф
router.post("/brief", (req, res) => {
    const {
        organizationName,
        contactPerson,
        email,
        phone,
        projectType,
        projectProblem,
        goals,
        audience,
        sections,
        features,
        stakeholders,
        successCriteria,
        constraints,
        designStyle,
        referenceSites,
        deadline,
        budget,
        additionalInfo
    } = req.body;

    if (
        !organizationName ||
        !contactPerson ||
        !email ||
        !projectType ||
        !projectProblem ||
        !features ||
        !designStyle ||
        !deadline ||
        !budget
    ) {
        return res.status(400).json({ error: "Не всі обов’язкові поля заповнені." });
    }

    if (!Array.isArray(goals) || goals.length === 0) {
        return res.status(400).json({ error: "Оберіть хоча б одну мету." });
    }

    if (!Array.isArray(audience) || audience.length === 0) {
        return res.status(400).json({ error: "Оберіть хоча б одну цільову аудиторію." });
    }

    if (!Array.isArray(sections) || sections.length === 0) {
        return res.status(400).json({ error: "Оберіть хоча б один розділ." });
    }

    const sql = `
        INSERT INTO briefs (
            organizationName,
            contactPerson,
            email,
            phone,
            projectType,
            projectProblem,
            goals,
            audience,
            sections,
            features,
            stakeholders,
            successCriteria,
            constraints,
            designStyle,
            referenceSites,
            deadline,
            budget,
            additionalInfo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [
            organizationName.trim(),
            contactPerson.trim(),
            email.trim(),
            phone?.trim() || "",
            projectType,
            projectProblem.trim(),
            JSON.stringify(goals),
            JSON.stringify(audience),
            JSON.stringify(sections),
            features.trim(),
            stakeholders?.trim() || "",
            successCriteria?.trim() || "",
            constraints?.trim() || "",
            designStyle,
            referenceSites?.trim() || "",
            deadline.trim(),
            budget,
            additionalInfo?.trim() || ""
        ],
        function (err) {
            if (err) {
                console.error("INSERT ERROR:", err.message);
                return res.status(500).json({ error: "Помилка при збереженні брифу." });
            }

            res.status(201).json({
                message: "Бриф успішно збережено.",
                id: this.lastID
            });
        }
    );
});

// ДАЛІ ВСЕ ЛИШЕ ДЛЯ АДМІНА

router.get("/brief", requireAdmin, (req, res) => {
    db.all("SELECT * FROM briefs ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            console.error("GET ALL ERROR:", err.message);
            return res.status(500).json({ error: "Помилка при отриманні брифів." });
        }

        const briefs = rows.map(parseBriefRow);
        res.json(briefs);
    });
});

router.get("/brief/:id", requireAdmin, (req, res) => {
    db.get("SELECT * FROM briefs WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            console.error("GET ONE ERROR:", err.message);
            return res.status(500).json({ error: "Помилка при отриманні брифу." });
        }

        if (!row) {
            return res.status(404).json({ error: "Бриф не знайдено." });
        }

        res.json(parseBriefRow(row));
    });
});

router.put("/brief/:id", requireAdmin, (req, res) => {
    const {
        organizationName,
        contactPerson,
        email,
        phone,
        projectType,
        projectProblem,
        goals,
        audience,
        sections,
        features,
        stakeholders,
        successCriteria,
        constraints,
        designStyle,
        referenceSites,
        deadline,
        budget,
        additionalInfo
    } = req.body;

    if (
        !organizationName ||
        !contactPerson ||
        !email ||
        !projectType ||
        !projectProblem ||
        !features ||
        !designStyle ||
        !deadline ||
        !budget
    ) {
        return res.status(400).json({ error: "Не всі обов’язкові поля заповнені." });
    }

    if (!Array.isArray(goals) || goals.length === 0) {
        return res.status(400).json({ error: "Оберіть хоча б одну мету." });
    }

    if (!Array.isArray(audience) || audience.length === 0) {
        return res.status(400).json({ error: "Оберіть хоча б одну цільову аудиторію." });
    }

    if (!Array.isArray(sections) || sections.length === 0) {
        return res.status(400).json({ error: "Оберіть хоча б один розділ." });
    }

    const sql = `
        UPDATE briefs SET
                          organizationName = ?,
                          contactPerson = ?,
                          email = ?,
                          phone = ?,
                          projectType = ?,
                          projectProblem = ?,
                          goals = ?,
                          audience = ?,
                          sections = ?,
                          features = ?,
                          stakeholders = ?,
                          successCriteria = ?,
                          constraints = ?,
                          designStyle = ?,
                          referenceSites = ?,
                          deadline = ?,
                          budget = ?,
                          additionalInfo = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [
            organizationName.trim(),
            contactPerson.trim(),
            email.trim(),
            phone?.trim() || "",
            projectType,
            projectProblem.trim(),
            JSON.stringify(goals),
            JSON.stringify(audience),
            JSON.stringify(sections),
            features.trim(),
            stakeholders?.trim() || "",
            successCriteria?.trim() || "",
            constraints?.trim() || "",
            designStyle,
            referenceSites?.trim() || "",
            deadline.trim(),
            budget,
            additionalInfo?.trim() || "",
            req.params.id
        ],
        function (err) {
            if (err) {
                console.error("UPDATE ERROR:", err.message);
                return res.status(500).json({ error: "Помилка при оновленні брифу." });
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "Бриф не знайдено." });
            }

            res.json({ message: "Бриф успішно оновлено." });
        }
    );
});

router.delete("/brief/:id", requireAdmin, (req, res) => {
    db.run("DELETE FROM briefs WHERE id = ?", [req.params.id], function (err) {
        if (err) {
            console.error("DELETE ERROR:", err.message);
            return res.status(500).json({ error: "Помилка при видаленні брифу." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Бриф не знайдено." });
        }

        res.json({ message: "Бриф успішно видалено." });
    });
});

module.exports = router;