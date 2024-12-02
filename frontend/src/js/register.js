document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Display success message
            document.getElementById("registerMessage").textContent = "Registration successful! Redirecting to login...";

            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            // Display error message from the server
            document.getElementById("registerMessage").textContent = data.message || "Registration failed!";
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("registerMessage").textContent = "Registration failed!";
    }
});
