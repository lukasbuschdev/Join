let initialTask;

const initBoard = async () => {
    await getBoards();
    await getAllUsers();
    return renderTasks();
}

const renderTasks = (filter) => {
    const boardId = SESSION_getData('activeBoard') ?? Object.keys(BOARDS)[0];
    const {tasks} = BOARDS[boardId];
    const tasksContainer = $('#tasks');

    tasksContainer.$$(':scope > div').for(container => container.innerHTML = "");
    const filteredTasks = (filter)
        ? Object.values(tasks).filter(task => task.title.includes(filter) || task.description.includes(filter))
        : Object.values(tasks);
    filteredTasks.for(task => $(`#${task.type}`).innerHTML += taskTemplate(task, filter));
    tasksContainer.LANG_load();
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
    await $('#add-task-modal > div').includeTemplate();
    renderBoardIds();
    $('#add-task-modal').openModal();
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
        title: $('#title').value,
        description: $('#description').value,
        dueDate: $('#date').value,
        priority: $('.prio-btn.active span').dataset.lang,
        assignedTo: selectedCollaborators,
        subTasks: subtasks.map(name => {
            return {
                name,
                done: SELECTED_TASK.subTasks.find(({name: subTaskName}) => subTaskName == name)?.done || false
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
        updateTaskUi(differences);
        SELECTED_TASK.update();
        log('difference')
    }
    else log('no difference');
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
    const isChecked = (subTaskCheckBox.getAttribute('checked') == "true") ? true : false;
    subTaskCheckBox.setAttribute('checked', (isChecked) ? 'false' : 'true');

    let subTaskIndex;
    for(let i = 0; i < SELECTED_TASK.subTasks.length; i++) {
        if (SELECTED_TASK.subTasks[i].name == subTaskName) {
            subTaskIndex = i;
            break;
        };
    };
    SELECTED_TASK.subTasks[subTaskIndex].done = !isChecked;
};

const updateTaskUi = ({title = null, description = null, priority = null, assignedTo = null, subTasks = null}) => {
    const taskContainer = $(`[data-id="${SELECTED_TASK.boardId}/${SELECTED_TASK.id}"]`);
    
    if (title) taskContainer.$('.task-title').textAnimation(title);
    if (description) taskContainer.$('.task-description').textAnimation(description);
    if (priority) taskContainer.$('.task-priority').style.setProperty('--priority', `url(../assets/img/icons/prio_${priority}.svg)`);
    if (assignedTo) taskContainer.$('.task-assigned-to').innerHTML = assignedToTemplate(assignedTo.map(id => ALL_USERS[id]));
    if (subTasks) {
        const currentSubtaskCount = SELECTED_TASK.subTasks.filter(({done}) => done == true).length;
        const totalSubtaskCount = SELECTED_TASK.subTasks.length;
        taskContainer.$('.task-progress-counter span').innerText = `${currentSubtaskCount} / ${totalSubtaskCount}`;
        taskContainer.$('.task-progress-bar').style.setProperty('--progress', `${currentSubtaskCount/totalSubtaskCount}`);
    }
};

const editTaskInitializer = () => {
    const editTaskContainer = $('#edit-task');
    editTaskContainer.innerHTML = editTaskTemplate(SELECTED_TASK);
    editTaskContainer.LANG_load();
    if (SELECTED_TASK.assignedTo) editTaskContainer.$('#selected-collaborator-input').innerHTML = editTaskAssignedTo();
    renderAssignedContacts();
    editTaskContainer.$('.fullscreen-content').addScrollShadow();
    editTaskContainer.initMenus();
    
    toggleFullscreenState();
    
    const saveTaskButton = $('#save-task');
    // saveTaskButton.addEventListener('click', saveHandler(), {once: true});
};

const renderAssignedContacts = () => {
    renderAssignToContacts();
    $('.drp-contacts').$$('.drp-option').for(
        contact => contact.classList.toggle('active', SELECTED_TASK.assignedTo.includes(contact.dataset.id))
    );
}

const toggleFullscreenState = () => {
    const fullscreenModal = $('#fullscreen-task-modal')
    fullscreenModal.$$(':is(#fullscreen-task, #edit-task)').for(section => {
        section.initMenus();
        section.classList.toggle('d-none');
        if (section.id == "edit-task" && section.classList.contains('d-none')) section.innerHTML = '';
    });
    fullscreenModal.setAttribute('static', (fullscreenModal.getAttribute('static') == "true") ? "false" : "true");
};

//DRAG & DROP

let waitForMovement = true;
let taskNotActive = true;
const addDragAndDrop = () => {
    const task = event.currentTarget;
    const { x, y } = task.getBoundingClientRect();
    const startingPosition = {
        startingX: event.pageX,
        startingY: event.pageY,
        offsetX: event.clientX - x,
        offsetY: event.clientY - y
    }

    task.addEventListener('pointerup', fullscreenHandler = () => renderFullscreenTask(task.dataset.id), {once: true});

    const clickTimeout = setTimeout(() => {
        task.classList.add('active');
        task.removeEventListener('pointerup', fullscreenHandler, {once: true});
    }, 200);

    const dragHandler = () => taskDragger(startingPosition)
    task.setPointerCapture(event.pointerId);
    task.addEventListener('pointermove', dragHandler);

    document.addEventListener("pointerup", (event) => {
        if (!waitForMovement) taskDropper(event, task, startingPosition);
        task.classList.remove('active');
        waitForMovement = true;
        taskNotActive = true;
        task.removeEventListener("pointermove", dragHandler);
        clearTimeout(clickTimeout);
    }, { once: true });
}

const taskDragger = throttle(({ startingX, startingY }) => {
    const task = event.currentTarget;
    if (Math.abs(event.pageX - startingX) > 10 || Math.abs(event.pageY - startingY) > 10) waitForMovement = false;
    if (waitForMovement) return;

    if (taskNotActive) {
        task.classList.add('active');
        taskNotActive = false;
    };

    task.style.setProperty('--x', event.pageX - startingX);
    task.style.setProperty('--y', event.pageY - startingY);
    checkPlaceholder(event);
}, 10);

const checkPlaceholder = ({pageX, pageY}) => {
    $$('#tasks > div').for(taskWrapper => {
        const { x, y, width, height } = taskWrapper.getBoundingClientRect();
        if (x < pageX && pageX < (x + width) &&
            y < pageY && pageY < (y + height)) {
                if (!taskWrapper.classList.contains('placeholder')) {
                    taskWrapper.classList.add('placeholder');
                }
            } else if (taskWrapper.classList.contains('placeholder')) {
                taskWrapper.classList.remove('placeholder');
            }
    })
}

const taskDropper = ({ pageX, pageY }, task, { offsetX, offsetY }) => {
    $$('#tasks > div').for(taskWrapper => {
        if (taskWrapper == task.parentElement) return;
        const { x, y, width, height } = taskWrapper.getBoundingClientRect();
        if (x < pageX && pageX < (x + width) &&
            y < pageY && pageY < (y + height)) {
                log(taskWrapper);
            taskWrapper.classList.remove('placeholder');
            task.updatePosition();
            const previousParent = task.parentElement;  // Experimental
            taskWrapper.append(task);
            previousParent.innerHTML = previousParent.innerHTML.trim();  // Experimental
            changeTaskType(task, taskWrapper.id)
            const { x, y } = task.getBoundingClientRect();
            const deltaX = (pageX - parseInt(x)) - parseInt(offsetX);
            const deltaY = (pageY - parseInt(y)) - parseInt(offsetY);
            task.updatePosition(deltaX, deltaY);
        }
    });
    task.classList.add('drop-transition');
    task.addEventListener("transitionend", () => {
        task.classList.remove('drop-transition');
    }, { once: true });
    task.updatePosition();
}

const changeTaskType = async (taskElement, newType) => {
    const [, taskId] = taskElement.dataset.id.split('/');
    const task = new Task(SELECTED_BOARD.tasks[taskId]);
    await task.setProperty('type', newType);
    await getBoards();
}

const setTransitionSpeed = (el, deltaX, deltaY) => {
    const transitionSpeed = `${parseInt(Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) / 2)}ms`;
    el.style.transitionDuration = transitionSpeed;
}

const updatePosition = (el, x = 0, y = 0) => {
    el.style.setProperty('--x', `${x}`);
    el.style.setProperty('--y', `${y}`);
}