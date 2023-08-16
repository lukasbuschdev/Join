const editTaskTemplate = ({title, description, priority, dueDate, assignedTo, subTasks}) => {
    return /*html*/`
    <button onclick="this.closest('dialog').closeModal()" class="close-btn grid-center">
        <img class="close" src="/Join/assets/img/icons/close_blue.svg" alt="Close">
    </button>
    <div class="fullscreen-content column gap-25 shadow-container" data-shadow="ud/white/40px">
        <div class="column gap-8">
            <span data-lang="title">Title</span>
            <textarea name="title" id="title" placeholder="Enter a title" data-lang-placeholder="title-placeholder">${title}</textarea>
        </div>

        <div class="column gap-8">
            <span data-lang="description">Description</span>
            <textarea name="description" id="description" placeholder="Enter a description" data-lang-placeholder="description-placeholder">${description}</textarea>
        </div>

        <div class="column gap-8">
            <span data-lang="due-date">Due date</span>
            <textarea name="date" id="date" class="padding-textarea" placeholder="dd/mm/yyyy" data-lang-placeholder="due-date-placeholder">${dueDate}</textarea>
        </div>

        <div class="column gap-8">
            <span data-lang="priority"></span>
            <div class="btn-priority" type="menu">
                <button class="btn btn-secondary prio-btn txt-normal${(priority == "urgent")?' active':''}" type="option"><span class="priority" data-lang="urgent" style="--prio_icon: url(/Join/assets/img/icons/prio_urgent.svg)"></span></button>
                <button class="btn btn-secondary prio-btn txt-normal${(priority == "medium")?' active':''}" type="option"><span class="priority" data-lang="medium" style="--prio_icon: url(/Join/assets/img/icons/prio_medium.svg)"></span></button>
                <button class="btn btn-secondary prio-btn txt-normal${(priority == "low")?' active':''}" type="option"><span class="priority" data-lang="low" style="--prio_icon: url(/Join/assets/img/icons/prio_low.svg)"></span></button>
            </div>
        </div>

        <div class="drp">
            <span data-lang="assigned-to">Assigned to</span>
            <div class="drp-wrapper">
                <div data-lang="select-contacts-to-asign" class="drp-title" onclick="this.toggleDropDown()">Select contacts to assign</div>
                <div class="drp-option-wrapper" id="drp-collaborators" data-shadow="ud/white/10px">
                    <div class="drp-contacts" id="drp-collab-container">
                    </div>
                </div>
            </div>
            ${fullscreenTaskAssignedTo(assignedTo)}
        </div>

        <div class="subtasks column gap-8">
            <span data-lang="subtasks">Subtasks</span>
            <textarea name="add-subtask" id="add-subtask" class="padding-textarea"></textarea>
            <div class="row">
                <input type="checkbox" id="subtask" name="subtask" value="subtask">
                <label data-lang="subtask1" for="subtask">Subtask 1</label>
            </div>
        </div>

    </div>
    <div class="btn-container gap-20">
        <button class="btn btn-secondary btn-cancel txt-700 txt-normal" onclick="toggleFullscreenState()">
            <span data-lang="btn-cancel">Cancel</span>
        </button>
        <button id="save-task" class="btn btn-primary btn-check txt-700 txt-normal">
            <span>OK</span>
        </button>
    </div>
    `
}