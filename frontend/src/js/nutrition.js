const API_BASE_URL = 'http://localhost:3000';

/**
 * Helper function to display messages or data in the response container.
 * @param {string} elementId - The ID of the container element.
 * @param {string|HTMLElement} content - The content to display.
 * @param {string} [className] - Optional class to add for styling.
 */
function displayContent(elementId, content, className = '') {
    const container = document.getElementById(elementId);
    container.innerHTML = '';

    if (typeof content === 'string') {
        const p = document.createElement('p');
        p.textContent = content;
        if (className) p.classList.add(className);
        container.appendChild(p);
    } else {
        container.appendChild(content);
    }
}

/**
 * Function to handle nutrition search.
 * Fetches data from the backend API and displays it.
 */
async function searchNutrition() {
    const query = document.getElementById('nutritionQuery').value.trim();

    if (query === '') {
        displayContent('nutritionResponse', 'Please enter a food item to search.', 'error');
        return;
    }
    const url = `${API_BASE_URL}/api/nutrition?search=${encodeURIComponent(query)}`;

    // Display loading message
    displayContent('nutritionResponse', 'Fetching nutritional data...', 'loading');

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            // Display fetched data
            displayNutritionData(data);
        } else {

            const errorMsg = data.message || 'Error fetching nutritional data.';
            displayContent('nutritionResponse', errorMsg, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        displayContent('nutritionResponse', 'An error occurred while fetching data.', 'error');
    }
}

/**
 * Function to display nutritional data in the response container.
 * @param {Array} data - Array of nutritional items.
 */
function displayNutritionData(data) {
    const container = document.getElementById('nutritionResponse');
    container.innerHTML = '';

    if (data.length === 0) {
        displayContent('nutritionResponse', 'No nutritional information found.', 'error');
        return;
    }

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('nutrition-item');

        itemDiv.innerHTML = `
            <h3>${capitalizeFirstLetter(item.name)}</h3>
            <p><strong>Calories:</strong> ${item.calories} kcal</p>
            <p><strong>Fat:</strong> ${item.fat_total_g} g</p>
            <p><strong>Carbohydrates:</strong> ${item.carbohydrates_total_g} g</p>
            <p><strong>Fiber:</strong> ${item.fiber_g} g</p>
            <p><strong>Protein:</strong> ${item.protein_g} g</p>
            <p><strong>Sodium:</strong> ${item.sodium_mg} mg</p>
            <p><strong>Sugar:</strong> ${item.sugar_g} g</p>
        `;

        container.appendChild(itemDiv);
    });
}

/**
 * Helper function to capitalize the first letter of a string.
 * @param {string} string - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
