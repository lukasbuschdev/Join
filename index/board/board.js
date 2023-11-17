let initialTask;

const initBoard = async () => {
    await getAllUsers();
    await getBoards();
    if (Object.values(BOARDS).length) return renderTasks();
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
        if (SELECTED_TASK.subTasks[i].name == subTaskName) {
            subTaskIndex = i;
            break;
        };
    };
    SELECTED_TASK.subTasks[subTaskIndex].done = isChecked;
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

const editTaskInitializer = async () => {
    const editTaskContainer = $('#edit-task');
    editTaskContainer.innerHTML = editTaskTemplate(SELECTED_TASK);
    await editTaskContainer.LANG_load();
    await renderAssignedContacts();
    editTaskContainer.$('#selected-collaborator-input').innerHTML = editTaskAssignedTo();
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

function checkScroll({pageY}, task) {
    const taskContainer = $('#tasks');
    const scrollDireciton = pageY < window.innerHeight * 0.3 && taskContainer.scrollTop > 0 ? -1 : pageY > window.innerHeight * 0.9 && taskContainer.scrollTop < taskContainer.scrollHeight ? 1 : 0;
    if (scrollDireciton === 0) {
        if (window.taskScrollInterval) {
            log('stopping scroll!')
            clearInterval(window.taskScrollInterval);
            delete window.taskScrollInterval;
        }
        return;
    }
    if (window.taskScrollInterval) return;
    log("creating interval")
    window.taskScrollInterval = setInterval(()=> {
        log(`scrolling ${scrollDireciton === 1 ? 'down' : 'up'}`)
        taskContainer.scrollBy(0, 2 * scrollDireciton);
        task.updatePosition(0, 2 * scrollDireciton);
    }, 20);
}

const taskDragger = throttle(({ startingX, startingY }) => {
    const task = event.currentTarget;
    if (Math.abs(event.pageX - startingX) + Math.abs(event.pageY - startingY) > 10) waitForMovement = false;
    if (waitForMovement) return;

    if (taskNotActive) {
        task.classList.add('active');
        taskNotActive = false;
    };
    checkScroll(event, task);

    task.style.setProperty('--x', event.pageX - startingX);
    task.style.setProperty('--y', event.pageY - startingY);

    checkPlaceholder(event);
}, 10);

const checkPlaceholder = ({pageX, pageY}) => {
    $$('#tasks > div > div:last-child').for(taskWrapper => {
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
    $$('#tasks > div > div:last-child').for(taskWrapper => {
        if (taskWrapper == task.parentElement) return;
        const { x, y, width, height } = taskWrapper.getBoundingClientRect();
        if (x < pageX && pageX < (x + width) &&
            y < pageY && pageY < (y + height)) {
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
    // task.classList.remove('active');
    task.classList.add('drop-transition');
    task.addEventListener("transitionend", () => {
        task.classList.remove('drop-transition');
    }, { once: true });
    task.updatePosition();
    if (window.taskScrollInterval) {
        clearInterval(window.taskScrollInterval);
        delete window.taskScrollInterval;
    }
}

const changeTaskType = async (taskElement, newType) => {
    if (newType !== "to-do" &&
        newType !== "in-progress" &&
        newType !== "awaiting-feedback" &&
        newType !== "done") return error(newType);
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