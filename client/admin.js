const briefList = document.getElementById("briefList");
const editSection = document.getElementById("editSection");
const editForm = document.getElementById("editForm");
const cancelEditBtn = document.getElementById("cancelEdit");
const logoutBtn = document.getElementById("logoutBtn");

function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function setCheckedValues(selectorName, values) {
    const checkboxes = document.querySelectorAll(`input[name="${selectorName}"]`);
    checkboxes.forEach(checkbox => {
        checkbox.checked = values.includes(checkbox.value);
    });
}

function getCheckedValues(selectorName) {
    return [...document.querySelectorAll(`input[name="${selectorName}"]:checked`)].map(item => item.value);
}

function formatArray(arr) {
    return arr && arr.length ? arr.join(", ") : "—";
}

async function checkAuth() {
    try {
        const response = await fetch("/check-auth");
        const result = await response.json();

        if (!result.authenticated) {
            window.location.href = "/login.html";
        }
    } catch (error) {
        window.location.href = "/login.html";
    }
}

async function loadBriefs() {
    try {
        const response = await fetch("/api/brief");
        const briefs = await response.json();

        if (!response.ok) {
            throw new Error(briefs.error || "Помилка при завантаженні брифів");
        }

        briefList.innerHTML = "";

        if (!briefs.length) {
            briefList.innerHTML = "<p>Брифів поки немає.</p>";
            return;
        }

        briefs.forEach(brief => {
            const card = document.createElement("div");
            card.className = "brief-card";

            card.innerHTML = `
                <h3>${escapeHtml(brief.organizationName)}</h3>
                <p><strong>Контактна особа:</strong> ${escapeHtml(brief.contactPerson)}</p>
                <p><strong>Email:</strong> ${escapeHtml(brief.email)}</p>
                <p><strong>Телефон:</strong> ${escapeHtml(brief.phone || "—")}</p>
                <p><strong>Тип проєкту:</strong> ${escapeHtml(brief.projectType || "—")}</p>
                <p><strong>Проблема:</strong> ${escapeHtml(brief.projectProblem || "—")}</p>
                <p><strong>Мета:</strong> ${escapeHtml(formatArray(brief.goals))}</p>
                <p><strong>Аудиторія:</strong> ${escapeHtml(formatArray(brief.audience))}</p>
                <p><strong>Розділи:</strong> ${escapeHtml(formatArray(brief.sections))}</p>
                <p><strong>Функції:</strong> ${escapeHtml(brief.features || "—")}</p>
                <p><strong>Стейкхолдери:</strong> ${escapeHtml(brief.stakeholders || "—")}</p>
                <p><strong>Критерії успіху:</strong> ${escapeHtml(brief.successCriteria || "—")}</p>
                <p><strong>Обмеження:</strong> ${escapeHtml(brief.constraints || "—")}</p>
                <p><strong>Стиль дизайну:</strong> ${escapeHtml(brief.designStyle || "—")}</p>
                <p><strong>Приклади сайтів:</strong> ${escapeHtml(brief.referenceSites || "—")}</p>
                <p><strong>Термін:</strong> ${escapeHtml(brief.deadline || "—")}</p>
                <p><strong>Бюджет:</strong> ${escapeHtml(brief.budget || "—")}</p>
                <p><strong>Додатково:</strong> ${escapeHtml(brief.additionalInfo || "—")}</p>
                <p><strong>Створено:</strong> ${escapeHtml(brief.createdAt || "—")}</p>
                <div class="card-buttons">
                    <button data-edit-id="${brief.id}">Редагувати</button>
                    <button class="danger-btn" data-delete-id="${brief.id}">Видалити</button>
                </div>
            `;

            briefList.appendChild(card);
        });

        document.querySelectorAll("[data-edit-id]").forEach(button => {
            button.addEventListener("click", () => editBrief(button.dataset.editId));
        });

        document.querySelectorAll("[data-delete-id]").forEach(button => {
            button.addEventListener("click", () => deleteBrief(button.dataset.deleteId));
        });
    } catch (error) {
        console.error(error);
        briefList.innerHTML = "<p>Не вдалося завантажити брифи.</p>";
    }
}

async function editBrief(id) {
    try {
        const response = await fetch(`/api/brief/${id}`);
        const brief = await response.json();

        if (!response.ok) {
            throw new Error(brief.error || "Помилка при завантаженні брифу");
        }

        document.getElementById("editId").value = brief.id;
        document.getElementById("editOrganizationName").value = brief.organizationName || "";
        document.getElementById("editContactPerson").value = brief.contactPerson || "";
        document.getElementById("editEmail").value = brief.email || "";
        document.getElementById("editPhone").value = brief.phone || "";
        document.getElementById("editProjectType").value = brief.projectType || "";
        document.getElementById("editProjectProblem").value = brief.projectProblem || "";
        document.getElementById("editFeatures").value = brief.features || "";
        document.getElementById("editStakeholders").value = brief.stakeholders || "";
        document.getElementById("editSuccessCriteria").value = brief.successCriteria || "";
        document.getElementById("editConstraints").value = brief.constraints || "";
        document.getElementById("editDesignStyle").value = brief.designStyle || "";
        document.getElementById("editReferenceSites").value = brief.referenceSites || "";
        document.getElementById("editDeadline").value = brief.deadline || "";
        document.getElementById("editBudget").value = brief.budget || "";
        document.getElementById("editAdditionalInfo").value = brief.additionalInfo || "";

        setCheckedValues("editGoals", brief.goals || []);
        setCheckedValues("editAudience", brief.audience || []);
        setCheckedValues("editSections", brief.sections || []);

        editSection.classList.remove("hidden");
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (error) {
        console.error(error);
        alert("Помилка: " + error.message);
    }
}

editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editId").value;

    const updatedData = {
        organizationName: document.getElementById("editOrganizationName").value.trim(),
        contactPerson: document.getElementById("editContactPerson").value.trim(),
        email: document.getElementById("editEmail").value.trim(),
        phone: document.getElementById("editPhone").value.trim(),
        projectType: document.getElementById("editProjectType").value,
        projectProblem: document.getElementById("editProjectProblem").value.trim(),
        goals: getCheckedValues("editGoals"),
        audience: getCheckedValues("editAudience"),
        sections: getCheckedValues("editSections"),
        features: document.getElementById("editFeatures").value.trim(),
        stakeholders: document.getElementById("editStakeholders").value.trim(),
        successCriteria: document.getElementById("editSuccessCriteria").value.trim(),
        constraints: document.getElementById("editConstraints").value.trim(),
        designStyle: document.getElementById("editDesignStyle").value,
        referenceSites: document.getElementById("editReferenceSites").value.trim(),
        deadline: document.getElementById("editDeadline").value.trim(),
        budget: document.getElementById("editBudget").value,
        additionalInfo: document.getElementById("editAdditionalInfo").value.trim()
    };

    if (updatedData.goals.length === 0) {
        alert("Оберіть хоча б одну мету.");
        return;
    }

    if (updatedData.audience.length === 0) {
        alert("Оберіть хоча б одну цільову аудиторію.");
        return;
    }

    if (updatedData.sections.length === 0) {
        alert("Оберіть хоча б один розділ.");
        return;
    }

    try {
        const response = await fetch(`/api/brief/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Помилка при оновленні");
        }

        alert("Бриф успішно оновлено.");
        editSection.classList.add("hidden");
        editForm.reset();
        loadBriefs();
    } catch (error) {
        console.error(error);
        alert("Помилка: " + error.message);
    }
});

async function deleteBrief(id) {
    const isConfirmed = confirm("Ви впевнені, що хочете видалити цей бриф?");
    if (!isConfirmed) return;

    try {
        const response = await fetch(`/api/brief/${id}`, {
            method: "DELETE"
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Помилка при видаленні");
        }

        alert("Бриф успішно видалено.");
        loadBriefs();
    } catch (error) {
        console.error(error);
        alert("Помилка: " + error.message);
    }
}

logoutBtn.addEventListener("click", async () => {
    try {
        await fetch("/logout", { method: "POST" });
        window.location.href = "/login.html";
    } catch (error) {
        alert("Помилка при виході");
    }
});

cancelEditBtn.addEventListener("click", () => {
    editSection.classList.add("hidden");
    editForm.reset();
});

checkAuth();
loadBriefs();