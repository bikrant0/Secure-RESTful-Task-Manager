// ============ AUTH GUARD ============
if (!localStorage.getItem('access')) {
    window.location.href = '/';
}

// NOTE: your login handler in script.js must also save the email:
// localStorage.setItem('email', email);   <-- add this line right after
// localStorage.setItem('refresh', data.refresh); in the login success branch

// ============ AUTH FETCH HELPER ============
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('access');
    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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

// ============ CURRENT USER (single-user system — tasks always belong to whoever's logged in) ============
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
}

function hideBannerError() {
    errorBanner.classList.remove('show');
}

// ============ RENDER ONE TASK CARD ============
function renderTask(task) {
    const statusLabel = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[task.status];
    const priorityLabel = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' }[task.priority];

    const card = document.createElement('div');
    card.className = 'task-card' + (task.status === 'DONE' ? ' done' : '');
    card.dataset.id = task.id;

    card.innerHTML = `
        <div class="task-main">
            <div class="task-title">${task.title}</div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-meta">
                <span class="badge status-${task.status}">${statusLabel}</span>
                <span class="badge priority-${task.priority}">${priorityLabel}</span>
                ${task.due_date ? `<span class="task-due"><i class="fas fa-calendar"></i> ${task.due_date}</span>` : ''}
                <span class="task-assignee"><i class="fas fa-user"></i> ${currentUserEmail}</span>
            </div>
        </div>
        <div class="task-actions">
            <button class="icon-btn cycle-status" title="Cycle status (To Do → In Progress → Done)">
                <i class="fas fa-check"></i>
            </button>
            <button class="icon-btn delete" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    return card;
}

// ============ LOAD TASKS ============
async function loadTasks() {
    hideBannerError();
    try {
        const response = await authFetch('/api/tasks/');
        const data = await response.json();

        if (!response.ok) {
            showBannerError('Could not load tasks. Please try again.');
            return;
        }

        const tasks = data.results || data; // handles pagination wrapper if present
        taskList.innerHTML = '';

        if (tasks.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
            tasks.forEach(task => taskList.appendChild(renderTask(task)));
        }
    } catch (error) {
        showBannerError('Network error. Is the server running?');
    }
}

// ============ STATUS CYCLE + DELETE (event delegation) ============
taskList.addEventListener('click', async (e) => {
    const card = e.target.closest('.task-card');
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.closest('.cycle-status')) {
        const badge = card.querySelector('.status-TODO, .status-IN_PROGRESS, .status-DONE');
        const order = ['TODO', 'IN_PROGRESS', 'DONE'];
        const currentStatus = order.find(s => badge.classList.contains(`status-${s}`));
        const next = order[(order.indexOf(currentStatus) + 1) % order.length];

        const response = await authFetch(`/api/tasks/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status: next })
        });

        if (response.ok) {
            loadTasks();
        } else {
            showBannerError('Could not update task status.');
        }
    }

    if (e.target.closest('.delete')) {
        if (!confirm('Delete this task?')) return;

        const response = await authFetch(`/api/tasks/${id}/`, { method: 'DELETE' });

        if (response.ok || response.status === 204) {
            loadTasks();
        } else {
            showBannerError('Could not delete task.');
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
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// ============ CREATE TASK ============
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const status = document.getElementById('taskStatus').value;
    const priority = document.getElementById('taskPriority').value;
    const due_date = document.getElementById('taskDueDate').value || null;

    if (!title) {
        formErrorText.textContent = 'Title is required.';
        formError.classList.add('show');
        return;
    }

    taskFormBtn.classList.add('loading');
    taskFormBtn.disabled = true;

    const response = await authFetch('/api/tasks/', {
        method: 'POST',
        body: JSON.stringify({ title, description, status, priority, due_date })
    });

    const data = await response.json();

    taskFormBtn.classList.remove('loading');
    taskFormBtn.disabled = false;

    if (!response.ok) {
        formErrorText.textContent = data.title ? data.title[0] : 'Could not create task.';
        formError.classList.add('show');
        return;
    }

    closeModal();
    loadTasks();
});

// ============ INITIALIZE ============
loadTasks();