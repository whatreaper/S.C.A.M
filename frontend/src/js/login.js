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
        
        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.token) {
            // Store the token in localStorage
            localStorage.setItem("token", data.token);
            
            // Display a success message
            document.getElementById("loginMessage").textContent = "Login successful!";
            
            // Redirect to the home page
            window.location.href = "home.html";
        } else {
            // Display the error message from the server response
            document.getElementById("loginMessage").textContent = data.message || "Login failed!";
        }
    } catch (error) {
        console.error("Error logging in:", error);
        document.getElementById("loginMessage").textContent = "Error logging in!";
    }
});
