// ============ AUTH GUARD ============
if (!localStorage.getItem('access')) {
    window.location.href = '/'; 
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

    try {
        const response = await fetch(url, { ...options, headers });
        
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/';
            throw new Error('Session expired');
        }
        return response;
    } catch (error) {
        console.error('Network error:', error);
        throw error;
    }
}

// ============ GLOBAL STATE & ELEMENTS ============
const currentUserEmail = localStorage.getItem('email') || 'you@example.com';
const welcomeUser = document.getElementById('welcomeUser');
if (welcomeUser) welcomeUser.textContent = `Logged in as ${currentUserEmail}`;

const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const errorBanner = document.getElementById('errorBanner');
const errorBannerText = document.getElementById('errorBannerText');

const modal = document.getElementById('taskModal');
const newTaskBtn = document.getElementById('newTaskBtn');
const modalClose = document.getElementById('modalClose');
const createTaskBtn = document.getElementById('createTaskBtn'); // Unified button
const formError = document.getElementById('formError');
const formErrorText = document.getElementById('formErrorText');

// Modal Inputs (Fallback IDs in case your HTML uses slightly different names)
const taskNameInput = document.getElementById('taskNameInput') || document.getElementById('taskTitle');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskDueDateInput = document.getElementById('taskDueDate');
const assigneeSelect = document.getElementById('assigneeSelect');

let isEditing = false;
let editingTaskId = null;

// ============ UI HELPERS ============
function showBannerError(msg) {
    if (errorBannerText) errorBannerText.textContent = msg;
    if (errorBanner) errorBanner.classList.add('show');
    setTimeout(hideBannerError, 5000);
}

function hideBannerError() {
    if (errorBanner) errorBanner.classList.remove('show');
}

// Disable past dates in date picker
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('taskDueDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0]; 
        dateInput.setAttribute('min', today);
    }
});

// ============ RENDER ONE TASK CARD ============
function renderTask(task) {
    const statusLabel = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[task.status] || task.status;
    const priorityLabel = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' }[task.priority] || task.priority;
    
    const card = document.createElement('div');
    card.className = 'task-card' + (task.status === 'DONE' ? ' done' : '');
    card.dataset.id = task.id;
    
    const descHtml = task.description ? `<div class="task-description">${task.description}</div>` : '';
    const dueHtml = task.due_date ? `<span class="task-due"><i class="fas fa-calendar"></i> ${task.due_date}</span>` : '';
    const assigneeHtml = task.assignee_email 
        ? `<span class="task-assignee"><i class="fas fa-user"></i> ${task.assignee_email}</span>` 
        : `<span class="task-assignee"><i class="fas fa-user"></i> Unassigned</span>`;

    card.innerHTML = `
        <div class="task-main">
            <div class="task-title">${task.title}</div>
            ${descHtml}
            <div class="task-meta">
                <span class="badge status-${task.status}">${statusLabel}</span>
                <span class="badge priority-${task.priority}">${priorityLabel}</span>
                ${dueHtml}
                ${assigneeHtml}
            </div>
        </div>
        <div class="task-actions" style="display:flex; gap:10px; margin-left:15px;">
            <button class="icon-btn edit-btn" data-id="${task.id}" title="Edit Task">
                <i class="fas fa-edit"></i>
            </button>
            <button class="icon-btn cycle-status" title="Cycle status">
                <i class="fas fa-check"></i>
            </button>
            <button class="icon-btn delete-btn" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>`;
    return card;
}

// ============ LOAD TASKS (Handles Pagination) ============
async function loadTasks() {
    hideBannerError();
    if (!taskList) return;

    try {
        const response = await authFetch('/api/tasks/');
        if (!response.ok) throw new Error('Could not load tasks.');
        
        const data = await response.json();
        // THE FIX: Handle Pagination (data.results) or flat array (data)
        const tasks = data.results || data;
        
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
        } else {
            if (emptyState) emptyState.classList.add('hidden');
            tasks.forEach(task => taskList.appendChild(renderTask(task)));
        }
    } catch (error) {
        console.error(error);
        showBannerError('Network error. Is the server running?');
    }
}

// ============ EVENT DELEGATION (Edit, Cycle, Delete) ============
if (taskList) {
    taskList.addEventListener('click', async (e) => {
        const card = e.target.closest('.task-card');
        if (!card) return;
        const id = card.dataset.id;

        // --- EDIT LOGIC ---
        if (e.target.closest('.edit-btn')) {
            openEditModal(id);
            return;
        }

        // --- UPDATE LOGIC (PATCH) ---
        if (e.target.closest('.cycle-status')) {
            const badge = card.querySelector('.status-TODO, .status-IN_PROGRESS, .status-DONE');
            if (!badge) return;
            
            const order = ['TODO', 'IN_PROGRESS', 'DONE'];
            const currentStatus = order.find(s => badge.classList.contains(`status-${s}`));
            const next = order[(order.indexOf(currentStatus) + 1) % order.length];

            try {
                const response = await authFetch(`/api/tasks/${id}/`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: next })
                });
                if (response.ok) loadTasks();
                else showBannerError('Could not update task status.');
            } catch (err) {
                console.error("Network Error during Update:", err);
            }
        }

        // --- DELETE LOGIC (DELETE) ---
        if (e.target.closest('.delete-btn')) {
            if (!confirm("Are you sure you want to delete this task?")) return; 
            
            try {
                const response = await authFetch(`/api/tasks/${id}/`, { method: 'DELETE' });
                if (response.ok || response.status === 204) {
                    loadTasks();
                } else {
                    showBannerError('Could not delete task.');
                }
            } catch (err) {
                console.error("Network Error during Delete:", err);
            }
        }
    });
}

// ============ MODAL LOGIC ============
function openModal() {
    if (modal) modal.classList.add('active');
    if (formError) formError.classList.remove('show');
    
    // Reset form
    if (taskNameInput) taskNameInput.value = '';
    if (taskDescriptionInput) taskDescriptionInput.value = '';
    if (taskDueDateInput) taskDueDateInput.value = '';
    if (assigneeSelect) assigneeSelect.value = '';
    
    isEditing = false;
    editingTaskId = null;
    if (createTaskBtn) createTaskBtn.textContent = 'Create Task';
    
    loadAssignees(); // Populate dropdown
    if (taskNameInput) setTimeout(() => taskNameInput.focus(), 100);
}

function closeModal() {
    if (modal) modal.classList.remove('active');
    isEditing = false;
    editingTaskId = null;
    if (createTaskBtn) createTaskBtn.textContent = 'Create Task';
}

if (newTaskBtn) newTaskBtn.addEventListener('click', openModal);
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

// ============ EDIT MODAL LOGIC ============
async function openEditModal(taskId) {
    try {
        const response = await authFetch(`/api/tasks/${taskId}/`);
        if (response.ok) {
            const task = await response.json();
            
            if (taskNameInput) taskNameInput.value = task.title;
            if (taskDescriptionInput) taskDescriptionInput.value = task.description || '';
            if (taskDueDateInput) taskDueDateInput.value = task.due_date || '';
            if (assigneeSelect && task.assignee) assigneeSelect.value = task.assignee;
            
            isEditing = true;
            editingTaskId = taskId;
            
            if (createTaskBtn) createTaskBtn.textContent = 'Save Changes';
            if (modal) modal.classList.add('active');
            
            await loadAssignees(); // Ensure dropdown is populated
        }
    } catch (error) {
        console.error('Failed to load task for editing:', error);
        showBannerError('Failed to load task details.');
    }
}

// ============ CREATE / UPDATE TASK LOGIC (Unified) ============
if (createTaskBtn) {
    createTaskBtn.addEventListener('click', async () => {
        if (formError) formError.classList.remove('show');

        const name = taskNameInput ? taskNameInput.value.trim() : '';
        const description = taskDescriptionInput ? taskDescriptionInput.value.trim() : '';
        const dueDate = taskDueDateInput ? taskDueDateInput.value : '';
        const assigneeId = assigneeSelect ? assigneeSelect.value : '';

        // VALIDATION: Name and Date are mandatory
        if (!name) {
            if (formErrorText) formErrorText.textContent = 'Task title is required.';
            if (formError) formError.classList.add('show');
            return;
        }
        if (!dueDate) {
            if (formErrorText) formErrorText.textContent = 'Due date is mandatory.';
            if (formError) formError.classList.add('show');
            return;
        }

        const payload = {
            title: name,
            description: description,
            due_date: dueDate,
            status: 'TODO',
            priority: 'MEDIUM'
        };

        if (assigneeId) {
            payload.assignee = parseInt(assigneeId);
        }

        createTaskBtn.classList.add('loading');
        createTaskBtn.disabled = true;

        try {
            let response;
            if (isEditing) {
                // UPDATE EXISTING TASK
                response = await authFetch(`/api/tasks/${editingTaskId}/`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload)
                });
            } else {
                // CREATE NEW TASK
                response = await authFetch('/api/tasks/', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }

            if (response.ok) {
                closeModal();
                loadTasks();
            } else {
                const errData = await response.json().catch(() => ({}));
                const msg = errData.title || errData.detail || 'Failed to save task.';
                if (formErrorText) formErrorText.textContent = msg;
                if (formError) formError.classList.add('show');
            }
        } catch (error) {
            console.error('Error saving task:', error);
            if (formErrorText) formErrorText.textContent = 'Network error.';
            if (formError) formError.classList.add('show');
        } finally {
            createTaskBtn.classList.remove('loading');
            createTaskBtn.disabled = false;
        }
    });
}

// ============ ASSIGNEE DROPDOWN LOGIC ============
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
                option.textContent = `${user.email} (${user.role || 'User'})`; 
                assigneeSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load assignees:', error);
    }
}

// ============ THE DEBOUNCER (NOTES) ============
let currentTaskId = null; // FIXED TYPO (was currentTaskID)
const notesTextarea = document.getElementById('notesTextarea');
const saveStatus = document.getElementById('saveStatus');
let saveTimeout; 

if (notesTextarea && saveStatus) {
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
        }, 1000);
    });
}

// ============ LOGOUT ============
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    });
}

// ============ INITIALIZE ============
loadTasks();