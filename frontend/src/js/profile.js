const API_BASE_URL = '';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = localStorage.getItem('token'); 

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Fetch user data
        const userResponse = await fetch(`${API_BASE_URL}/api/user`, {
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
        const quoteResponse = await fetch('http://localhost:3000/api/daily-quote');
        const quoteData = await quoteResponse.json();
        document.getElementById('motivation').textContent = quoteData.quote || "Push yourself because no one else is going to do it for you.";

        // Fetch recommended workouts
        const exercisesResponse = await fetch('http://localhost:3000/api/exercises');
        const exercisesData = await exercisesResponse.json();
        const exercisesList = exercisesData.data.exercises;

        // Select 5 random exercises
        const recommendedWorkouts = document.getElementById('recommended-workouts');
        recommendedWorkouts.innerHTML = '';
        const randomExercises = exercisesList.sort(() => 0.5 - Math.random()).slice(0, 5);
        randomExercises.forEach(exercise => {
            const li = document.createElement('li');
            li.textContent = `${exercise.name}: ${exercise.reps || "3 sets of 10"}`;
            recommendedWorkouts.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('username').textContent = 'Error loading user data';
    }
});
