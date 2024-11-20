// leaderboard.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard data');
        }

        const leaderboard = await response.json();
        const tableBody = document.querySelector('#leaderboardTable tbody');

        leaderboard.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.username}</td>
                <td>${user.total_points}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        const tableBody = document.querySelector('#leaderboardTable tbody');
        tableBody.innerHTML = '<tr><td colspan="3">Error loading leaderboard</td></tr>';
    }
});
