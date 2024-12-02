const API_BASE_URL = '';
let token = '';

// Helper function to update response messages
function displayResponse(elementId, message) {
    document.getElementById(elementId).innerText = message;
}

// Register a new user
async function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }), // Sending JSON data
        });

        const data = await response.json();

        if (response.ok) {
            displayResponse('registerResponse', data.message || 'Registration successful');
        } else {
            displayResponse('registerResponse', data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error during registration:', error);
        displayResponse('registerResponse', 'Error registering user');
    }
}

// Login and retrieve JWT token
async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            token = data.token; // Save the JWT token for future requests
            displayResponse('loginResponse', 'Login successful');
        } else {
            displayResponse('loginResponse', data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error during login:', error);
        displayResponse('loginResponse', 'Error logging in');
    }
}