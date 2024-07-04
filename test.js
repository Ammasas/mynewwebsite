const commentsList = document.getElementById('commentsList');
const commentForm = document.getElementById('commentForm');
const adminPassword = 'NL050203110345e'; // Replace with your actual password

// Load comments from localStorage on page load
let comments = JSON.parse(localStorage.getItem('comments')) || [];
let isAdmin = false; // Admin status
let currentUser = null; // Track current user

// Function to display comments
function displayComments() {
    commentsList.innerHTML = '';

    // Display comments in descending chronological order
    comments.slice().reverse().forEach((comment, index) => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.dataset.index = comments.length - 1 - index; // Store index in dataset for easy reference
        commentElement.innerHTML = `
            <p><span class="author">${comment.username}</span> - <span class="timestamp">${comment.timestamp}</span></p>
            <p>${comment.content}</p>
            ${canDeleteComment(comment) ? `<button onclick="deleteComment(${comments.length - 1 - index})">Delete</button>` : ''}
            <button onclick="toggleReplyForm(${comments.length - 1 - index})">Reply</button>
            <form class="replyForm" id="replyForm_${comments.length - 1 - index}" style="display: none;">
                <input type="text" id="username_reply_${comments.length - 1 - index}" placeholder="Your Name" required>
                <textarea id="comment_reply_${comments.length - 1 - index}" placeholder="Write your reply..." required></textarea>
                <input type="hidden" id="parentIndex_reply_${comments.length - 1 - index}" value="${comments.length - 1 - index}">
                <button type="submit">Post Reply</button>
            </form>
        `;
        
        // Display replies if any
        if (comment.replies && comment.replies.length > 0) {
            const repliesContainer = document.createElement('div');
            repliesContainer.classList.add('replies-container');
            comment.replies.forEach((reply, replyIndex) => {
                const replyElement = document.createElement('div');
                replyElement.classList.add('reply');
                replyElement.innerHTML = `
                    <p><span class="author">${reply.username}</span> - <span class="timestamp">${reply.timestamp}</span></p>
                    <p>${reply.content}</p>
                    ${canDeleteComment(reply) ? `<button onclick="deleteReply(${comments.length - 1 - index}, ${replyIndex})">Delete</button>` : ''}
                `;
                repliesContainer.appendChild(replyElement);
            });
            commentElement.appendChild(repliesContainer);
        }

        commentsList.appendChild(commentElement);
    });

    updateAdminUI(); // Update admin UI elements visibility
}

// Function to add a new comment
function addComment(username, content) {
    const timestamp = new Date().toLocaleString();
    comments.unshift({ username, content, timestamp, replies: [] }); // Add new comment to the beginning of the array
    saveComments(); // Save comments to localStorage
    displayComments();
}

// Function to add a reply to a comment
function addReply(parentIndex, username, content) {
    const timestamp = new Date().toLocaleString();
    const newReply = { username, content, timestamp };
    comments[parentIndex].replies.push(newReply);
    saveComments(); // Save comments to localStorage
    displayComments();
}

// Function to delete a comment
function deleteComment(index) {
    comments.splice(index, 1);
    saveComments(); // Save comments to localStorage
    displayComments();
}

// Function to delete a reply
function deleteReply(commentIndex, replyIndex) {
    comments[commentIndex].replies.splice(replyIndex, 1);
    saveComments(); // Save comments to localStorage
    displayComments();
}

// Save comments to localStorage
function saveComments() {
    localStorage.setItem('comments', JSON.stringify(comments));
}

// Event listener for form submission
commentForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const content = document.getElementById('comment').value.trim();

    if (username && content) {
        addComment(username, content);
        document.getElementById('username').value = '';
        document.getElementById('comment').value = '';
    } else {
        alert('Please enter your name and comment.');
    }
});

// Function to check if current user can delete a comment
function canDeleteComment(comment) {
    return isAdmin || (currentUser && comment.username === currentUser);
}

// Function to prompt for admin password
function promptAdminPassword() {
    const password = prompt('Enter admin password:');
    if (password === adminPassword) {
        isAdmin = true;
        currentUser = null; // Reset current user when becoming admin
        displayComments(); // Refresh comments after login
    } else {
        alert('Incorrect password.');
    }
}

// Function to log out from admin
function logout() {
    isAdmin = false;
    currentUser = null; // Reset current user when logging out from admin
    displayComments(); // Refresh comments after logout
}

// Function to set current user (for non-admin functionality)
function setCurrentUser(username) {
    currentUser = username;
    displayComments(); // Refresh comments after setting current user
}

// Function to update visibility of admin UI elements
function updateAdminUI() {
    const adminButton = document.getElementById('adminButton');
    const logoutButton = document.getElementById('logoutButton');
    
    if (isAdmin) {
        adminButton.style.display = 'none';
        logoutButton.style.display = 'inline-block';
    } else {
        adminButton.style.display = 'inline-block';
        logoutButton.style.display = 'none';
    }
}

// Function to toggle reply form visibility
function toggleReplyForm(index) {
    const replyForm = document.getElementById(`replyForm_${index}`);
    if (replyForm.style.display === 'block') {
        replyForm.style.display = 'none';
    } else {
        // Hide all reply forms before showing the current one
        const allReplyForms = document.querySelectorAll('.replyForm');
        allReplyForms.forEach(form => {
            form.style.display = 'none';
        });
        replyForm.style.display = 'block';
    }
}

// Event listener for reply form submission
document.addEventListener('submit', function(event) {
    if (event.target.classList.contains('replyForm')) {
        event.preventDefault();
        const form = event.target;
        const parentIndex = parseInt(form.querySelector('input[type="hidden"]').value, 10);
        const username = form.querySelector('input[type="text"]').value.trim();
        const content = form.querySelector('textarea').value.trim();

        if (username && content) {
            addReply(parentIndex, username, content);
        } else {
            alert('Please enter your name and reply.');
        }
    }
});

// Initial display of comments
displayComments();
