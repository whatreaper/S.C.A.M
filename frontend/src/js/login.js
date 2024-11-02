document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            document.getElementById("loginMessage").textContent = "Login successful!";
        } else {
            document.getElementById("loginMessage").textContent = data.message;
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("loginMessage").textContent = "Login failed!";
    }
});
