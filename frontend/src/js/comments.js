const API_BASE_URL = ''; // Update with your Fly.io deployment URL if necessary

// Function to fetch and display comments
async function loadComments() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/comments`);
        const data = await response.json();
        const commentList = document.getElementById('commentList');
        commentList.innerHTML = '';

        if (data.length === 0) {
            commentList.innerHTML = '<p>No comments yet.</p>';
            return;
        }

        data.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.classList.add('comment');

            commentDiv.innerHTML = `
                <p class="username">${comment.username}</p>
                <p class="content">${comment.content}</p>
                <p class="timestamp">${new Date(comment.created_at).toLocaleString()}</p>
            `;

            commentList.appendChild(commentDiv);
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

// Function to post a new comment
document.getElementById('commentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('commentContent').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    if (!content) {
        errorMessage.textContent = 'Comment content cannot be empty.';
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            const data = await response.json();
            errorMessage.textContent = data.message || 'Error posting comment.';
            return;
        }

        // Clear the input and reload comments
        document.getElementById('commentContent').value = '';
        errorMessage.textContent = '';
        loadComments();
    } catch (error) {
        console.error('Error posting comment:', error);
        errorMessage.textContent = 'Error posting comment.';
    }
});

// Initial load of comments
loadComments();
