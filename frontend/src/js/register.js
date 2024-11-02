document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        document.getElementById("registerMessage").textContent = data.message;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("registerMessage").textContent = "Registration failed!";
    }
});
