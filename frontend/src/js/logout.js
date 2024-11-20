document.getElementById("logoutButton").addEventListener("click", () => {
    // Remove the token from localStorage
    localStorage.removeItem("token");
    
    // Display a logout success message
    document.getElementById("logoutMessage").textContent = "You have been logged out successfully!";
    
    // Redirect to the login page after a short delay
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
});
