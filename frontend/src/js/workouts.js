document.addEventListener('DOMContentLoaded', async () => {
    const groupId = new URLSearchParams(window.location.search).get('groupId');

    try {
        const response = await fetch(`/api/workouts/${groupId}`);
        const workouts = await response.json();

        const tableBody = document.querySelector('#workoutsTable tbody');
        workouts.forEach(workout => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${workout.name}</td>
                <td>${workout.description}</td>
                <td>
                    <select data-workout-id="${workout.id}">
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                </td>
                <td><button class="save-btn" data-workout-id="${workout.id}">Save</button></td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.save-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const workoutId = e.target.dataset.workoutId;
                const status = document.querySelector(`select[data-workout-id="${workoutId}"]`).value;

                const userId = localStorage.getItem("userId");

                if (!userId) {
                    alert("User not logged in!");
                    window.location.href = "login.html";
                    return;
                }
                
                try {
                    const response = await fetch('/api/workouts/progress', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, workoutId, status }),
                    });
                    const data = await response.json();
                    alert(`Progress updated: ${data.status}`);
                } catch (error) {
                    console.error('Error updating progress:', error);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching workouts:', error);
    }
});
