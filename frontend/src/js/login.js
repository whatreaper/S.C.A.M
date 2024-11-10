document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form submission

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        // Send a POST request to the server with the username and password
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        // Parse the JSON response from the server
        const data = await response.json();

        if (response.ok && data.token) {
            // Store the JWT token in localStorage
            localStorage.setItem("token", data.token);

            // Redirect to the profile page after successful login
            window.location.href = "profile.html";
        } else {
            // Display the error message from the server if login fails
            document.getElementById("loginMessage").textContent = data.message || "Login failed";
        }
    } catch (error) {
        console.error("Error logging in:", error);
        document.getElementById("loginMessage").textContent = "Error logging in";
    }
});
