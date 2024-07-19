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
import { $, confirmation, debounce, notification, currentUserId, isEqual, cloneDeep, $$ } from "../../js/utilities.js";
import { renderBoardTitleSelection } from "../summary/summary.js";
import { assignedToTemplate, progressTemplate, taskTemplate } from "../../assets/templates/index/task_template.js";
import { fullscreenTaskTemplate } from "../../assets/templates/index/fullscreen-task_template.js";
import { editTaskTemplate } from "../../assets/templates/index/edit-task_template.js";
import { renderBoardIds, renderDate, selectedCollaborators } from "../add_task/add_task.js";
import { STATE } from "../../js/state.js";
import { renderCollaboratorInput } from "../../assets/templates/index/add_task_templates.js";

export async function initBoard() {
	if (!STORAGE.currentUser.boards.length) return;
	renderBoardTitleSelection();
	renderTasks();
	$("#tasks").classList.remove("d-none");
};

export async function renderTasks(filter) {
	const { tasks, name } = STATE.selectedBoard;

	const boardHeader = $("#board-header h2");
	delete boardHeader.dataset.lang;
	boardHeader.innerText = name;

	if (!Object.values(tasks).length) return;
	const tasksContainer = $("#tasks");

	tasksContainer
		.$$(":scope > div > div:last-child")
		.for((container) => (container.innerHTML = ""));
	const filteredTasks = filter
		? Object.values(tasks).filter(
				(task) =>
					task.title.toLowerCase().includes(filter.toLowerCase()) ||
					task.description.toLowerCase().includes(filter.toLowerCase())
		  )
		: Object.values(tasks);
	filteredTasks
		.toReversed()
		.for((task) => ($(`#${task.type}`).innerHTML += taskTemplate(task, filter)));
	await tasksContainer.LANG_load();
};

export const searchTasks = debounce(() => {
	const searchInput = $("#search-task input").value;
	renderTasks(searchInput);
}, 200);

export function focusInput() {
	$("#search-task input").focus();
};

export function clearTaskSearch() {
	$("#search-task input").value = "";
	renderTasks();
};

export async function addTaskModal() {
	renderBoardIds();
	renderDate();
	const modal = $("#add-task-modal");
	modal.$(".add-task-card").classList.remove("d-none");
	modal.openModal();
};

export function renderFullscreenTask(task) {
	if (event.which !== 1) return;
	const modal = $("#fullscreen-task-modal");
	const initialTask = cloneDeep(task);
	modal.$("#fullscreen-task").innerHTML = fullscreenTaskTemplate(task);
	modal.LANG_load();
	modal.openModal();
	modal.addEventListener("close", () => saveTaskChanges(initialTask), {
		once: true
	});
};

export function saveEditedTask() {
	const editedTaskData = {
		title: $("#fullscreen-task-modal #title").value,
		description: $("#fullscreen-task-modal #description").value,
		dueDate: $("#fullscreen-task-modal #date").value,
		priority: $("#fullscreen-task-modal .prio-btn.active span").dataset.lang,
		assignedTo: selectedCollaborators,
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
	$("#fullscreen-task-modal").closeModal();
	toggleFullscreenState();
};

export function saveTaskChanges(initialTask) {
	const updatedTask = STATE.selectedTask;

	const differences = getJsonChanges(updatedTask, initialTask);
	if (Object.values(differences).length > 0) {
		updateTaskUi(differences, initialTask);
		return STATE.selectedTask.update();
	}
};

export function deleteTask() {
	confirmation(`delete-task, {taskName: '${STATE.selectedTask.title}'}`, async () => {
		const { boardId, id, name } = STATE.selectedTask;
		const modal = $("#fullscreen-task-modal");
		const taskElement = $(`.task[data-id="${boardId}/${id}"]`);
		const taskContainer = taskElement.parentElement;
		await STORAGE.delete(`boards/${boardId}/tasks/${id}`);
		modal.removeEventListener("close", saveTaskChanges, { once: true });
		modal.closeModal();
		taskElement.remove();
		taskContainer.innerHTML = taskContainer.innerHTML.trim();
		notification(`task-deleted, {taskName: '${name}'}`);
	});
}

export function getJsonChanges(newJson, oldJson) {
	let differences = {};
	for (const key in newJson) {
		if (typeof newJson[key] == "function") continue;
		if (typeof newJson[key] == "object") {
			if (isEqual(newJson[key], oldJson[key]) == false) differences[key] = newJson[key];
		} else if (newJson[key] !== oldJson[key]) differences[key] = newJson[key];
	}
	return differences;
};

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
};

export function updateTaskUi({ title = null, description = null, priority = null, assignedTo = null, subTasks = null }, initialTask) {
	const taskContainer = $(`[data-id="${STATE.selectedTask.boardId}/${STATE.selectedTask.id}"]`);

	if (title) taskContainer.$(".task-title").textAnimation(title);
	if (description) taskContainer.$(".task-description").textAnimation(description);
	if (priority) taskContainer.$(".task-priority").style.setProperty("--priority", `url(/Join/assets/img/icons/prio_${priority}.svg)`);
	if (assignedTo) taskContainer.$(".task-assigned-to").innerHTML = assignedToTemplate(assignedTo.map((id) => STORAGE.allUsers[id]));
	if (!subTasks) return;

	if (!STATE.selectedTask.subTasks.length) return taskContainer.$(".task-description").nextElementSibling.remove();
	if (!initialTask.subTasks.length) taskContainer.$(".task-description").insertAdjacentHTML("afterend", progressTemplate(STATE.selectedTask.subTasks));

	const currentSubtaskCount = STATE.selectedTask.subTasks.filter(({ done }) => done == true).length;
	const totalSubtaskCount = STATE.selectedTask.subTasks.length;
	taskContainer.$(".task-progress-counter span").innerText = `${currentSubtaskCount} / ${totalSubtaskCount}`;
	taskContainer.$(".task-progress-bar").style.setProperty("--progress", `${currentSubtaskCount / totalSubtaskCount}`);
}
export function editTaskInitializer() {
	const task = STATE.selectedTask;
	const editTaskContainer = $("#edit-task");
	editTaskContainer.innerHTML = editTaskTemplate(task);
	editTaskContainer.LANG_load();
	selectedCollaborators.length = 0;
	selectedCollaborators.push(...task.assignedTo);
	renderAssignedContacts(task);
	editTaskContainer.initMenus();

	toggleFullscreenState();
};

export function renderAssignedContacts(task) {
	$(`.drp-contacts [data-id="${currentUserId()}"]`)?.LANG_load();
	$$(".drp-contacts .drp-option").forEach((contact) =>
		contact.classList.toggle("active", task.assignedTo.includes(contact.dataset.id))
	);
	renderCollaboratorInput();
};

export function toggleFullscreenState() {
	const fullscreenModal = $("#fullscreen-task-modal");
	fullscreenModal.$$("#fullscreen-task, #edit-task").for((section) => {
		section.initMenus();
		section.classList.toggle("d-none");
		if (section.id == "edit-task" && section.classList.contains("d-none"))
			section.innerHTML = "";
	});
	fullscreenModal.setAttribute(
		"static",
		fullscreenModal.getAttribute("static") == "true" ? "false" : "true"
	);
};
