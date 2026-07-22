// ============ TASK DATA ============
const tasksData = {
    today: [
        { name: 'Finish monthly reporting', due: 'Today', stage: 'in-progress', priority: 'high', team: 'Marketing 02', assignee: 1 },
        { name: 'Contract signing', due: 'Today', stage: 'in-progress', priority: 'medium', team: 'Operations', assignee: 2 },
        { name: 'Market overview keynote', due: 'Today', stage: 'in-progress', priority: 'high', team: 'Customer Care', assignee: 3 }
    ],
    tomorrow: [
        { name: 'Brand proposal', due: 'Tomorrow', stage: 'not-started', priority: 'high', team: 'Marketing 02', assignee: 4 },
        { name: 'Social media review', due: 'Tomorrow', stage: 'in-progress', priority: 'medium', team: 'Operations', assignee: 5 },
        { name: 'Report - Week 30', due: 'Tomorrow', stage: 'not-started', priority: 'low', team: 'Operations', assignee: 6 }
    ],
    week: [
        { name: 'Order check-ins', due: 'Wednesday', stage: 'in-progress', priority: 'medium', team: 'Retails', assignee: 7 },
        { name: 'HR reviews', due: 'Wednesday', stage: 'not-started', priority: 'medium', team: 'People', assignee: 8 },
        { name: 'Report - Week 30', due: 'Friday', stage: 'not-started', priority: 'low', team: 'Development', assignee: 9 }
    ]
};

// Fetching Data Connecting APis
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('access');

    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, { ...options, headers });
    return response;
}

// ============ RENDER TASKS ============
function renderTasks() {
    ['today', 'tomorrow', 'week'].forEach(group => {
        const container = document.getElementById(`${group}Tasks`);
        if (!container) return;

        container.innerHTML = tasksData[group].map((task, index) => `
            <div class="task-row">
                <div class="task-checkbox" data-group="${group}" data-index="${index}"></div>
                <span class="task-name">${task.name}</span>
                <span class="task-due">${task.due}</span>
                <div class="task-stage">
                    <span class="stage-badge ${task.stage}">${task.stage === 'in-progress' ? 'In progress' : 'Not started'}</span>
                </div>
                <div class="task-priority">
                    <span class="priority-badge ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                </div>
                <div class="task-team">${task.team}</div>
                <div class="task-assignee">
                    <img src="https://i.pravatar.cc/40?img=${task.assignee + 10}" class="assignee-avatar" alt="Assignee">
                </div>
            </div>
        `).join('');
    });
    authFetch('/api/tasks/').then(r => r.json()).then(data => console.log(data));

    // Add checkbox click handlers
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', function () {
            this.classList.toggle('checked');
            const taskName = this.nextElementSibling;
            taskName.classList.toggle('completed');
        });
    });
}

// ============ VIEW SWITCHING ============
const navItems = document.querySelectorAll('.nav-item[data-view]');
const tasksView = document.getElementById('tasksView');
const dashboardView = document.getElementById('dashboardView');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        const view = item.dataset.view;
        if (view === 'tasks') {
            tasksView.classList.remove('hidden');
            dashboardView.classList.add('hidden');
        } else if (view === 'dashboard') {
            dashboardView.classList.remove('hidden');
            tasksView.classList.add('hidden');
        }
    });
});

// ============ MODAL ============
const modal = document.getElementById('taskModal');
const newTaskBtn = document.getElementById('newTaskBtn');
const modalClose = document.getElementById('modalClose');
const createTaskBtn = document.getElementById('createTaskBtn');
const taskNameInput = document.getElementById('taskNameInput');

function openModal() {
    modal.classList.add('active');
    setTimeout(() => taskNameInput.focus(), 100);
}

function closeModal() {
    modal.classList.remove('active');
    taskNameInput.value = '';
    document.getElementById('taskDescription').value = '';
}

newTaskBtn.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Option buttons toggle
document.querySelectorAll('.option-btn:not(.add):not(.add-text)').forEach(btn => {
    btn.addEventListener('click', function () {
        const siblings = this.parentElement.querySelectorAll('.option-btn:not(.add):not(.add-text)');
        siblings.forEach(s => s.classList.remove('active'));
        this.classList.add('active');
    });
});

// Create task
createTaskBtn.addEventListener('click', () => {
    const name = taskNameInput.value.trim();
    if (!name) {
        taskNameInput.style.borderBottom = '2px solid #ff4757';
        setTimeout(() => taskNameInput.style.borderBottom = 'none', 1500);
        return;
    }

    // Get selected day
    const activeDay = document.querySelector('.modal-row:first-child .option-btn.active');
    const day = activeDay ? activeDay.textContent : 'Today';

    // Add to appropriate group
    const group = day === 'Today' ? 'today' : day === 'Tomorrow' ? 'tomorrow' : 'week';
    tasksData[group].unshift({
        name: name,
        due: day,
        stage: 'not-started',
        priority: 'medium',
        team: 'My Team',
        assignee: Math.floor(Math.random() * 10)
    });

    renderTasks();
    closeModal();

    // Switch to tasks view
    document.querySelector('[data-view="tasks"]').click();
});

// ============ TRACKING WIDGET ============
document.querySelectorAll('.track-btn.play, .track-btn.pause').forEach(btn => {
    btn.addEventListener('click', function () {
        const item = this.closest('.tracking-item');
        const allItems = document.querySelectorAll('.tracking-item');

        allItems.forEach(i => {
            i.classList.remove('active');
            const playBtn = i.querySelector('.track-btn.play, .track-btn.pause');
            if (playBtn) {
                playBtn.className = 'track-btn play';
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });

        if (this.classList.contains('play')) {
            item.classList.add('active');
            this.className = 'track-btn pause';
            this.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            this.className = 'track-btn play';
            this.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
});

// ============ WIDGET TASK CHECKBOXES ============
document.querySelectorAll('.widget-task .custom-check input').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const taskName = this.closest('.widget-task').querySelector('.task-name');
        if (this.checked) {
            taskName.classList.add('done-text');
        } else {
            taskName.classList.remove('done-text');
        }
    });
});

// ============ INITIALIZE ============
renderTasks();

console.log('Organizo Dashboard Loaded');

