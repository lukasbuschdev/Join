const editTaskTemplate = ({title, description, priority, dueDate, assignedTo, subTasks}) => {
    subtasks.length = 0;
    subTasks.for(({name}) => subtasks.push(name));
    selectedCollaborators.length = 0;
    assignedTo.for(id => selectedCollaborators.push(id));
    return /*html*/`
    <button onclick="this.closest('dialog').closeModal()" class="close-btn grid-center">
        <img class="close" src="/Join/assets/img/icons/close_blue.svg" alt="Close">
    </button>
    <div class="fullscreen-content column gap-25 shadow-container" data-shadow="ud/white/40px">
        <div class="column gap-8">
            <span data-lang="title">Title</span>
            <textarea name="title" id="title" placeholder="Enter a title" data-lang-placeholder="title-placeholder">${title}</textarea>
            <div class="error-container-relative">
                <span class="error-inactive error-enter-input" data-lang="enter-a-title" id="enter-a-title">Enter a title!</span>
                <span class="error-inactive error-enter-input" data-lang="use-letters-only" id="title-letters-only">Please use letters only!</span>
                <span class="error-inactive error-enter-input" data-lang="title-too-long" id="title-too-long">Title too long!</span>
            </div>
        </div>

        <div class="column gap-8">
            <span data-lang="description">Description</span>
            <textarea name="description" id="description" placeholder="Enter a description" data-lang-placeholder="description-placeholder">${description}</textarea>
            <div class="error-container-relative">
                <span class="error-inactive error-enter-input" data-lang="enter-a-description" id="enter-a-description">Enter a description</span>
                <span class="error-inactive error-enter-input" data-lang="use-letters-only" id="description-letters-only">Please use letters only!</span>
            </div>
        </div>

        <div id="calender" class="column gap-8">
            <span data-lang="due-date">Due date</span>
            <textarea name="date" id="date" class="padding-textarea" placeholder="dd/mm/yyyy" data-lang-placeholder="due-date-placeholder">${dueDate}</textarea>
            <div class="error-inactive error-enter-input" id="enter-a-dueDate">
                <span data-lang="enter-a-dueDate">Enter a due date!</span>
            </div>
            <div class="error-inactive error-enter-input" id="wrong-date-format">
                <span data-lang="wrong-date-format">Wrong format!</span>
            </div>
        </div>

        <div id="priority" class="column gap-8">
            <span data-lang="priority">Prio</span>
            <div class="btn-priority" type="menu">
                <button class="btn btn-secondary prio-btn txt-normal ${(priority == 'urgent')?'active':''}" type="option"><span data-lang="urgent" class="priority" style="--prio_icon: url(/Join/assets/img/icons/prio_urgent.svg)">Urgent</span></button>
                <button class="btn btn-secondary prio-btn txt-normal ${(priority == 'medium')?'active':''}" type="option"><span data-lang="medium" class="priority" style="--prio_icon: url(/Join/assets/img/icons/prio_medium.svg)">Medium</span></button>
                <button class="btn btn-secondary prio-btn txt-normal ${(priority == 'low')?'active':''}" type="option"><span data-lang="low" class="priority" style="--prio_icon: url(/Join/assets/img/icons/prio_low.svg)">Low</span></button>
            </div>
            <div class="error-inactive error-enter-input" id="select-a-priority">
                <span data-lang="select-a-priority">Select a priority!</span>
            </div>
        </div>

        <div class="drp gap-8">
            <span data-lang="assigned-to">Assigned to</span>
            <div class="drp-wrapper" id="drp-wrapper-collaborator">
                <div id="selected-collaborator-input" data-lang="select-collaborators" class="drp-title" onclick="this.toggleDropDown()"></div>
                <div class="drp-option-wrapper" id="drp-collaborators" data-shadow="ud/white/10px">
                    <div class="drp-contacts shadow-container" id="drp-collab-container">
                        ${""}
                    </div>
                </div>
            </div>
            <div class="error-inactive error-enter-input" id="select-a-collaborator">
                <span data-lang="select-a-collaborator">Select a collaborator!</span>
            </div>
        </div>

        <div class="subtasks column gap-8">
            <span data-lang="subtasks">Subtasks</span>
            <div class="inp-wrapper column gap-10" id="add-subtask">
                <div class="inp-container radius-10">
                    <input oninput="checkSubtaskInput()" type="text" name="" id="subtask-input" data-lang-placeholder="add-subtask">
                    <div class="d-none inp-buttons row gap-10">
                        <button onclick="clearSubtaskInput()">
                            <img src="/Join/assets/img/icons/close.svg" width="20">
                        </button>
                        <div class="vertical-line"></div>
                        <button onclick="addSubtask()">
                            <img src="/Join/assets/img/icons/check_black.svg" width="20">
                        </button>
                    </div>
                </div>
                <div class="d-none error-container-relative" id="error-container">
                    <span class="error-inactive error-enter-input" data-lang="use-letters-only" id="subtask-letters-only">Please use letters only!</span>
                    <span class="error-inactive error-enter-input" data-lang="subtask-too-long" id="subtask-too-long">Subtask too long!</span>
                </div>
            </div>
            <div id="subtask-container" class="column">${allSubtasksTemplate()}</div>
        </div>

    </div>
    <div class="btn-container gap-20">
        <button class="btn btn-secondary btn-cancel txt-700 txt-normal" onclick="toggleFullscreenState()">
            <span data-lang="btn-cancel">Cancel</span>
        </button>
        <button id="save-task" class="btn btn-primary btn-check txt-700 txt-normal" onclick="confirmation('save-edited-task', saveEditedTask)">
            <span>OK</span>
        </button>
    </div>
    `
}

const editTaskAssignedTo = () => selectedCollaborators.reduce((template, id) => template += userIconTemplate(id), ``);

const userIconTemplate = (id) => {
    const {name, img, color} = ALL_USERS[id];
    return /*html*/`<div class="input-collaborator user-img-container grid-center" style="--user-clr: ${color}">
        <span>${name.slice(0, 2).toUpperCase()}</span>
        <img src="${img}">
    </div>`
}

const allSubtasksTemplate = () => subtasks
    .reduce(
        (template, name, index) => {
            template += renderSubtaskTemplate(name, index);
            return template;
        }, ''
    );