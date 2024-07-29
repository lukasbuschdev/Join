import { bindInlineFunctions, getContext } from "../../js/setup.js";
bindInlineFunctions(getContext(), [
	"/Join/js/dragAndDrop.js",
	"/Join/index/index/index.js",
	"/Join/assets/templates/index/confirmation_template.js",
	"/Join/js/utilities.js",
	"/Join/index/add_task/add_task.js",
	"/Join/js/storage.js",
	"/Join/js/language.js",
	"/Join/assets/templates/index/edit-task_template.js",
	"/Join/index/summary/summary.js"
]);
import { STORAGE } from "../../js/storage.js";
import {
	$,
	confirmation,
	debounce,
	notification,
	currentUserId,
	isEqual,
	cloneDeep,
	$$
} from "../../js/utilities.js";
import { renderBoardTitleSelection } from "../summary/summary.js";
import {
	assignedToTemplate,
	progressTemplate,
	taskTemplate
} from "../../assets/templates/index/task_template.js";
import { fullscreenTaskTemplate } from "../../assets/templates/index/fullscreen-task_template.js";
import { editTaskTemplate } from "../../assets/templates/index/edit-task_template.js";
import { renderBoardIds, renderDate, selectedCollaborators } from "../add_task/add_task.js";
import { STATE } from "../../js/state.js";
import { renderCollaboratorInput } from "../../assets/templates/index/add_task_templates.js";
import { Task } from "../../js/task.class.js";

/**
 * Initializes the board by rendering the board title selection and tasks if there are boards available.
 * @async
 * @returns {Promise<void>} Resolves when the initialization is complete.
 */
export async function initBoard() {
	if (!STORAGE.currentUser.boards.length) return;
	renderBoardTitleSelection();
	renderTasks();
	$("#tasks").classList.remove("d-none");
}

/**
 * Renders tasks on the board with an optional filter.
 * @async
 * @param {string} [filter] - Optional filter string to filter tasks by title or description.
 * @returns {Promise<void>} Resolves when the tasks are rendered.
 */
async function renderTasks(filter) {
	const { tasks, name } = STATE.selectedBoard;

	const boardHeader = $("#board-header h2");
	delete boardHeader.dataset.lang;
	boardHeader.innerText = name;

	if (!Object.values(tasks).length) return;
	const tasksContainer = $("#tasks");

	tasksContainer
		.$$(":scope > div > div:last-child")
		.forEach((container) => (container.innerHTML = ""));
	const filteredTasks = filter
		? Object.values(tasks).filter(
				(task) =>
					task.title.toLowerCase().includes(filter.toLowerCase()) ||
					task.description.toLowerCase().includes(filter.toLowerCase())
		  )
		: Object.values(tasks);
	filteredTasks
		.toReversed()
		.forEach((task) => ($(`#${task.type}`).innerHTML += getTaskTemplate(task, filter)));
	await tasksContainer.LANG_load();
}

/**
 * sets up task parameters and returns a template to be rendered.
 * @param {Task} task
 * @param {string} filter
 * @returns {string} the task template
 */
export function getTaskTemplate(task, filter) {
	const assignedAccounts = task.assignedTo.reduce((total, assignedToId) => {
		const { name, color } =
			assignedToId === STORAGE.currentUser.id
				? STORAGE.currentUser
				: STORAGE.allUsers[assignedToId];
		return [...total, { name, color }];
	}, []);
	const categoryString = Object.keys(STORAGE.currentUserBoards[task.boardId].categories).find(
		(cat) => cat === task.category
	);
	return taskTemplate(task, assignedAccounts, categoryString, filter);
}

/**
 * Searches tasks based on the input value and renders the filtered tasks.
 */
export const searchTasks = debounce(() => {
	const searchInput = $("#search-task input").value;
	renderTasks(searchInput);
}, 200);

/**
 * Focuses the search input field.
 */
export function focusInput() {
	$("#search-task input").focus();
}

/**
 * Clears the search input and renders all tasks.
 */
export function clearTaskSearch() {
	$("#search-task input").value = "";
	renderTasks();
}

/**
 * Opens the modal for adding a new task and renders necessary data.
 * @async
 * @returns {Promise<void>} Resolves when the modal is opened.
 */
export async function addTaskModal() {
	renderBoardIds();
	renderDate();
	const modal = $("#add-task-modal");
	modal.$(".add-task-card").classList.remove("d-none");
	modal.openModal();
}

/**
 * Renders the fullscreen task modal with the selected task's data.
 */
export function renderFullscreenTask(task) {
	if (event && event.which !== 1) return;
	const modal = $("#fullscreen-task-modal");
	const initialTask = cloneDeep(task);
	modal.$("#fullscreen-task").innerHTML = fullscreenTaskTemplate(task);
	modal.LANG_load();
	modal.openModal();
	modal.addEventListener("close", () => saveTaskChanges(initialTask), { once: true });
}

/**
 * Saves the edited task data from the fullscreen task modal.
 */
export function saveEditedTask() {
	const modal = $("#fullscreen-task-modal");
	const editedTaskData = {
		title: modal.$("#title").value,
		description: modal.$("#description").value,
		dueDate: modal.$("#date").value,
		priority: modal.$(".prio-btn.active span").dataset.lang,
		assignedTo: [...modal.$$("#drp-wrapper-collaborator .drp-option.active")].map(
			({ dataset }) => dataset.id
		),
		subTasks: [...$$("#edit-task #subtask-container li")].map(({ innerText: name }) => {
			return {
				name,
				done:
					STATE.selectedTask.subTasks.find(
						({ name: subTaskName }) => subTaskName === name
					)?.done || false
			};
		})
	};
	Object.assign(STATE.selectedTask, editedTaskData);
	Object.assign(
		STORAGE.data.boards[STATE.selectedBoard.id].tasks[STATE.selectedTask.id],
		editedTaskData
	);
	modal.closeModal();
	toggleFullscreenState();
}

/**
 * Saves the changes made to a task if there are any differences from the initial state.
 * @param {Task} initialTask - The initial state of the task.
 * @returns {Promise<void>|void} Resolves when the task changes are saved.
 */
function saveTaskChanges(initialTask) {
	const updatedTask = STATE.selectedTask;

	const differences = getJsonChanges(updatedTask, initialTask);
	if (Object.values(differences).length > 0) {
		updateTaskUi(differences, initialTask);
		return STATE.selectedTask.update();
	}
}

/**
 * Deletes the selected task after confirmation.
 * @returns {Promise<void>} Resolves when the task is deleted.
 */
export function deleteTask() {
	confirmation(`delete-task, {taskName: '${STATE.selectedTask.title}'}`, async () => {
		const { boardId, id, name } = STATE.selectedTask;
		const modal = $("#fullscreen-task-modal");
		const taskElement = $(`.task[data-id="${boardId}/${id}"]`);
		const taskContainer = taskElement.parentElement;
		await STORAGE.delete(`boards/${boardId}/tasks/${id}`);
		delete STORAGE.data.boards[boardId].tasks[id];
		modal.removeEventListener("close", saveTaskChanges, { once: true });
		modal.closeModal();
		taskElement.remove();
		taskContainer.innerHTML = taskContainer.innerHTML.trim();
		notification(`task-deleted, {taskName: '${name}'}`);
	});
}

/**
 * Compares two JSON objects and returns the differences.
 * @param {Object} newJson - The updated JSON object.
 * @param {Object} oldJson - The original JSON object.
 * @returns {Object} An object containing the differences between the two JSON objects.
 */
function getJsonChanges(newJson, oldJson) {
	let differences = {};
	for (const key in newJson) {
		if (typeof newJson[key] == "function") continue;
		if (typeof newJson[key] == "object") {
			if (isEqual(newJson[key], oldJson[key]) == false) differences[key] = newJson[key];
		} else if (newJson[key] !== oldJson[key]) differences[key] = newJson[key];
	}
	return differences;
}

/**
 * Changes the done state of a subtask.
 * @async
 * @param {string} subTaskName - The name of the subtask.
 */
export async function changeSubtaskDoneState(subTaskName) {
	const subTaskCheckBox = event.currentTarget;
	const isChecked = subTaskCheckBox.checked;

	let subTaskIndex;
	for (let i = 0; i < STATE.selectedTask.subTasks.length; i++) {
		if (STATE.selectedTask.subTasks[i].name === subTaskName) {
			subTaskIndex = i;
			break;
		}
	}
	STATE.selectedTask.subTasks[subTaskIndex].done = isChecked;
}

/**
 * Updates the task UI based on the provided differences.
 * @param {Object} differences - An object containing the differences.
 * @param {Task} initialTask - The initial state of the task.
 */
function updateTaskUi(
	{ title = null, description = null, priority = null, assignedTo = null, subTasks = null },
	initialTask
) {
	const taskContainer = $(`[data-id="${STATE.selectedTask.boardId}/${STATE.selectedTask.id}"]`);

	if (title) taskContainer.$(".task-title").textAnimation(title);
	if (description) taskContainer.$(".task-description").textAnimation(description);
	if (priority)
		taskContainer
			.$(".task-priority")
			.style.setProperty("--priority", `url(/Join/assets/img/icons/prio_${priority}.svg)`);
	if (assignedTo)
		taskContainer.$(".task-assigned-to").innerHTML = assignedToTemplate(
			assignedTo.map((id) => STORAGE.allUsers[id])
		);
	if (!subTasks) return;

	if (!STATE.selectedTask.subTasks.length)
		return taskContainer.$(".task-description").nextElementSibling.remove();
	if (!initialTask.subTasks.length)
		taskContainer
			.$(".task-description")
			.insertAdjacentHTML("afterend", progressTemplate(STATE.selectedTask.subTasks));

	const currentSubtaskCount = STATE.selectedTask.subTasks.filter(
		({ done }) => done == true
	).length;
	const totalSubtaskCount = STATE.selectedTask.subTasks.length;
	taskContainer.$(
		".task-progress-counter span"
	).innerText = `${currentSubtaskCount} / ${totalSubtaskCount}`;
	taskContainer
		.$(".task-progress-bar")
		.style.setProperty("--progress", `${currentSubtaskCount / totalSubtaskCount}`);
}

/**
 * Initializes the edit task modal with the selected task's data.
 */
export function editTaskInitializer() {
	const task = STATE.selectedTask;
	selectedCollaborators.length = 0;
	selectedCollaborators.push(...task.assignedTo);
	const editTaskContainer = $("#edit-task");
	editTaskContainer.innerHTML = editTaskTemplate(task);
	editTaskContainer.LANG_load();
	renderAssignedContacts(task);
	editTaskContainer.initMenus();

	toggleFullscreenState();
}

/**
 * Renders the assigned contacts for a task.
 * @param {Task} task - The task object.
 */
function renderAssignedContacts(task) {
	$(`.drp-contacts [data-id="${currentUserId()}"]`)?.LANG_load();
	$$(".drp-contacts .drp-option").forEach((contact) =>
		contact.classList.toggle("active", task.assignedTo.includes(contact.dataset.id))
	);
	renderCollaboratorInput();
}

/**
 * Toggles the fullscreen state of the task modal.
 */
export function toggleFullscreenState() {
	const fullscreenModal = $("#fullscreen-task-modal");
	fullscreenModal.$$("#fullscreen-task, #edit-task").forEach((section) => {
		section.initMenus();
		section.classList.toggle("d-none");
		if (section.id == "edit-task" && section.classList.contains("d-none"))
			section.innerHTML = "";
	});
	fullscreenModal.setAttribute(
		"static",
		fullscreenModal.getAttribute("static") == "true" ? "false" : "true"
	);
}
