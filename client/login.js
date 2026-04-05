const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Помилка входу");
        }

        localStorage.setItem("adminToken", result.token);
        alert("Вхід успішний.");
        window.location.href = "/admin.html";
    } catch (error) {
        alert("Помилка: " + error.message);
    }
});
