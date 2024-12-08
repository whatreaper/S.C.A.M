document.addEventListener('DOMContentLoaded', async () => {
    const workoutGroupsContainer = document.getElementById('workoutGroups');
    const createPlanForm = document.getElementById('createPlanForm');

    const token = localStorage.getItem('token');
    if (!token) {
        alert('You need to log in to access this page.');
        window.location.href = 'login.html';
        return;
    }

    try {
        // Fetch workout groups
        const groupsResponse = await fetch('/api/workout-groups', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!groupsResponse.ok) {
            throw new Error('Failed to fetch workout groups');
        }

        const groups = await groupsResponse.json();

        // Render workout groups and their workouts
        for (const group of groups) {
            const groupDiv = document.createElement('div');
            groupDiv.innerHTML = `
                <h3>${group.name}</h3>
                <div id="workouts-${group.id}">
                    <p>Loading workouts...</p>
                </div>
            `;
            workoutGroupsContainer.appendChild(groupDiv);

            // Fetch workouts for this group
            const workoutsResponse = await fetch(`/api/workouts/${group.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const workouts = await workoutsResponse.json();
            const workoutsContainer = document.getElementById(`workouts-${group.id}`);
            workoutsContainer.innerHTML = ''; // Clear "Loading workouts..."

            if (workouts.length === 0) {
                workoutsContainer.innerHTML = '<p>No workouts available for this group.</p>';
            } else {
                workouts.forEach(workout => {
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.innerHTML = `
                        <label>
                            <input type="checkbox" value="${workout.id}">
                            ${workout.name}
                        </label>
                    `;
                    workoutsContainer.appendChild(checkboxDiv);
                });
            }
        }
    } catch (error) {
        console.error('Error fetching workout groups:', error);
    }

    // Handle form submission
    createPlanForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const planName = document.getElementById('planName').value.trim();
        const selectedWorkouts = Array.from(
            document.querySelectorAll('input[type="checkbox"]:checked')
        ).map(checkbox => checkbox.value);

        if (!planName || selectedWorkouts.length === 0) {
            alert('Please enter a plan name and select at least one workout.');
            return;
        }

        try {
            const response = await fetch('/api/workoutplans', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: planName,
                    workoutIds: selectedWorkouts
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create workout plan');
            }

            alert('Workout plan created successfully!');
            window.location.href = 'workoutplan.html';
        } catch (error) {
            console.error('Error creating workout plan:', error);
            alert('Failed to create workout plan. Please try again.');
        }
    });
});
