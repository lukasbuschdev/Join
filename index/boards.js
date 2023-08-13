const initBoard = async () => {
    await getBoards();
    await getAllUsers();
    renderTasks();
}

const renderTasks = async (boardId = SESSION_getData('activeBoard')) => {
    const {tasks} = BOARDS[boardId];
    for (const task of Object.values(tasks)) $(`#${task.type}`).innerHTML += taskTemplate(task);
    await $('#tasks').LANG_load();
}

const addTaskModal = async () => {
    await includeTemplate($('#add-task-modal > div'));
    $('#add-task-modal').openModal();
}


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

    task.addEventListener('mouseup', fullscreenHandler = () => renderFullscreenTask(task.dataset.id), {once: true});

    const clickTimeout = setTimeout(() => {
        task.classList.add('active');
        task.removeEventListener('mouseup', fullscreenHandler, {once: true});
    }, 200);

    const dragHandler = () => taskDragger(startingPosition)

    task.addEventListener("mousemove", dragHandler);

    document.addEventListener("mouseup", (event) => {
        if (!waitForMovement) taskDropper(event, task, startingPosition);
        task.classList.remove('active');
        waitForMovement = true;
        taskNotActive = true;
        task.removeEventListener("mousemove", dragHandler);
        clearTimeout(clickTimeout);
    }, { once: true });
}

const renderFullscreenTask = (ids) => {
    if (event.which !== 1) return;
    const modal = $('#fullscreen-task-modal');
    const [boardId, taskId] = ids.split('/');
    const taskData = BOARDS[boardId].tasks[taskId];
    modal.innerHTML = fullscreenTaskTemplate(taskData);
    modal.LANG_load();
    modal.openModal();
};

const changeSubtaskDoneState = () => {
    const state = event.currentTarget.checked;

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
}, 10)

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
    task.classList.add('drop-transition');
    task.addEventListener("transitionend", () => {
        task.classList.remove('drop-transition');
    }, { once: true });
    task.updatePosition();
}

const setTransitionSpeed = (el, deltaX, deltaY) => {
    const transitionSpeed = `${parseInt(Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) / 2)}ms`;
    el.style.transitionDuration = transitionSpeed;
}

const updatePosition = (el, x = 0, y = 0) => {
    el.style.setProperty('--x', `${x}`);
    el.style.setProperty('--y', `${y}`);
}