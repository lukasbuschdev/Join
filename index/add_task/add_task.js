import { renderEditSubtasks } from "../../assets/templates/index/edit-task_template.js";
import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { LANG } from "../../js/language.js";
bindInlineFunctions(getContext(), [
	"/Join/index/index/index.js",
	"/Join/js/utilities.js",
	"/Join/js/language.js",
	"/Join/index/summary/summary.js"
]);

import { STORAGE } from "../../js/storage.js";
import { $, currentDirectory, dateFormat, notification } from "../../js/utilities.js";
import { STATE } from "../../js/state.js";
import { categoryTemplate, renderCollaboratorInput, renderCollaboratorsToAssign, renderSelfToAssign, renderSubtaskTemplate } from "../../assets/templates/index/add_task_templates.js";

const subtasks = [];
export const selectedCollaborators = [];
const letterRegex = /^[A-Za-zäöüßÄÖÜ\-\/_' "0-9]+$/;

/**
 * Initializes the Add Task UI.
 * If no boards are available, it exits early.
 */
export function initAddTask() {
	if (!Object.values(STORAGE.currentUserBoards).length) return;
	renderBoardIds();
	renderDate();
	$(".add-task-card").LANG_load();
	resetArrays();
	$(".add-task-card").classList.remove("d-none");
}

/**
 * Renders the available board IDs in the dropdown menu.
 */
export function renderBoardIds() {
	const drpContainer = $("#drp-board-container");
	drpContainer.innerHTML = "";
	Object.values(STORAGE.currentUserBoards).forEach((board) => {
		drpContainer.innerHTML += `<div class="drp-option" onclick="selectBoard(${board.id})">${board.name}</div>`;
	});
}

/**
 * Selects a board by its ID, updates the state, and renders related data.
 * @param {string} boardId - The ID of the board to select.
 */
export function selectBoard(boardId) {
	const selectedBoard = STORAGE.currentUserBoards[boardId];
	STATE.selectedBoard = selectedBoard;
	event.currentTarget.toggleDropDown();

	renderSelectedBoard(selectedBoard);
	renderCategories(selectedBoard);
	renderAssignToContacts();
}

/**
 * Renders the name of the selected board.
 * @param {Board} selectedBoard - The selected board object.
 */
export function renderSelectedBoard(selectedBoard) {
	$("#selected-board").innerText = selectedBoard.name;
}

/**
 * Checks if a board is selected and updates UI elements accordingly.
 */
export function checkSelectedBoard() {
	const isDefaultSelection =
		$("#selected-board").innerText === LANG.currentLangData["select-board"];
	$("#select-a-board").classList.toggle("error-inactive", !isDefaultSelection);
	$("#drp-wrapper-board").classList.toggle("input-warning", isDefaultSelection);
}

/**
 * Renders the list of collaborators to assign to the task.
 */
export function renderAssignToContacts() {
	const drpContainer = $("#drp-collab-container");
	const assignToUser = document.createElement("div");
	assignToUser.innerHTML = renderSelfToAssign();

	drpContainer.innerHTML = "";
	assignToUser.LANG_load();
	drpContainer.append(assignToUser.children[0]);

	STATE.selectedBoard.collaborators.forEach((collaboratorId) => {
		const collaborator = STORAGE.allUsers[collaboratorId];
		if (!collaborator || collaborator.id === STORAGE.currentUser.id) return;
		const collaboratorOption = document.createElement("div");
		collaboratorOption.innerHTML = renderCollaboratorsToAssign(collaborator);
		drpContainer.append(collaboratorOption.children[0]);
	});
	drpContainer.LANG_load();
}

/**
 * Toggles the selection of a collaborator and updates the UI.
 */
export function selectCollaborator() {
	event.currentTarget.classList.toggle("active");
	const collaboratorId = event.currentTarget.dataset.id;
	const index = selectedCollaborators.indexOf(collaboratorId.toString());

	index === -1 ? selectedCollaborators.push(collaboratorId.toString()) : selectedCollaborators.splice(index, 1);

	renderCollaboratorInput();
}

/**
 * Gets the title of the task from the input field and validates it.
 * @returns {string|undefined} - The task title if valid, otherwise undefined.
 */
export function getTitle() {
	const title = $("#title").value;
	if (title === "") {
		titleEmpty();
	} else if (!letterRegex.test(title)) {
		titleInvalid();
	} else if (title.length > 50) {
		titleTooLong();
	} else {
		titleValid();
		return title;
	}
}

/**
 * Shows an error message when the title is empty.
 */
export function titleEmpty() {
	$("#enter-a-title").classList.remove("error-inactive");
	$("#title").classList.add("input-warning");
	$("#title-too-long").classList.add("error-inactive");
}

/**
 * Shows an error message when the title contains invalid characters.
 */
export function titleInvalid() {
	$("#enter-a-title").classList.add("error-inactive");
	$("#title-letters-only").classList.remove("error-inactive");
	$("#title").classList.add("input-warning");
	$("#title-too-long").classList.add("error-inactive");
}

/**
 * Shows an error message when the title is too long.
 */
export function titleTooLong() {
	$("#title").classList.add("input-warning");
	$("#title-letters-only").classList.add("error-inactive");
	$("#enter-a-title").classList.add("error-inactive");
	$("#title-too-long").classList.remove("error-inactive");
}

/**
 * Validates the title input.
 */
export function titleValid() {
	$("#enter-a-title").classList.add("error-inactive");
	$("#title-letters-only").classList.add("error-inactive");
	$("#title-too-long").classList.add("error-inactive");
	$("#title").classList.remove("input-warning");
}

/**
 * Gets the description of the task from the input field and validates it.
 * @returns {string|undefined} - The task description if valid, otherwise undefined.
 */
export function getDescription() {
	const description = $("#description").value;
	const letterRegexDescription = /^[A-Za-zäöüßÄÖÜ\-\/\_\'\.\, \!\?"0-9\n;:()\[\]]*$/g;
	if (description === "") {
		descriptionEmpty();
	} else if (!letterRegexDescription.test(description)) {
		descriptionInvalid();
	} else {
		descriptionValid();
		return description;
	}
}

/**
 * Shows an error message when the description is empty.
 */
export function descriptionEmpty() {
	$("#enter-a-description").classList.remove("error-inactive");
	$("#description").classList.add("input-warning");
}

/**
 * Shows an error message when the description contains invalid characters.
 */
export function descriptionInvalid() {
	$("#enter-a-description").classList.add("error-inactive");
	$("#description").classList.add("input-warning");
	$("#description-letters-only").classList.remove("error-inactive");
}

/**
 * Validates the description input.
 */
export function descriptionValid() {
	$("#description-letters-only").classList.add("error-inactive");
	$("#enter-a-description").classList.add("error-inactive");
	$("#description").classList.remove("input-warning");
}

/**
 * Renders the categories of the selected board in the dropdown menu.
 * @param {Board} selectedBoard - The selected board object containing categories.
 */
export function renderCategories(selectedBoard) {
	const drpContainer = $("#drp-categories");
	drpContainer.innerHTML = "";

	Object.entries(selectedBoard.categories).forEach((category) => (drpContainer.innerHTML += categoryTemplate(category)));
}

/**
 * Renders the selected category.
 * @param {string} category - The selected category.
 */
export function renderSelectedCategory(category) {
	event.currentTarget.toggleDropDown();
	$("#select-task-category").innerHTML = category;
}

/**
 * Gets the selected category.
 * @returns {string} - The selected category.
 */
export function getSelectedCategory() {
	return $("#select-task-category").innerText;
}

/**
 * Formats the current date as DD/MM/YYYY.
 * @returns {string} - The formatted date.
 */
export function getFormattedDate() {
	const today = new Date();
	const day = String(today.getDate()).padStart(2, "0");
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const year = today.getFullYear();

	return `${day}/${month}/${year}`;
}

/**
 * Renders the current date in the date input field.
 */
export function renderDate() {
	$("#date").value = getFormattedDate();
}

/**
 * Gets the due date of the task from the input field and validates it.
 * @returns {string|undefined} - The due date if valid, otherwise undefined.
 */
export function getDueDate() {
	const dateString = $("#date").value;
	if (dateString == "") return dateEmpty();
	if (!dateFormat(dateString)) {
		dateWrongFormat();
	} else if (dateFormat(dateString)) {
		dateValid();
		return dateString;
	}
}

/**
 * Shows an error message when the due date is empty.
 */
export function dateEmpty() {
	$("#enter-a-dueDate").classList.remove("error-inactive");
	$("#date").classList.add("input-warning");
}

/**
 * Shows an error message when the due date format is incorrect.
 */
export function dateWrongFormat() {
	$("#enter-a-dueDate").classList.add("error-inactive");
	$("#date").classList.add("input-warning");
	$("#wrong-date-format").classList.remove("error-inactive");
}

/**
 * Validates the due date input.
 */
export function dateValid() {
	$("#enter-a-dueDate").classList.add("error-inactive");
	$("#date").classList.remove("input-warning");
	$("#wrong-date-format").classList.add("error-inactive");
}

/**
 * Checks the selected priority and returns its value.
 * @returns {string|undefined} - The selected priority or undefined if not selected.
 */
export function checkPriority() {
	const activeButton = $(".btn-priority button.active");

	$("#select-a-priority").classList.toggle("error-inactive", activeButton);
	return activeButton?.$(".priority").dataset.lang;
}

/**
 * Gets the subtasks of the task.
 * @returns {Array} - An array of new subtasks.
 */
export function getSubtasks() {
	return subtasks.map((subtaskName) => ({ name: subtaskName, done: false }));
}

/**
 * Adds a new task with the provided details and reloads page.
 * retuns early on erronious input
 */
export async function addTask() {
	const dir = currentDirectory();
	checkSelectedBoard();

	const taskData = {
		selectedBoard: STATE.selectedBoard,
		title: getTitle(),
		description: getDescription(),
		category: getSelectedCategory(),
		selectedCollaborators,
		dueDate: getDueDate(),
		priority: checkPriority(),
		subtasks: getSubtasks()
	};

	if (checkAddTaskInputs(Object.values(taskData))) return;

	await createNewTask(taskData);

	notification("task-created");
	resetArrays();

	dir === "board" ? location.reload() : $("#board").click();
}

/**
 * Checks if any task input fields are invalid.
 * @param {Array} addTaskData - Array of task input fields.
 * @returns {boolean} - True if any input field is invalid, otherwise false.
 */
export function checkAddTaskInputs(addTaskData) {
	return addTaskData.some((singleInputField) => singleInputField === undefined);
}

/**
 * Creates a new task and adds it to the selected board.
 * @param {Object} taskData - The task data to add.
 */
export async function createNewTask({ selectedBoard, title, description, category, selectedCollaborators, dueDate, priority, subTasks }) {
	const newTask = { title, description, category, assignedTo: selectedCollaborators, dueDate, priority, subTasks };
	return selectedBoard.addTask(newTask);
}

/**
 * Clears the subtask input field.
 */
export function clearSubtaskInput() {
	$(".subtasks input").value = "";
}

/**
 * Toggles the visibility of subtask input buttons based on input.
 */
export function checkSubtaskInput() {
	$(".subtasks .inp-buttons").classList.toggle("d-none", $(".subtasks input").value.length === 0);
}

/**
 * Adds a subtask to the task or throws the appropiate error messages.
 * renders subtasks
 */
export function addSubtask() {
	const subtaskValue = $(".subtasks input");

	if (!letterRegex.test(subtaskValue.value)) subtaskInvalid();
	else if (subtaskValue.value.length > 30) subtaskTooLong();
	else {
		subtaskValid();
		subtasks.push(subtaskValue.value);
		subtaskValue.value = "";
	}
	$(".subtasks .inp-buttons").classList.add("d-none");
	renderSubtasks();
}

/**
 * Shows an error message when the subtask contains invalid characters.
 */
export function subtaskInvalid() {
	$("#error-container").classList.remove("d-none");
	$("#subtask-letters-only").classList.remove("error-inactive");
	$("#add-subtask").classList.add("input-warning");
}

/**
 * Shows an error message when the subtask is too long.
 */
export function subtaskTooLong() {
	$("#error-container").classList.remove("d-none");
	$("#add-subtask").classList.add("input-warning");
	$("#subtask-letters-only").classList.add("error-inactive");
	$("#subtask-too-long").classList.remove("error-inactive");
}

/**
 * Validates the subtask input.
 */
export function subtaskValid() {
	$("#subtask-letters-only").classList.add("error-inactive");
	$("#subtask-too-long").classList.add("error-inactive");
	$("#add-subtask").classList.remove("input-warning");
	$("#error-container").classList.add("d-none");
}

/**
 * Renders the list of subtasks.
 */
export function renderSubtasks() {
	const subtaskContainer = $("#subtask-container");
	subtaskContainer.innerHTML = "";

	for (let i = 0; i < subtasks.length; i++) {
		const subtask = subtasks[i];
		subtaskContainer.innerHTML += renderSubtaskTemplate(subtask, i);
	}
}

/**
 * Enables editing of a subtask.
 * Can only be used on HTML element.
 * @param {number} i - The index of the subtask to edit.
 */
export function editSubtask(i) {
	const subtaskInput = event.currentTarget.parentElement.previousElementSibling;
	const range = document.createRange();
	const selection = window.getSelection();
	subtaskInput.focus();
	subtaskInput.setAttribute("contenteditable", "true");

	$("#single-subtask" + i).classList.toggle("edit-btn-active");
	$(".subtask-edit-btn" + i).classList.toggle("d-none");
	$(".save-edited-subtask-btn" + i).classList.toggle("d-none");

	range.selectNodeContents(subtaskInput);
	range.collapse(false);

	selection.removeAllRanges();
	selection.addRange(range);
}

/**
 * Saves the edited subtask and updates UI.
 * @param {number} i - The index of the subtask to save.
 */
export function saveEditedSubtask(i) {
	const subtaskInput = event.currentTarget.parentElement.previousElementSibling;
	subtasks[i] = subtaskInput.innerText;
	subtaskInput.setAttribute("contenteditable", "false");

	$$(`.save-edited-subtask-btn, .save-edited-subtask-btn${i}, .subtask-edit-btn${i}`).forEach((button) => button.classList.toggle("d-none"));
	$("#single-subtask" + i).classList.toggle("edit-btn-active");
}

/**
 * Deletes a subtask and updates UI.
 * @param {number} i - The index of the subtask to delete.
 */
export function deleteSubtask(i) {
	const isInEditTask = event.currentTarget.closest("#edit-task");

	(isInEditTask ? STATE.selectedTask.subTasks : subtasks).splice(i, 1);
	isInEditTask ? renderEditSubtasks() : renderSubtasks();
}

/**
 * Resets the selected collaborators and subtasks arrays.
 */
export function resetArrays() {
	selectedCollaborators.length = 0;
	subtasks.length = 0;
}

/**
 * Resets the priority button states.
 */
export function resetPriorityButton() {
	$$(".btn-priority button").forEach((button) => button.classList.remove("active"));
}