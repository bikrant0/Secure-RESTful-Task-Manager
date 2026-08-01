// ============ AUTH GUARD ============
if (!localStorage.getItem('access')) {
    window.location.href = 'index.html'; 
}

// ============ AUTH FETCH HELPER ============
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('access');
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/';
        throw new Error('Session expired');
    }
    return response;
}

// ============ LOGOUT ============
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/';
});

// ============ CURRENT USER ============
const currentUserEmail = localStorage.getItem('email') || 'you';
document.getElementById('welcomeUser').textContent = `Logged in as ${currentUserEmail}`;

// ============ ELEMENTS ============
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const errorBanner = document.getElementById('errorBanner');
const errorBannerText = document.getElementById('errorBannerText');
const modal = document.getElementById('taskModal');
const newTaskBtn = document.getElementById('newTaskBtn');
const modalClose = document.getElementById('modalClose');
const taskForm = document.getElementById('taskForm');
const taskFormBtn = document.getElementById('taskFormBtn');
const formError = document.getElementById('formError');
const formErrorText = document.getElementById('formErrorText');

function showBannerError(msg) {
    errorBannerText.textContent = msg;
    errorBanner.classList.add('show');
    setTimeout(() => hideBannerError(), 5000);
}

function hideBannerError() {
    errorBanner.classList.remove('show');
}

// ============ DISABLE PAST DATES (TIME TRAVEL FIX) ============
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('taskDueDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
});

// ============ RENDER ONE TASK CARD ============
function renderTask(task) {
    const statusLabel = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[task.status];
    const priorityLabel = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' }[task.priority];
    
    const card = document.createElement('div');
    card.className = 'task-card' + (task.status === 'DONE' ? ' done' : '');
    card.dataset.id = task.id;
    
    const descHtml = task.description ? `<div class="task-description">${task.description}</div>` : '';
    const dueHtml = task.due_date ? `<span class="task-due"><i class="fas fa-calendar"></i> ${task.due_date}</span>` : '';

    card.innerHTML = `
        <div class="task-main">
            <div class="task-title">${task.title}</div>
            ${descHtml}
            <div class="task-meta">
                <span class="badge status-${task.status}">${statusLabel}</span>
                <span class="badge priority-${task.priority}">${priorityLabel}</span>
                ${dueHtml}
                <span class="task-assignee"><i class="fas fa-user"></i> ${currentUserEmail}</span>
            </div>
        </div>
        <div class="task-actions" style="display:flex; gap:10px; margin-left:15px;">
            <button class="icon-btn edit-btn" data-id="${task.id}" title="Edit Task">
                <i class="fas fa-edit"></i>
            </button>
        </div>
        <div class="task-actions">
            <button class="icon-btn cycle-status" title="Cycle status">
                <i class="fas fa-check"></i>
            </button>
            <button class="icon-btn delete" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>`;
    return card;
}

// ============ LOAD TASKS ============
async function loadTasks() {
    hideBannerError();
    try {
        const response = await authFetch('/api/tasks/');
        if (!response.ok) throw new Error('Could not load tasks.');
        
        const data = await response.json();
        const tasks = data.results || data;
        
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            tasks.forEach(task => taskList.appendChild(renderTask(task)));
        }
    } catch (error) {
        console.error(error);
        showBannerError('Network error. Is the server running?');
    }
}

// ============ STATUS CYCLE + DELETE ============
taskList.addEventListener('click', async (e) => {
    // 1. Finds which task card was clicked
    const card = e.target.closest('.task-card');
    if (!card) return;
    
    // 2. Grabs the Database ID from the card
    const id = card.dataset.id;

    // --- UPDATE LOGIC (PATCH) ---
    if (e.target.closest('.cycle-status')) {
        console.log(`Trying to UPDATE task ID: ${id}`); 

        const badge = card.querySelector('.status-TODO, .status-IN_PROGRESS, .status-DONE');
        const order = ['TODO', 'IN_PROGRESS', 'DONE'];
        const currentStatus = order.find(s => badge.classList.contains(`status-${s}`));
        const next = order[(order.indexOf(currentStatus) + 1) % order.length];

        try {
            const response = await authFetch(`/api/tasks/${id}/`, {
                method: 'PATCH',
                body: JSON.stringify({ status: next })
            });
            
            if (response.ok) {
                console.log("Update Success!"); 
                loadTasks();
            } else {
                console.error("Update Failed. Django says:", await response.text()); 
                showBannerError('Could not update task status.');
            }
        } catch (err) {
            console.error("Network Error during Update:", err);
        }
    }

    // --- DELETE LOGIC (DELETE) ---
    if (e.target.closest('.delete')) {
        console.log(`Trying to DELETE task ID: ${id}`); 

        const userConfirmed = confirm("Are you sure you want to delete this task? This action cannot be undone.");
        if (!userConfirmed) return; 
        
        try {
            const response = await authFetch(`/api/tasks/${id}/`, { method: 'DELETE' });
            
            if (response.ok || response.status === 204) {
                console.log("Delete Success!"); 
                loadTasks();
            } else {
                console.error("Delete Failed. Django says:", await response.text()); 
                showBannerError('Could not delete task. Check permissions.');
            }
        } catch (err) {
            console.error("Network Error during Delete:", err);
        }
    }
});

// ============ MODAL ============
function openModal() {
    modal.classList.add('active');
    formError.classList.remove('show');
    taskForm.reset();
}

function closeModal() {
    modal.classList.remove('active');
}

newTaskBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// ============ CREATE TASK ============
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.classList.remove('show');


    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const status = document.getElementById('taskStatus').value.trim();
    const priority = document.getElementById('taskPriority').value.trim();
    const dueDateInput = document.getElementById('taskDueDate').value;
    const due_date = dueDateInput ? dueDateInput : null;

    const payload = { title, description, status, priority, due_date };
    console.log("Sending payload to server:", payload);

    if (!title) {
        formErrorText.textContent = 'Title is required.';
        formError.classList.add('show');
        return;
    }

    taskFormBtn.classList.add('loading');
    taskFormBtn.disabled = true;

    try {
        const response = await authFetch('/api/tasks/', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        console.log("Server responded with:", response.status, responseText);

        if (!response.ok) {
            let errorMsg = 'Could not create task.';
            try {
                const data = JSON.parse(responseText);
                if (data.title) errorMsg = Array.isArray(data.title) ? data.title[0] : data.title;
                else if (data.status) errorMsg = Array.isArray(data.status) ? data.status[0] : data.status;
                else if (data.priority) errorMsg = Array.isArray(data.priority) ? data.priority[0] : data.priority;
                else if (data.detail) errorMsg = data.detail;
            } catch (e) {
                errorMsg = responseText || errorMsg;
            }
            throw new Error(errorMsg);
        }

        closeModal();
        loadTasks();
        
    } catch (error) {
        console.error("Create Task Error:", error);
        formErrorText.textContent = error.message;
        formError.classList.add('show');
    } finally {
        taskFormBtn.classList.remove('loading');
        taskFormBtn.disabled = false;
    }
});

// ==== THE DEBOUNCER ===
let currentTaskID = null ;
const notesTextarea = document.getElementById('notesTextarea')
const saveStatus = document.getElementById('saveStatus');
let saveTimeout; 

if (notesTextarea) {
    notesTextarea.addEventListener('input', (e) => {
        clearTimeout(saveTimeout);

        saveStatus.textContent = 'Saving...';
        saveStatus.style.color = '#999';

        saveTimeout = setTimeout(async () => {
            const content = e.target.value.trim();
            
            if (!content || !currentTaskId) {
                saveStatus.textContent = '';
                return;
            }

            try {
                const response = await authFetch(`/api/tasks/${currentTaskId}/notes/`, {
                    method: 'POST',
                    body: JSON.stringify({ content: content })
                });

                if (response.ok) {
                    saveStatus.textContent = 'Saved ✓';
                    saveStatus.style.color = '#2ed573'; 

                    setTimeout(() => {
                        if (saveStatus.textContent === 'Saved ✓') {
                            saveStatus.textContent = '';
                        }
                    }, 2000);
                } else {
                    saveStatus.textContent = 'Failed to save';
                    saveStatus.style.color = '#ff4757'; 
                }
            } catch (error) {
                console.error('Note auto-save error:', error);
                saveStatus.textContent = 'Network error';
                saveStatus.style.color = '#ff4757';
            }
        }, 1000); // 1000 milliseconds = 1 second wait time
    });
}

// ===== TASK 2: ASSIGNEE DROPDOWN LOGIC =====

const assigneeSelect = document.getElementById('assigneeSelect');

async function loadAssignees() {
    if (!assigneeSelect) return;
    
    assigneeSelect.innerHTML = '<option value="">Select a team member...</option>';
    
    try {
        const response = await authFetch('/api/accounts/users/');
        if (response.ok) {
            const users = await response.json();
            
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.email} (${user.role})`; 
                assigneeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load assignees:', error);
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "Backend not connected (Demo Mode)";
        assigneeSelect.appendChild(option);
    }
}

const originalOpenModal = openModal;
function openModal() { 
    modal.classList.add('active'); 
    setTimeout(() => taskNameInput.focus(), 100);
    loadAssignees(); 
}

createTaskBtn.addEventListener('click', async () => {
    const name = taskNameInput.value.trim();
    const assigneeId = assigneeSelect.value; 
    
    if (!name) {
        taskNameInput.style.borderBottom = '2px solid #ff4757';
        setTimeout(() => taskNameInput.style.borderBottom = 'none', 1500);
        return;
    }

    const activeDay = document.querySelector('.modal-row:first-child .option-btn.active');
    const day = activeDay ? activeDay.textContent : 'Today';

    try {
        const payload = {
            title: name,
            due_date: day,
            status: 'TODO',
            priority: 'MEDIUM'
        };

        if (assigneeId) {
            payload.assignee = parseInt(assigneeId);
        }

        const response = await authFetch('/api/tasks/', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            closeModal();
            await renderTasks(); 
            document.querySelector('[data-view="tasks"]').click();
        } else {
            throw new Error('Backend failed');
        }
    } catch (error) {
        const group = day === 'Today' ? 'today' : day === 'Tomorrow' ? 'tomorrow' : 'week';
        mockTasksData[group].unshift({
            id: Date.now(), 
            title: name, 
            due_date: day, 
            status: 'TODO', 
            priority: 'MEDIUM', 
            team: 'My Team', 
            assignee_avatar: 'https://i.pravatar.cc/40?img=1'
        });
        closeModal();
        await renderTasks();
        document.querySelector('[data-view="tasks"]').click();
    }
});
// ==========================================
// EDIT TASK LOGIC
// ==========================================

let isEditing = false;
let editingTaskId = null;
const createTaskBtn = document.getElementById('createTaskBtn'); // Your existing button

// 1. Event Delegation for the Edit Button
document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.edit-btn');
    if (editBtn) {
        const taskId = editBtn.dataset.id;
        openEditModal(taskId);
    }
});

// 2. Function to populate modal for editing
async function openEditModal(taskId) {
    try {
        const response = await authFetch(`/api/tasks/${taskId}/`);
        if (response.ok) {
            const task = await response.json();
            
            // Populate fields
            document.getElementById('taskNameInput').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskDueDate').value = task.due_date || '';
            
            // Set state
            isEditing = true;
            editingTaskId = taskId;
            
            // Change button text
            createTaskBtn.textContent = 'Save Changes';
            
            // Open modal
            document.getElementById('taskModal').classList.add('active');
        }
    } catch (error) {
        console.error('Failed to load task for editing:', error);
    }
}

// 3. Update your existing Create Task Button Listener
// Replace your current createTaskBtn click listener with this unified version:

createTaskBtn.addEventListener('click', async () => {
    const name = document.getElementById('taskNameInput').value.trim();
    const dueDate = document.getElementById('taskDueDate').value; // Get date value
    const description = document.getElementById('taskDescription').value.trim();

    // VALIDATION: Name and Date are now mandatory
    if (!name) {
        alert('Task name is required.');
        return;
    }
    if (!dueDate) {
        alert('Due date is mandatory. Please select a date.');
        document.getElementById('taskDueDate').focus();
        return;
    }

    const payload = {
        title: name,
        due_date: dueDate,
        description: description,
        status: 'TODO', // Default status
        priority: 'MEDIUM' // Default priority
    };

    try {
        let response;
        
        if (isEditing) {
            // UPDATE EXISTING TASK (PATCH)
            response = await authFetch(`/api/tasks/${editingTaskId}/`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            });
        } else {
            // CREATE NEW TASK (POST)
            response = await authFetch('/api/tasks/', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        }

        if (response.ok) {
            closeModal(); // Make sure this resets isEditing = false and clears fields
            await renderTasks(); 
        } else {
            alert('Failed to save task.');
        }
    } catch (error) {
        console.error('Error saving task:', error);
    }
});

// 4. Update your closeModal function to reset the edit state
function closeModal() {
    document.getElementById('taskModal').classList.remove('active');
    document.getElementById('taskNameInput').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskDueDate').value = ''; 
    
    // Reset edit state
    isEditing = false;
    editingTaskId = null;
    createTaskBtn.textContent = 'Create Task'; 
}



// ============ INITIALIZE ============
loadTasks();