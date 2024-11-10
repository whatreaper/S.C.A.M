document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token'); 

        if (!token) {
            // Redirect to login if token is missing
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch('http://localhost:3000/api/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        const userName = data.username;
        
        // Display the user's name on the profile page
        document.getElementById('username').textContent = `${userName}'s Progress`;
    } catch (error) {
        console.error('Error fetching user data:', error);
        document.getElementById('username').textContent = 'Error loading user data';
    }
});
