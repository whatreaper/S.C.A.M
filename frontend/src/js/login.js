const API_BASE_URL = '';

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });
        
        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.token && data.userId) {
            // Store the token and userId in localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("userId", data.userId); // Store userId for future use
            
            // Redirect to the home page
            window.location.href = "home.html";
        } else {
            document.getElementById("loginMessage").textContent = data.message || "Login failed!";
        }
    } catch (error) {
        console.error("Error logging in:", error);
        document.getElementById("loginMessage").textContent = "Error logging in!";
    }
});
