const taskTemplate = async ({title, description, assignedTo, category, color, priority, subTasks}) => {
    let assignedAccounts = [];
    for await (const assignedToId of assignedTo) {
        const {name, color: userColor} = await REMOTE_getData(`users/${assignedToId}`);
        assignedAccounts.push(`<div style="--user-clr: ${userColor};">${name.slice(0, 2).toUpperCase()}</div>`);
    }
    assignedAccounts = assignedAccounts.join('');
    
    return /*html*/`
    <div class="task txt-small" onmousedown="addDragAndDrop()" style="--x: 0; --y: 0;">
        <div class="task-category" style="--clr: ${color};">${category}</div>
        <div class="task-title txt-700">${title}</div>
        <div class="task-description">${description}</div>
        ${progressTemplate(subTasks)}
        <div class="task-footer">
            <div class="task-assigned-to">
                ${assignedAccounts}
            </div>
            <div class="task-priority" data-priority="${priority}" style="--priority: url(../assets/img/icons/prio_${priority}.svg)"></div>
        </div>
    </div>`
}

const progressTemplate =  (subTasks) => {
    const finishedSubtasks = subTasks.filter( ({done}) => done);
    const progress = (finishedSubtasks == false) ? 0 : Math.roundTo(finishedSubtasks.length / subTasks.length, 2);
    return (subTasks.length == 0) ? '' :
    `<div class="task-progress txt-tiny">
        <div class="task-progress-bar" style="--progress: ${progress}"></div>
        <div class="task-progress-counter"><span>${finishedSubtasks.length} / ${subTasks.length}</span> Done</div>
    </div>`
}

const assignedToTemplate = (assignedToId) => {

}