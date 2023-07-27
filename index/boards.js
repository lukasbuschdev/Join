const initBoard = () => {
    renderTasks();
}

const renderTasks = async () => {
    const [boardId] = await REMOTE_getData(`users/${currentUserId()}/boards`) ?? [undefined];
    if (!boardId) return;
    const board = await REMOTE_getData(`boards/${boardId}`, true);
    if (!board) return;
    for await (const task of Object.values(board.tasks)) {
        $(`#${task.type}`).innerHTML += await taskTemplate(task);
    };
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

    const clickTimeout = setTimeout(() => {
        task.classList.add('active');
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
            taskWrapper.append(task);
            changeTaskType(task, taskWrapper.id)
            const { x, y } = task.getBoundingClientRect();
            const deltaX = (pageX - parseInt(x)) - parseInt(offsetX);
            const deltaY = (pageY - parseInt(y)) - parseInt(offsetY);
            task.updatePosition(deltaX, deltaY);
        }
    })
    const start = Date.now()
    task.classList.add('drop-transition');
    task.addEventListener("transitionend", () => {
        task.classList.remove('drop-transition');
        log(Date.now() - start)
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

const changeTaskType = async (taskElement, newType) => {
    const [boardId, taskId] = taskElement.dataset.id.split('/');
    const task = await REMOTE_getData(`boards/${boardId}/tasks/${taskId}`, true);
    await task.setProperty('type', newType);
}