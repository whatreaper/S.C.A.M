document.addEventListener('DOMContentLoaded', async () => {
    const plansTableBody = document.querySelector('#plansTable tbody');
    const token = localStorage.getItem('token');

    // Fetch user's workout plans
    try {
        const response = await fetch('/api/workoutplans', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch workout plans');
        }

        const plans = await response.json();

        plans.forEach(plan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${plan.name}</td>
                <td>
                    <button class="view-btn" data-plan-id="${plan.id}">View</button>
                </td>
            `;
            plansTableBody.appendChild(row);

            // Event listener for "View" button
            row.querySelector('.view-btn').addEventListener('click', async () => {
                const workoutsDropdown = document.createElement('div');
                workoutsDropdown.classList.add('workouts-dropdown');

                // Fetch workouts for the plan
                const workoutsResponse = await fetch(`/api/workoutplans/${plan.id}/workouts`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!workoutsResponse.ok) {
                    console.error('Error fetching workouts for plan');
                    return;
                }

                const workouts = await workoutsResponse.json();
                workoutsDropdown.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Workout Name</th>
                                <th>Status</th>
                                <th>Save</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${workouts.map(workout => `
                                <tr>
                                    <td>${workout.name}</td>
                                    <td>
                                        <select data-workout-id="${workout.id}">
                                            <option value="Not Started" ${workout.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                                            <option value="In Progress" ${workout.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                            <option value="Done" ${workout.status === 'Done' ? 'selected' : ''}>Done</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button class="save-status" data-workout-id="${workout.id}">Save</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;

                // Append the dropdown to the table row
                row.after(workoutsDropdown);

                // Event listener for "Save" button
                workoutsDropdown.querySelectorAll('.save-status').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const workoutId = e.target.dataset.workoutId;
                        const status = workoutsDropdown.querySelector(`select[data-workout-id="${workoutId}"]`).value;

                        try {
                            const saveResponse = await fetch('/api/workouts/progress', {
                                method: 'POST',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    workoutId,
                                    status,
                                    userId: localStorage.getItem('userId') // Ensure the userId is set in localStorage during login
                                })
                            });

                            if (!saveResponse.ok) {
                                throw new Error('Failed to update workout status');
                            }

                            alert('Workout status updated!');
                        } catch (error) {
                            console.error('Error saving workout status:', error);
                        }
                    });
                });
            });
        });
    } catch (error) {
        console.error('Error fetching workout plans:', error);
    }
});
