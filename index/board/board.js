let initialTask;

const initBoard = async () => {
    await getAllUsers();
    await getBoards();
    if (Object.values(BOARDS).length === 0) return
    renderBoardTitleSelection();
    renderTasks();
}

function renderBoardTitleSelection() {
    $('#board-title-selection .options').innerHTML = Object.values(BOARDS).reduce((template, board) => {
        return `${template}${boardTitleSelectionTemplate(board)}`
    }, ``);
}

function boardTitleSelectionTemplate({id, name}) {
    return/*html*/`
        <h4 class="option" onclick="switchBoards(${id})">${name}</h4>
    `
}

function switchBoards(id) {
    SESSION_setData('activeBoard', Number(id));
    location.reload();
}

const renderTasks = async (filter) => {
    let boardId = SESSION_getData('activeBoard');
    if (!(boardId in BOARDS)) boardId = Object.keys(BOARDS)[0];
    const {tasks, name} = BOARDS[boardId];

    const boardHeader = $('#board-header h2');
    delete boardHeader.dataset.lang;
    boardHeader.innerText = name;

    if (!Object.values(tasks).length) return;
    const tasksContainer = $('#tasks');
    
    tasksContainer.$$(':scope > div > div:last-child').for(container => container.innerHTML = "");
    const filteredTasks = (filter)
    ? Object.values(tasks).filter(task => task.title.toLowerCase().includes(filter.toLowerCase()) || task.description.toLowerCase().includes(filter.toLowerCase()))
    : Object.values(tasks);
    filteredTasks.toReversed().for(task => $(`#${task.type}`).innerHTML += taskTemplate(task, filter));
    await tasksContainer.LANG_load();
}

const searchTasks = debounce(() => {
    const searchInput = $('#search-task input').value;
    renderTasks(searchInput);
}, 200);

const focusInput = () => {
    $('#search-task input').focus();
}

const clearTaskSearch = () => {
    $('#search-task input').value = "";
    renderTasks();
}

const addTaskModal = async () => {
    renderBoardIds();
    renderDate();
    $('#add-task-modal').openModal();
}

function toggleBoardTitleSelection() {
    const el = event.currentTarget
    el.classList.toggle('active');
    if (el.classList.contains('active')) {
        window.addEventListener('pointerdown', closeHandler = () => {
            if (event.target.closest('#board-title-selection')) return;
            el.classList.remove('active');
            window.removeEventListener('pointerdown', closeHandler);
        })
    }
}

const renderFullscreenTask = (ids) => {
    if (event.which !== 1) return;
    const modal = $('#fullscreen-task-modal');
    const [boardId, taskId] = ids.split('/');
    const taskData = BOARDS[boardId].tasks[taskId];
    SELECTED_TASK = new Task(taskData);
    initialTask = _.cloneDeep(removeMethods(SELECTED_TASK));
    modal.$('#fullscreen-task').innerHTML = fullscreenTaskTemplate(taskData);
    modal.LANG_load();
    modal.openModal();
    modal.addEventListener('close', saveTaskChanges, {once: true});
};

const saveEditedTask = () => {
    const editedTaskData = {
        title: $('#fullscreen-task-modal #title').value,
        description: $('#fullscreen-task-modal #description').value,
        dueDate: $('#fullscreen-task-modal #date').value,
        priority: $('#fullscreen-task-modal .prio-btn.active span').dataset.lang,
        assignedTo: [...$$('#edit-task .drp-contacts > div.active')].map(contact => contact.dataset.id),
        subTasks: [...$$('#edit-task #subtask-container li')].map(({innerText: name}) => {
            return {
                name,
                done: SELECTED_TASK.subTasks.find(({name: subTaskName}) => subTaskName === name)?.done || false
            }
        })
    }
    Object.assign(SELECTED_TASK, editedTaskData);
    $('#fullscreen-task-modal').closeModal();
    toggleFullscreenState();
}

const saveTaskChanges = () => {
    const updatedTask = removeMethods(SELECTED_TASK);

    const differences = getJsonChanges(updatedTask, initialTask);
    if (Object.values(differences).length > 0) {
        updateTaskUi(differences, initialTask);
        SELECTED_TASK.update();
    }
};

const deleteTask = () => confirmation(`delete-task, {taskName: '${SELECTED_TASK.title}'}`, async () => {
    const {boardId, id, name} = SELECTED_TASK;
    const modal = $('#fullscreen-task-modal');
    const taskElement = $(`.task[data-id="${boardId}/${id}"]`);
    const taskContainer = taskElement.parentElement;
    await REMOTE_removeData(`boards/${boardId}/tasks/${id}`);
    modal.removeEventListener('close', saveTaskChanges, {once: true});
    modal.closeModal();
    taskElement.remove();
    taskContainer.innerHTML = taskContainer.innerHTML.trim();
    notification(`task-deleted, {taskName: '${name}'}`);
})

const getJsonChanges = (newJson, oldJson) => {
    let differences = {};
    for (const key in newJson) {
        if (typeof newJson[key] == "function") continue;
        if (typeof newJson[key] == "object") {
            if (_.isEqual(newJson[key], oldJson[key]) == false) differences[key] = newJson[key];
        }
        else if (newJson[key] !== oldJson[key]) differences[key] = newJson[key];
    };
    return differences;
};

const changeSubtaskDoneState = async (subTaskName) => {
    const subTaskCheckBox = event.currentTarget;
    const isChecked = (subTaskCheckBox.checked);

    let subTaskIndex;
    for(let i = 0; i < SELECTED_TASK.subTasks.length; i++) {
        if (SELECTED_TASK.subTasks[i].name === subTaskName) {
            subTaskIndex = i;
            break;
        };
    };
    SELECTED_TASK.subTasks[subTaskIndex].done = isChecked;
};

const updateTaskUi = ({title = null, description = null, priority = null, assignedTo = null, subTasks = null}, initialTask) => {
    const taskContainer = $(`[data-id="${SELECTED_TASK.boardId}/${SELECTED_TASK.id}"]`);
    
    if (title) taskContainer.$('.task-title').textAnimation(title);
    if (description) taskContainer.$('.task-description').textAnimation(description);
    if (priority) taskContainer.$('.task-priority').style.setProperty('--priority', `url(../assets/img/icons/prio_${priority}.svg)`);
    if (assignedTo) taskContainer.$('.task-assigned-to').innerHTML = assignedToTemplate(assignedTo.map(id => ALL_USERS[id]));
    if (subTasks) {
        if (!SELECTED_TASK.subTasks.length) return taskContainer.$('.task-description').nextElementSibling.remove();
        if (!initialTask.subTasks.length) {
            taskContainer.$('.task-description').insertAdjacentHTML('afterend', progressTemplate(SELECTED_TASK.subTasks));
        }
        const currentSubtaskCount = SELECTED_TASK.subTasks.filter(({done}) => done == true).length;
        const totalSubtaskCount = SELECTED_TASK.subTasks.length;
        taskContainer.$('.task-progress-counter span').innerText = `${currentSubtaskCount} / ${totalSubtaskCount}`;
        taskContainer.$('.task-progress-bar').style.setProperty('--progress', `${currentSubtaskCount/totalSubtaskCount}`);
    }
};

const editTaskInitializer = async () => {
    const editTaskContainer = $('#edit-task');
    editTaskContainer.innerHTML = editTaskTemplate(SELECTED_TASK);
    await editTaskContainer.LANG_load();
    await renderAssignedContacts();
    editTaskContainer.initMenus();
    
    toggleFullscreenState();
};

const renderAssignedContacts = async () => {
    renderAssignToContacts();
    await $(`.drp-contacts [data-id="${currentUserId()}"]`)?.LANG_load();
    $('.drp-contacts').$$('.drp-option').for(
        contact => contact.classList.toggle('active', SELECTED_TASK.assignedTo.includes(contact.dataset.id))
    );
};

const toggleFullscreenState = () => {
    const fullscreenModal = $('#fullscreen-task-modal');
    fullscreenModal.$$('#fullscreen-task, #edit-task').for(section => {
        section.initMenus();
        section.classList.toggle('d-none');
        if (section.id == "edit-task" && section.classList.contains('d-none')) section.innerHTML = '';
    });
    fullscreenModal.setAttribute('static', (fullscreenModal.getAttribute('static') == "true") ? "false" : "true");
};

async function changeTaskType (taskId, newType) {
    SELECTED_BOARD.tasks[taskId].type = newType;
    await SELECTED_BOARD.update();
    return getBoards();
}