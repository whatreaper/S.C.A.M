document.addEventListener('DOMContentLoaded', async () => {
    const commentList = document.getElementById('commentList');
    const commentForm = document.getElementById('commentForm');
    const commentContent = document.getElementById('commentContent');

    // Fetch and render comments
    const loadComments = async () => {
        try {
            const response = await fetch('/api/comments');
            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }

            const comments = await response.json();
            commentList.innerHTML = ''; // Clear existing comments

            comments.forEach(comment => {
                const commentCard = document.createElement('div');
                commentCard.classList.add('comment-card');
                commentCard.innerHTML = `
                    <div class="comment-header">
                        <span class="username">${comment.username}</span>
                        <span class="comment-date">${new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <div class="comment-content">${comment.content}</div>
                `;
                commentList.appendChild(commentCard);
            });
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    };

    // Post a new comment
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const content = commentContent.value.trim();
        if (!content) {
            alert('Comment cannot be empty.');
            return;
        }

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ content })
            });

            if (!response.ok) {
                throw new Error('Failed to post comment');
            }

            commentContent.value = ''; // Clear the textarea
            await loadComments(); // Reload comments
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    });

    // Initial load of comments
    await loadComments();
});
