const addTaskModal = async () => {
    await includeTemplate($('#add-task-modal > div'));
    $('#add-task-modal').openModal();
}

const addDragAndDrop = () => {
    const task = event.currentTarget;
    const startingPosition = {
        startingX: event.pageX,
        startingY: event.pageY,
    }
    task.addEventListener("mousemove", dragHandler = () => {
        taskDragger(startingPosition);
    });
    // task.addEventListener("mouseleave", () => {
    //     taskDropper(event, task);
    //     task.removeEventListener("mousemove", dragHandler);
    // }, { once: true });
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

const taskDropper = ({pageX, pageY, offsetX, offsetY}, task, { startingX, startingY }) => {
    $$('#tasks > div').for(taskWrapper => {
        const { x: x1, y: y1, width, height } = taskWrapper.getBoundingClientRect();
        if (x1 < pageX && pageX < (x1 + width) &&
            y1 < pageY && pageY < (y1 + height)) {
            taskWrapper.classList.remove('placeholder');
            taskWrapper.append(task)
            const { x, y, width, height } = task.getBoundingClientRect();
            // task.style.setProperty('--x', `${pageX - x1 - offsetX}`);
            task.style.setProperty('--x', `${0}`);
            task.style.setProperty('--y', `${y - y1}`);
        }
    })
    // task.classList.add('drop-transition');
    // task.addEventListener("transitionend", () => {
    //     task.classList.remove('drop-transition');
    // }, { once: true });
    // task.style.setProperty('--x', '0');
    // task.style.setProperty('--y', '0');
}