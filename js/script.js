let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let currentFilter = 'all';

const calendarDaysEl = document.getElementById('calendar-days');
const currentMonthEl = document.getElementById('current-month');
const tasksBodyEl = document.getElementById('tasks-body');
const addForm = document.getElementById('add-form');
const filterButtons = document.querySelectorAll('.filter-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    document.getElementById('date').valueAsDate = new Date();
    renderCalendar();
    renderTasks();
    setupEventListeners();
    
    if (tasks.length === 0) {
        addSampleTasks();
    }
}

function renderCalendar() {
    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    currentMonthEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    calendarDaysEl.innerHTML = '';
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    for (let i = 0; i < startingDay; i++) {
        calendarDaysEl.innerHTML += '<div class="day"></div>';
    }
    
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        
        if (day === today.getDate() && 
            currentMonth === today.getMonth() && 
            currentYear === today.getFullYear()) {
            dayEl.classList.add('today');
        }
        
        dayEl.innerHTML = `
            <div class="day-number">${day}</div>
            <div class="task-count">${getTasksForDay(day).length} задач</div>
        `;
        
        dayEl.addEventListener('click', () => {
            alert(`Задачи на ${day}.${currentMonth + 1}.${currentYear}:\n` + 
                  getTasksForDay(day).map(t => `• ${t.title}`).join('\n') || 'Нет задач');
        });
        
        calendarDaysEl.appendChild(dayEl);
    }
}

function getTasksForDay(day) {
    return tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate.getDate() === day && 
               taskDate.getMonth() === currentMonth && 
               taskDate.getFullYear() === currentYear;
    });
}

function renderTasks() {
    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }
    
    tasksBodyEl.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        tasksBodyEl.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; padding:2rem;">
                    Задач нет. Добавьте первую!
                </td>
            </tr>
        `;
        return;
    }
    
    filteredTasks.forEach(task => {
        const row = document.createElement('tr');
        const taskDate = new Date(task.date);
        
        row.innerHTML = `
            <td>${taskDate.toLocaleDateString('ru-RU')}</td>
            <td>${task.title}</td>
            <td><span class="status ${task.completed ? 'completed' : 'active'}">
                ${task.completed ? 'Выполнено' : 'Активно'}
            </span></td>
            <td>
                <div class="actions">
                    <button class="complete" data-id="${task.id}">
                        ${task.completed ? '⟲' : '✓'}
                    </button>
                    <button class="edit" data-id="${task.id}">✎</button>
                    <button class="delete" data-id="${task.id}">×</button>
                </div>
            </td>
        `;
        
        tasksBodyEl.appendChild(row);
    });
    
    document.querySelectorAll('.complete').forEach(btn => {
        btn.addEventListener('click', (e) => toggleTask(e.target.dataset.id));
    });
    
    document.querySelectorAll('.edit').forEach(btn => {
        btn.addEventListener('click', (e) => openEdit(e.target.dataset.id));
    });
    
    document.querySelectorAll('.delete').forEach(btn => {
        btn.addEventListener('click', (e) => deleteTask(e.target.dataset.id));
    });
}

function addTask(title, date) {
    const task = {
        id: Date.now().toString(),
        title,
        date,
        completed: false
    };
    
    tasks.push(task);
    saveTasks();
    renderCalendar();
    renderTasks();
    alert(`Задача "${title}" добавлена!`);
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderCalendar();
        renderTasks();
    }
}

function deleteTask(id) {
    if (confirm('Удалить задачу?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderCalendar();
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function openEdit(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-title').value = task.title;
    
    const taskDate = new Date(task.date);
    document.getElementById('edit-date').value = taskDate.toISOString().split('T')[0];
    
    editModal.classList.add('active');
}

function closeEdit() {
    editModal.classList.remove('active');
    editForm.reset();
}

function setupEventListeners() {
    document.getElementById('prev').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    document.getElementById('next').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value.trim();
        const date = document.getElementById('date').value;
        
        if (!title) {
            alert('Введите название задачи');
            return;
        }
        
        addTask(title, date);
        addForm.reset();
        document.getElementById('date').valueAsDate = new Date();
    });
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('edit-id').value;
        const title = document.getElementById('edit-title').value.trim();
        const date = document.getElementById('edit-date').value;
        
        if (!title) {
            alert('Введите название');
            return;
        }
        
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.title = title;
            task.date = date;
            saveTasks();
            renderCalendar();
            renderTasks();
            closeEdit();
        }
    });
    
    document.querySelectorAll('.cancel').forEach(btn => {
        btn.addEventListener('click', closeEdit);
    });
    
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEdit();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && editModal.classList.contains('active')) {
            closeEdit();
        }
    });
}

function addSampleTasks() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sampleTasks = [
        { title: 'Завершить проект', date: today.toISOString().split('T')[0] },
        { title: 'Подготовить презентацию', date: tomorrow.toISOString().split('T')[0] },
        { title: 'Изучить материал', date: today.toISOString().split('T')[0] },
        { title: 'Оптимизировать код', date: tomorrow.toISOString().split('T')[0] },
        { title: 'Протестировать', date: today.toISOString().split('T')[0] },
        { title: 'Добавить анимации', date: tomorrow.toISOString().split('T')[0] },
        { title: 'Написать документацию', date: today.toISOString().split('T')[0] },
        { title: 'Проанализировать', date: tomorrow.toISOString().split('T')[0] }
    ];
    
    sampleTasks.forEach(task => {
        tasks.push({
            id: Date.now().toString() + Math.random(),
            title: task.title,
            date: task.date,
            completed: false
        });
    });
    
    saveTasks();
    renderCalendar();
    renderTasks();
}