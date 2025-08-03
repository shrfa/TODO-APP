// Function to fetch and update todo lists
function updateTodoLists() {
    fetch('/todos')
        .then(response => response.json())
        .then(data => {
            // Update active todos
            const todoList = document.getElementById('todoList');
            todoList.innerHTML = data.active.map(todo => `
                <li>
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="updateTodo(${todo.id}, this.checked)">
                    <span class="${todo.completed ? 'completed' : ''}">${todo.content}</span>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">×</button>
                </li>
            `).join('');

            // Update deleted todos
            const deletedList = document.getElementById('deletedList');
            deletedList.innerHTML = data.deleted.map(todo => `
                <li>
                    <span>${todo.content}</span>
                    <button class="restore-btn" onclick="restoreTodo(${todo.id})">Restore</button>
                </li>
            `).join('');
        });
}

// Function to add new todo
document.querySelector('.input-container').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = this.querySelector('input[type="text"]');
    const todo = input.value.trim();
    
    if (todo) {
        fetch('/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ todo: todo })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                input.value = '';
                updateTodoLists();
            }
        });
    }
});

// Function to update todo status
function updateTodo(id, completed) {
    fetch('/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id, completed: completed })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            updateTodoLists();
        }
    });
}

// Function to delete todo
function deleteTodo(id) {
    fetch('/delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            updateTodoLists();
        }
    });
}

// Function to restore todo
function restoreTodo(id) {
    fetch('/restore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            updateTodoLists();
        }
    });
}

// Initial load of todo lists
document.addEventListener('DOMContentLoaded', updateTodoLists);
  