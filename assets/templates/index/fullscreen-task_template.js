import { STORAGE } from "../../../js/storage.js";

export const fullscreenTaskTemplate = ({id, category, title, description, priority, dueDate, assignedTo, subTasks, boardId}) => {
    const [categoryName = "Default",  categoryColor = "#d1d1d1"] = Object.entries(STORAGE.currentUserBoards[boardId].categories)?.find(([key]) => key == category) ?? [];
    return /*html*/`
    <div class="fullscreen-content">
        <button onclick="this.closest('dialog').closeModal()" class="close-btn grid-center">
            <img class="close" src="/Join/assets/img/icons/close_blue.svg" alt="Close">
        </button>
        <div class="fullscreen-task-wrapper column gap-25">
            <div class="task-category txt-normal" style="--clr: ${categoryColor}">${categoryName}</div>
            <h2>${title}</h2>
            <div>${description}</div>
            <div class="row gap-25">
                <span class="fullscreen-task-label">Due date: </span>
                <span>${dueDate}</span>
            </div>
            <div class="row gap-25">
                <span class="fullscreen-task-label">Priority: </span>
                <span class="priority row gap-10" style="--prio_icon: url(/Join/assets/img/icons/prio_${priority}.svg)">${priority.replace(/^\w/, letter => letter.toUpperCase())}</span>
            </div>
            <div class="fullscreen-task-assignedTo column gap-8">
                <span class="fullscreen-task-label">Assigned To: </span>
                <div>${fullscreenTaskAssignedTo(assignedTo)}</div>
            </div>
            
            <div class="fullscreen-task-subTasks column gap-8">
                <span class="fullscreen-task-label">Subtasks: </span>
                <div class="column gap-5">${fullscreenTaskSubTasks(subTasks)}</div>
            </div>
        </div>
    </div>
    <div class="btn-container txt-small gap-8">
        <button class="row gap-8" data-lang="delete" onclick="deleteTask()">Delete</button>
        <div class="line"></div>
        <button class="row gap-8" onclick="editTaskInitializer(${id})" data-lang="edit">Edit</button>
    </div>
    `
};

export const fullscreenTaskAssignedTo = (assignedTo) => {
    const assignedUsers = Object.values(STORAGE.allUsers).filter(({id}) => assignedTo.includes(id));
    return assignedUsers.reduce(
        (template, {name, color}) => template += /*html*/`
            <div class="assigned-to-contact row gap-15">
                <div class="user-img-container grid-center" style="--user-clr: ${color}; --outline-thickness: 0px;">
                    <span>${name.slice(0, 2).toUpperCase()}</span>
                </div>
                <div class="row gap-8">
                    <span>${name}</span>${(name === STORAGE.currentUser.name) ? '<span data-lang="assigned-you-parentheses"></span>' : ''}
                </div>
            </div>
        `
    , '');
};

export const fullscreenTaskSubTasks = (subTasks) => {
    if (!subTasks.length) return '';
    return subTasks.reduce(
        (template, {name, done}) => template += /*html*/`
            <div class="fullscreen-subtask row gap-15">
                <input type="checkbox" data-done="'${done}'"${done == true ? 'checked' : ''} onchange="changeSubtaskDoneState('${name}')">
                <span class="txt-small">${name}</span>
            </div>
        `
    , '');
};