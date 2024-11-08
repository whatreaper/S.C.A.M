const API_BASE_URL = 'http://localhost:3000'; // Update if using a different port or base URL
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

// Search for nutrition data using CalorieNinja API
async function searchNutrition() {
    const query = document.getElementById('nutritionQuery').value;

    if (!token) {
        displayResponse('nutritionResponse', 'Please log in first');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/nutrition?query=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            displayResponse('nutritionResponse', JSON.stringify(data, null, 2));
        } else {
            displayResponse('nutritionResponse', data.message || 'Error fetching nutrition data');
        }
    } catch (error) {
        console.error('Error fetching nutrition data:', error);
        displayResponse('nutritionResponse', 'Error fetching nutrition data');
    }
}

// Retrieve user’s nutrition search history
async function getSearchHistory() {
    if (!token) {
        displayResponse('historyResponse', 'Please log in first');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/nutrition/history`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            displayResponse('historyResponse', JSON.stringify(data, null, 2));
        } else {
            displayResponse('historyResponse', data.message || 'Error fetching search history');
        }
    } catch (error) {
        console.error('Error fetching search history:', error);
        displayResponse('historyResponse', 'Error fetching search history');
    }
}
