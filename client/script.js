const form = document.getElementById("briefForm");

function getCheckedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(item => item.value);
}

function validatePhone(phone) {
    if (!phone) return true;
    const phoneRegex = /^[+]?[0-9()\-\s]{7,20}$/;
    return phoneRegex.test(phone);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
        organizationName: form.organizationName.value.trim(),
        contactPerson: form.contactPerson.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        projectType: form.projectType.value,
        projectProblem: form.projectProblem.value.trim(),
        goals: getCheckedValues("goals"),
        audience: getCheckedValues("audience"),
        sections: getCheckedValues("sections"),
        features: form.features.value.trim(),
        stakeholders: form.stakeholders.value.trim(),
        successCriteria: form.successCriteria.value.trim(),
        constraints: form.constraints.value.trim(),
        designStyle: form.designStyle.value,
        referenceSites: form.referenceSites.value.trim(),
        deadline: form.deadline.value.trim(),
        budget: form.budget.value,
        additionalInfo: form.additionalInfo.value.trim()
    };

    if (!formData.organizationName || !formData.contactPerson || !formData.email) {
        alert("Будь ласка, заповніть обов’язкові поля.");
        return;
    }

    if (!validatePhone(formData.phone)) {
        alert("Введіть коректний номер телефону.");
        return;
    }

    if (formData.goals.length === 0) {
        alert("Оберіть хоча б одну мету сайту / платформи.");
        return;
    }

    if (formData.audience.length === 0) {
        alert("Оберіть хоча б одну цільову аудиторію.");
        return;
    }

    if (formData.sections.length === 0) {
        alert("Оберіть хоча б один розділ сайту.");
        return;
    }

    try {
        const response = await fetch("/api/brief", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || result.message || "Помилка при збереженні");
        }

        alert("Бриф успішно надіслано.");
        form.reset();
    } catch (error) {
        console.error("FRONTEND ERROR:", error);
        alert("Помилка: " + error.message);
    }
});