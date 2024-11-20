document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/workout-groups');
        const groups = await response.json();

        const container = document.getElementById('workoutGroups');
        groups.forEach(group => {
            const button = document.createElement('button');
            button.textContent = group.name;
            button.onclick = () => {
                window.location.href = `/workouts.html?groupId=${group.id}`;
            };
            container.appendChild(button);
        });
    } catch (error) {
        console.error('Error fetching workout groups:', error);
    }
});
