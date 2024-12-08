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
 * Function to handle recipe search.
 * Fetches data from the Tasty API and displays it.
 */
async function searchRecipe() {
    const query = document.getElementById('recipeQuery').value.trim();
    const calorieLimit = document.getElementById('calorieLimit').value.trim();
    if (!query) {
        displayContent('recipeResponse', 'Please enter a recipe name.');
        return;
    }

    // Display loading message
    displayContent('recipeResponse', 'Fetching Recipes...', 'loading');

    try {
        let apiUrl = `https://tasty.p.rapidapi.com/recipes/list?from=0&size=10&q=${query}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Host': 'tasty.p.rapidapi.com',
                'X-RapidAPI-Key': '8b69cd6833msh7b080aee4df4bfcp12b4abjsn36192b6afaaa'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }

        const data = await response.json();
        let recipes = data.results;

        // Filter recipes by calorie limit if provided
        if (calorieLimit) {
            recipes = recipes.filter(recipe => recipe.nutrition && recipe.nutrition.calories <= calorieLimit);
        }

        if (recipes.length === 0) {
            displayContent('recipeResponse', 'No recipes found.');
            return;
        }

        const tableBody = document.getElementById('recipeTableBody');
        tableBody.innerHTML = ''; // Clear previous results

        recipes.forEach(recipe => {
            // Add a row for the recipe title and calories
            const titleRow = document.createElement('tr');
            const titleCell = document.createElement('td');
            titleCell.colSpan = 2; // Span across both columns
            titleCell.classList.add('recipe-title');
            titleCell.innerHTML = `${recipe.name} - ${recipe.nutrition ? recipe.nutrition.calories : 'N/A'} calories`;
            titleRow.appendChild(titleCell);
            tableBody.appendChild(titleRow);

            // Add a row for the ingredients and instructions
            const row = document.createElement('tr');

            const ingredientsCell = document.createElement('td');
            ingredientsCell.classList.add('ingredients-cell');
            const ingredientsList = document.createElement('ul');
            recipe.sections[0].components.forEach(component => {
                const li = document.createElement('li');
                li.textContent = component.raw_text;
                ingredientsList.appendChild(li);
            });
            ingredientsCell.appendChild(ingredientsList);

            const instructionsCell = document.createElement('td');
            const instructionsList = document.createElement('ol');
            recipe.instructions.forEach(instruction => {
                const li = document.createElement('li');
                li.textContent = instruction.display_text;
                instructionsList.appendChild(li);
            });
            instructionsCell.appendChild(instructionsList);

            row.appendChild(ingredientsCell);
            row.appendChild(instructionsCell);

            tableBody.appendChild(row);
        });

        displayContent('recipeResponse', ''); // Clear loading message
    } catch (error) {
        console.error('Error fetching recipes:', error);
        displayContent('recipeResponse', 'Error fetching recipes.');
    }
}
