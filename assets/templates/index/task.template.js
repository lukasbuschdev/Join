const taskTemplate = ({boardId, id, title, description, assignedTo, category, color, priority, subTasks}) => {
    let assignedAccounts = [];
    for (const assignedToId of assignedTo) {
        const {name, color: userColor} = CONTACTS[assignedToId] ?? USER;
        assignedAccounts.push({name, color: userColor});
    }    
    return /*html*/`
    <div class="task txt-small" onmousedown="addDragAndDrop()" data-id="${boardId}/${id}" style="--x: 0; --y: 0;">
        <div class="task-category" style="--clr: ${color};">${category}</div>
        <div class="task-title txt-700">${title}</div>
        <div class="task-description">${description}</div>
        ${progressTemplate(subTasks)}
        <div class="task-footer">
            <div class="task-assigned-to">
                ${assignedToTemplate(assignedAccounts)}
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

const assignedToTemplate = (assignedAccounts) => {
    let template = '';
    for (let i = 0; i < assignedAccounts.length; i++){
        const {color, name} = assignedAccounts[i];
        template += `<div class="task-assigned-to"><div style="--user-clr: ${(color !== "") ? color : '#D1D1D1'};">${name.slice(0, 2).toUpperCase()}</div></div>`
        if (assignedAccounts.length > 3 && i == 1) {
            template += `<div class="task-assigned-to"><div style="--user-clr: var(--clr-dark);">+${assignedAccounts.length - 2}</div></div>`;
            break;
        };
    }
    return template
}