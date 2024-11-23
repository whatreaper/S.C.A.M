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
    if (!query) {
        displayContent('recipeResponse', 'Please enter a recipe name.');
        return;
    }

    try {
        const response = await fetch(`https://tasty.p.rapidapi.com/recipes/list?from=0&size=10&q=${query}`, {
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
        const recipes = data.results;

        if (recipes.length === 0) {
            displayContent('recipeResponse', 'No recipes found.');
            return;
        }

        const list = document.createElement('div');
        list.classList.add('recipe-list');
        recipes.forEach(recipe => {
            const listItem = document.createElement('div');
            listItem.classList.add('recipe-item');
            listItem.innerHTML = `
                <h3>${recipe.name}</h3>
                <h4>Ingredients:</h4>
                <ul>
                    ${recipe.sections[0].components.map(component => `<li>${component.raw_text}</li>`).join('')}
                </ul>
                <h4>Instructions:</h4>
                <ol>
                    ${recipe.instructions.map(instruction => `<li>${instruction.display_text}</li>`).join('')}
                </ol>
            `;
            list.appendChild(listItem);
        });

        displayContent('recipeResponse', list);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        displayContent('recipeResponse', 'Error fetching recipes.');
    }
}
