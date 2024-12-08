document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token'); 

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Fetch user data
        const userResponse = await fetch('/api/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        const userName = userData.username;
        document.getElementById('username').textContent = `${userName}'s Progress`;

        // Fetch daily motivational quote from your backend
        const quoteResponse = await fetch('/api/daily-quote');
        const quoteData = await quoteResponse.json();
        document.getElementById('motivation').textContent = quoteData.quote || "Push yourself because no one else is going to do it for you.";

        // Fetch 5 random workouts from the database
        const workoutsResponse = await fetch('/api/random-workouts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!workoutsResponse.ok) {
            throw new Error('Failed to fetch random workouts');
        }

        const workouts = await workoutsResponse.json();

        // Populate the recommended workouts list
        const recommendedWorkouts = document.getElementById('recommended-workouts');
        recommendedWorkouts.innerHTML = '';
        workouts.forEach(workout => {
            const li = document.createElement('li');
            li.textContent = workout.name;
            recommendedWorkouts.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('username').textContent = 'Error loading user data';
    }
});
