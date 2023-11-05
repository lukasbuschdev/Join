const taskTemplate = ({boardId, id, title, description, assignedTo, category, priority, subTasks}, filter) => {
    const assignedAccounts = assignedTo.reduce((total, assignedToId) => {
        const {name, color: userColor} = CONTACTS[assignedToId] ?? USER;
        total.push({name, color: userColor});
        return total;
    }, []); 
    return /*html*/`
    <div class="task txt-small" onpointerdown="addDragAndDrop()" data-id="${boardId}/${id}" style="--x: 0; --y: 0;">
        <div class="task-category" style="--clr: ${BOARDS[boardId].categories[category] ?? "#d1d1d1"};">${Object.keys(SELECTED_BOARD.categories).find(cat => cat == category) ?? "Default"}</div>
        <div class="task-title txt-700">${highlight(title, filter)}</div>
        <div class="task-description">${highlight(description, filter)}</div>
        ${progressTemplate(subTasks)}
        <div class="task-footer">
            <div class="task-assigned-to">
                ${assignedToTemplate(assignedAccounts)}
            </div>
            <div class="task-priority" data-priority="${priority}" style="--priority: url(/Join/assets/img/icons/prio_${priority}.svg)"></div>
        </div>
    </div>`
}

const highlight = (string, filter) => string.replaceAll(filter, item => `<span class="highlight">${item}</span>`);

const progressTemplate =  (subTasks) => {
    const finishedSubtasks = subTasks.filter( ({done}) => done);
    const progress = (finishedSubtasks == false) ? 0 : Math.roundTo(finishedSubtasks.length / subTasks.length, 2);
    return (subTasks.length == 0) ? '' :
    /*html*/`
    <div class="column gap-5 txt-tiny">
        <span data-lang="subtasks" style="margin-left: auto;"></span>
        <div class="task-progress">
            <div class="task-progress-bar" style="--progress: ${progress}"></div>
            <div class="task-progress-counter">
                <span>${finishedSubtasks.length} / ${subTasks.length}
                </span>
            </div>
        </div>
    </div>`
}

const assignedToTemplate = (assignedAccounts) => {
    let template = '';
    for (let i = 0; i < assignedAccounts.length; i++){
        const {color, name} = assignedAccounts[i];
        template += /*html*/`
            <div class="task-assigned-to">
                <div style="--user-clr: ${(color !== "") ? color : '#D1D1D1'};">${name.slice(0, 2).toUpperCase()}</div>
            </div>
        `;
        if (assignedAccounts.length > 3 && i == 1) {
            template += /*html*/`
                <div class="task-assigned-to">
                    <div style="--user-clr: var(--clr-dark);">+${assignedAccounts.length - 2}</div>
                </div>`;
            break;
        };
    }
    return template
}