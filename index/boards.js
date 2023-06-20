const addTaskModal = async () => {
    await includeTemplate($('#add-task-modal > div'));
    $('#add-task-modal').openModal();
}

const addDragAndDrop = () => {
    const task = event.currentTarget;
    const currentPosition = {
        mouseX: event.pageX,
        mouseY: event.pageY,
        currentX: Number(event.currentTarget.style.getPropertyValue('--x')),
        currentY: Number(event.currentTarget.style.getPropertyValue('--y'))
    }
    task.addEventListener("mousemove", dragHandler = () => {
        taskDragger(currentPosition);
    });
    // task.addEventListener("mouseleave", () => {
    //     taskDropper(event, task);
    //     task.removeEventListener("mousemove", dragHandler);
    // }, { once: true });
    document.addEventListener("mouseup", () => {
        taskDropper(event, task);
        task.removeEventListener("mousemove", dragHandler);
    }, { once: true });
}

const taskDragger = throttle(({ mouseX, mouseY, currentX, currentY  }) => {
    event.currentTarget.style.setProperty('--x', currentX + event.pageX - mouseX);
    event.currentTarget.style.setProperty('--y', currentY + event.pageY - mouseY);
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

const taskDropper = ({pageX, pageY}, task) => {
    $$('#tasks > div').for(taskWrapper => {
        const { x, y, width, height } = taskWrapper.getBoundingClientRect();
        if (x < pageX && pageX < (x + width) &&
            y < pageY && pageY < (y + height)) {
                taskWrapper.classList.remove('placeholder');
                taskWrapper.append(task)
        }
    })
    task.classList.add('drop-transition');
    task.addEventListener("transitionend", () => {
        task.classList.remove('drop-transition');
        log("transition removed!")
    }, { once: true });
    task.style.setProperty('--x', '0');
    task.style.setProperty('--y', '0');
}