import { STORAGE } from "../../../js/storage.js";
import { STATE } from "../../../js/state.js";
import { renderSubtaskTemplate } from "./add_task_templates.js";
import { getInitialsOfName } from "../../../js/utilities.js";
import { LANG } from "../../../js/language.js";
import { subtasks } from "../../../index/add_task/add_task.js";

export const editTaskTemplate = ({ title, description, priority, dueDate, assignedTo, subTasks }) => {
    subtasks.length = 0;
    subtasks.push(...subTasks.map(({ name }) => name));
	return /*html*/ `
    <div class="fullscreen-content column gap-25">
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
                <button class="btn btn-secondary prio-btn txt-normal ${
					priority == "urgent" ? "active" : ""
				}" type="option"><span data-lang="urgent" class="priority" style="--prio_icon: url(/Join/assets/img/icons/prio_urgent.svg)">Urgent</span></button>
                <button class="btn btn-secondary prio-btn txt-normal ${
					priority == "medium" ? "active" : ""
				}" type="option"><span data-lang="medium" class="priority" style="--prio_icon: url(/Join/assets/img/icons/prio_medium.svg)">Medium</span></button>
                <button class="btn btn-secondary prio-btn txt-normal ${
					priority == "low" ? "active" : ""
				}" type="option"><span data-lang="low" class="priority" style="--prio_icon: url(/Join/assets/img/icons/prio_low.svg)">Low</span></button>
            </div>
            <div class="error-inactive error-enter-input" id="select-a-priority">
                <span data-lang="select-a-priority">Select a priority!</span>
            </div>
        </div>

        <div class="drp gap-8">
            <span data-lang="assigned-to">Assigned to</span>
            <div class="drp-wrapper" id="drp-wrapper-collaborator">
                <div id="selected-collaborator-input" data-lang="select-collaborators" class="drp-title" onclick="this.toggleDropDown()"></div>
                <div class="drp-option-wrapper" id="drp-collaborators">
                    <div class="drp-contacts" id="drp-collab-container">
                        ${editTaskAssignedTo(assignedTo)}
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
                    <div class="inp-buttons row gap-10">
                        <button onclick="this.parentElement.previousElementSibling.value = ''">
                            <img src="/Join/assets/img/icons/close.svg" width="20">
                        </button>
                        <div class="vertical-line"></div>
                        <button onclick="addEditSubtask()">
                            <img src="/Join/assets/img/icons/check_black.svg" width="20">
                        </button>
                    </div>
                </div>
                <div class="d-none error-container-relative" id="error-container">
                    <span class="error-inactive error-enter-input" data-lang="use-letters-only" id="subtask-letters-only">Please use letters only!</span>
                    <span class="error-inactive error-enter-input" data-lang="subtask-too-long" id="subtask-too-long">Subtask too long!</span>
                </div>
            </div>
            <div id="subtask-container" class="column">${allSubtasksTemplate(subtasks)}</div>
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
    `;
};

export function editTaskAssignedTo(assignedTo) {
	return STATE.selectedBoard.collaborators.reduce(
		(template, id) => `${template}${collaboratorTemplate(id, assignedTo)}`,
		``
	);
}

export const collaboratorTemplate = (id, assignedTo) => {
	const { name, img, color } = STORAGE.allUsers[id];
	const collaboratorIsAssigned = assignedTo.includes(id);
	return /*html*/ `
    <div data-id="${id}" class="drp-option ${
		collaboratorIsAssigned ? "active" : ""
	}" onclick="selectCollaborator()">
        <div class="user-img-container grid-center" style="--user-clr: ${color}">
            <span>${getInitialsOfName(name)}</span>
            <img src="${img}">
        </div>
        <span>${name}</span>
    </div>`;
};

export const allSubtasksTemplate = (subTasks) => {
	return subTasks.reduce((template, name, index) => {
		template += renderSubtaskTemplate(name, index);
		return template;
	}, "");
}

export function addEditSubtask() {
	const letterRegex = /^[A-Za-zäöüßÄÖÜ\-\/_' "0-9]+$/;
	const subtaskInput = $("#edit-task #subtask-input");

	if (!letterRegex.test(subtaskInput.value)) {
		subtaskInvalidEdit();
	} else if (subtaskInput.value.length > 30) {
		subtaskTooLongEdit();
	} else {
		subtaskValidEdit();
		subtasks.push(subtaskInput.value)
		subtaskInput.value = "";
	}
	renderEditSubtasks();
}

export function subtaskInvalidEdit() {
	$("#edit-task #error-container").classList.remove("d-none");
	$("#edit-task #subtask-letters-only").classList.remove("error-inactive");
	$("#edit-task #add-subtask").classList.add("input-warning");
}

export function subtaskTooLongEdit() {
	$("#edit-task #error-container").classList.remove("d-none");
	$("#edit-task #add-subtask").classList.add("input-warning");
	$("#edit-task #subtask-letters-only").classList.add("error-inactive");
	$("#edit-task #subtask-too-long").classList.remove("error-inactive");
}

export function subtaskValidEdit() {
	$("#edit-task #subtask-letters-only").classList.add("error-inactive");
	$("#edit-task #subtask-too-long").classList.add("error-inactive");
	$("#edit-task #add-subtask").classList.remove("input-warning");
	$("#edit-task #error-container").classList.add("d-none");
}

export function renderEditSubtasks() {
	$("#edit-task #subtask-container").innerHTML = allSubtasksTemplate(subtasks);
}

export function editSubtaskEdit(i) {
	const subtaskInput = event.currentTarget.parentElement.previousElementSibling;
	const range = document.createRange();
	const selection = window.getSelection();
	subtaskInput.focus();
	subtaskInput.setAttribute("contenteditable", "true");

	$("#edit-task #single-subtask" + i).classList.toggle("edit-btn-active");
	$("#edit-task .subtask-edit-btn" + i).classList.toggle("d-none");
	$("#edit-task .save-edited-subtask-btn" + i).classList.toggle("d-none");

	range.selectNodeContents(subtaskInput);
	range.collapse(false);

	selection.removeAllRanges();
	selection.addRange(range);
}

export function saveEditedSubtaskEdit(i) {
	const subtaskInput = event.currentTarget.parentElement.previousElementSibling;
	subTasks[i] = subtaskInput.innerText;
	subtaskInput.setAttribute("contenteditable", "false");

	const allSaveButtons = $$("#edit-task .save-edited-subtask-btn");

	allSaveButtons.for((button) => {
		button.classList.toggle("d-none");
	});

	$("#edit-task #single-subtask" + i).classList.toggle("edit-btn-active");
	$("#edit-task .subtask-edit-btn" + i).classList.toggle("d-none");
	$("#edit-task .save-edited-subtask-btn" + i).classList.toggle("d-none");
}
