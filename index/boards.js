const addTaskModal = async () => {
    await includeTemplate($('#add-task-modal > div'));
    $('#add-task-modal').openModal();
}

const addDragAndDrop = () => {
    const task = event.currentTarget;
    const { x, y } = task.getBoundingClientRect();
    const startingPosition = {
        startingX: event.pageX,
        startingY: event.pageY,
        offsetX: event.clientX - x,
        offsetY: event.clientY - y
    }
    task.addEventListener("mousemove", dragHandler = () => {
        taskDragger(startingPosition);
    });
    document.addEventListener("mouseup", (event) => {
        taskDropper(event, task, startingPosition);
        task.removeEventListener("mousemove", dragHandler);
    }, { once: true });
}

const taskDragger = throttle(({ startingX, startingY }) => {
    event.currentTarget.style.setProperty('--x', event.pageX - startingX);
    event.currentTarget.style.setProperty('--y', event.pageY - startingY);
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
            taskWrapper.append(task)
            const { x, y } = task.getBoundingClientRect();
            const deltaX = (pageX - parseInt(x)) - parseInt(offsetX);
            const deltaY = (pageY - parseInt(y)) - parseInt(offsetY);
            task.updatePosition(deltaX, deltaY);
            log(taskWrapper.id)
        }
    })
    const start = Date.now()
    task.classList.add('drop-transition');
    log(task.classList.contains('drop-transition'))
    task.addEventListener("transitionstart", ()=>log('started'))
    task.addEventListener("transitionend", () => {
        task.classList.remove('drop-transition');
        task.style.transitionDuration = '';
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