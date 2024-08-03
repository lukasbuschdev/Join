import { SESSION_getData, SESSION_setData, STORAGE } from "../../js/storage.js";
import { $, $$, dateFormat, debounce, isEqual, notification, throwErrors } from "../../js/utilities.js";
import { Notify } from "../../js/notify.class.js";
import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { boardTitleSelectionTemplate } from "../index/index.js";
import { contactDropdownTemplate, newBoardCollaboratorTemplate, summaryTemplate } from "../../assets/templates/index/summary_template.js";
import { STATE } from "../../js/state.js";
import { addBoardCategoryTemplate } from "../../assets/templates/index/task_template.js";
import { boardEditButtonTemplate } from "../../assets/templates/index/summary_template.js";
import { Task } from "../../js/task.class.js";
import { Board } from "../../js/board.class.js";
bindInlineFunctions(getContext(), ["/Join/index/index/index.js", "/Join/js/utilities.js", "/Join/js/language.js"]);

export let NEW_BOARD_COLLABORATORS = [];

/**
 * Initializes summary by rendering the (active) board and its title selection if there are boards available.
 * @async
 * @returns {Promise<void>} Resolves when the initialization is complete.
 */
export async function initSummary() {
	if (!STORAGE.currentUser.boards.length) return;

	const activeSessionBoardId = SESSION_getData("activeBoard");
	const boardId = STORAGE.currentUser.boards.includes(activeSessionBoardId) ? activeSessionBoardId : undefined || STORAGE.currentUser.boards[0];
	if (!boardId) return;
	renderBoard(boardId);
	renderBoardTitleSelection();
	$("#summary-content").classList.remove("d-none");
}

/**
 * Gets the upcoming deadline from a list of tasks.
 * @param {Task[]} tasks - The list of tasks.
 * @returns {string|undefined} The upcoming deadline formatted as a locale date string, or `undefined` if there are no upcoming deadlines.
 */
function getUpcomingDeadline(tasks) {
	return tasks.length
		? tasks
				.reduce((all, { dueDate }) => {
					const formattedDate = dateFormat(dueDate);
					return formattedDate ? [...all, formattedDate] : all;
				}, [])
				.sort()
				.at(0)
				?.toLocaleDateString(LANG.currentLang, {
					year: "numeric",
					month: "long",
					day: "numeric"
				}) || undefined
		: 0;
}

/**
 * Gets the statistics of tasks from a tasks object.
 * @param {Task} tasksObj - The object containing tasks.
 * @returns {Object} An object containing various task statistics.
 */
export function getTaskStats(tasksObj) {
	const tasks = Object.values(tasksObj);
	const allStats = {
		tasksInBoard: tasks.length,
		tasksInProgress: 0,
		tasksAwaitingFeedback: 0,
		tasksToDo: 0,
		tasksDone: 0,
		tasksUrgent: 0,
		upcomingDeadline: getUpcomingDeadline(tasks)
	};

	if (!tasks.length) return allStats;
	tasks.forEach((task) => {
		switch (task.type) {
			case "in-progress":
				allStats.tasksInProgress++;
				break;
			case "awaiting-feedback":
				allStats.tasksAwaitingFeedback++;
				break;
			case "to-do":
				allStats.tasksToDo++;
				break;
			case "done":
				allStats.tasksDone++;
				break;
		}
		if (task.priority === "urgent") allStats.tasksUrgent++;
	});

	return allStats;
}

/**
 * Renders the board with the given ID and sets it as the active board.
 * @param {string} boardId - The ID of the board to render.
 */
function renderBoard(boardId) {
	STATE.selectedBoard = STORAGE.currentUserBoards[boardId];
	const { id, name, tasks, owner } = STATE.selectedBoard;

	const taskStats = getTaskStats(tasks);
	SESSION_setData("activeBoard", Number(id));
	$("#summary-content").innerHTML = summaryTemplate(taskStats);
	if (owner == STORAGE.currentUser.id) $("#summary-data").innerHTML += boardEditButtonTemplate(id);
	else $("#board-title .circle")?.remove();

	const summaryHeader = $(".summary-header h2");
	delete summaryHeader.dataset.lang;
	summaryHeader.innerText = name;
}

/**
 * Renders the board title selection options.
 */
export function renderBoardTitleSelection() {
	const activeBoardId = SESSION_getData("activeBoard");
	$("#board-title-selection .options").innerHTML = Object.values(STORAGE.currentUserBoards)
		.filter(({ id }) => !(id == activeBoardId))
		.reduce((template, board) => (template += boardTitleSelectionTemplate(board)), ``);
}

/**
 * Creates and displays the board creation modal.
 * @async
 * @returns {Promise<void>} Resolves when the modal is created and displayed.
 */
export async function createBoardModal() {
	await $("#add-board .add-board-data").includeTemplate({
		url: "/Join/assets/templates/index/add-board.html",
		replace: false
	});
	$("#add-board").openModal();
}

/**
 * Adds a new category to the board creation modal or throws the appropriate error.
 */
export function addBoardCategory() {
	const title = $("#add-board-categories input").value;
	const color = $(".category-color.active").style.getPropertyValue("--clr");
	const titleValidity = title.length > 20;
	throwErrors({ identifier: "name-too-long", bool: titleValidity });
	if (titleValidity) return;
	$(".categories-container").innerHTML += addBoardCategoryTemplate([title, color]);
	$("#add-board-categories input").value = "";
}

/**
 * Removes a board category from the board creation modal.
 */
export function removeBoardCategory() {
	event.currentTarget.parentElement.remove();
}

/**
 * Clears the category input field in the board creation modal.
 */
export function clearCategoryInput() {
	event.currentTarget.parentElement.previousElementSibling.value = "";
	const title = $("#add-board-categories input").value;
	const titleValidity = title.length > 10;
	throwErrors({ identifier: "name-too-long", bool: titleValidity });
}

/**
 * Validates the board title input.
 * @param {string} titleInput - The board title to validate.
 * @returns {boolean} True if the title is valid, false otherwise.
 */
function isValidTitle(titleInput) {
	return /^[a-zA-Z0-9_-]+$/.test(titleInput);
}

/**
 * Retrieves a list of collaborator IDs.
 * @returns {Array<string>} An array of collaborator IDs.
 */
export function getCollaborators() {
	return [...$$(".collaborator")].reduce((total, collaborator) => {
		total.push(collaborator.dataset.id);
		return total;
	}, []);
}

/**
 * Retrieves the task categories.
 * @returns {Object} An object containing the task categories and their colors.
 */
function getTaskCategories() {
	return [...$$(".task-category")].reduce((total, category) => {
		const color = category.style.getPropertyValue("--clr");
		const name = category.$("span").innerText;
		total[name] = color;
		return total;
	}, {});
}

/**
 * Creates a new board based on the input from the board creation modal.
 * @async
 * @returns {Promise<void>} Resolves when the new board is created.
 */
export async function createNewBoard() {
	const boardName = $("#add-board-title input").value.replaceAll(" ", "-");
	const titleIsValid = isValidTitle(boardName);
	if (!titleIsValid) return throwErrors({ identifier: "title", bool: titleIsValid });

	const collaborators = getCollaborators();
	const categories = getTaskCategories();
	const user = STORAGE.currentUser;
	const boardData = { name: boardName, categories, collaborators: [user.id] };
	const newBoard = await user.addBoard(boardData);
	$("#add-board").closeModal();
	SESSION_setData("activeBoard", Number(newBoard.id));
	await Promise.all([createBoardNotification(newBoard, collaborators), notification("board-added")]);
	location.reload();
}

/**
 * Creates and sends a board notification to the specified collaborators.
 * @param {Board} board - The board object.
 * @param {Array<string>} collaborators - An array of collaborator IDs.
 * @returns {Promise<void>} Resolves when the notification is sent.
 */
function createBoardNotification({ name, id }, collaborators) {
	if (!collaborators.length) return;
	const notification = new Notify({
		recipients: collaborators,
		type: "boardInvite",
		ownerName: STORAGE.currentUser.name,
		boardName: name,
		boardId: id
	});
	return notification.send();
}

/**
 * Toggles the dropdown for adding board collaborators.
 */
export function toggleDrp() {
	event.currentTarget.toggleDropDown();
	const drp = $(":is(.add-board-data, .edit-board-data) #drp-collaborators");
	const filteredContacts = !!event.currentTarget.closest(".edit-board-data")
		? Object.values(STORAGE.currentUserContacts).filter(({ id }) => !STATE.selectedBoard.collaborators.includes(id))
		: Object.values(STORAGE.currentUserContacts);
	const sortedContacts = filteredContacts.sort((a, b) => (a.name > b.name ? 1 : -1));
	drp.innerHTML = "";
	drp.renderItems(sortedContacts, contactDropdownTemplate);
}

/**
 * Filters the dropdown list for collaborators.
 */
export const filterDrp = debounce(() => {
	const drp = $(".add-board-data .drp");
	const filter = $("#add-board-collaborators input").value;
	const sortedContacts = Object.values(STORAGE.currentUserContacts).sort((a, b) => (a.name > b.name ? 1 : -1));
	const filteredContacts = sortedContacts.filter(({ name }) => name.toLowerCase().includes(filter.toLowerCase()));
	drp.innerHTML = "";
	drp.renderItems(filteredContacts, contactDropdownTemplate);
});

/**
 * Adds or removes a collaborator to/from the new board.
 * @param {string} id - The ID of the collaborator.
 */
export function addCollaborator(id) {
	event.currentTarget.classList.toggle("active");
	if (NEW_BOARD_COLLABORATORS.includes(`${id}`)) NEW_BOARD_COLLABORATORS.remove(`${id}`);
	else NEW_BOARD_COLLABORATORS.push(`${id}`);
	const collabContainer = $(".collaborators-container");
	collabContainer.innerHTML = "";
	Object.values(STORAGE.currentUserContacts).forEach((contact) => {
		if (!NEW_BOARD_COLLABORATORS.includes(contact.id)) return;
		collabContainer.innerHTML += newBoardCollaboratorTemplate(contact);
	});
}

/**
 * Renders the edit board modal with the current board's data.
 */
function renderEditBoard() {
	const { name, collaborators, categories } = STATE.selectedBoard;
	const editBoardContainer = $(".edit-board-data");
	editBoardContainer.$(":scope > h3").innerText = name;
	editBoardContainer.$(".categories-container").renderItems(Object.entries(categories), addBoardCategoryTemplate);
	NEW_BOARD_COLLABORATORS = [...collaborators];
	editBoardContainer.$(".collaborators-container").renderItems(
		Object.values(STORAGE.currentUserContacts).filter((contact) => collaborators.includes(contact.id)),
		newBoardCollaboratorTemplate
	);
}

/**
 * Saves the edited board data.
 * @async
 * @returns {Promise<void>} Resolves when the board data is saved.
 */
export async function saveEditedBoard() {
	const collaborators = getCollaborators();
	const categories = getTaskCategories();

	const notifyPromise = createBoardNotification(
		STATE.selectedBoard,
		collaborators.filter((collabId) => !STATE.selectedBoard.collaborators.includes(collabId))
	);
	const categoryPromise = updateBoardCategories(categories);
	await Promise.all([notifyPromise, categoryPromise]);
	await notification(`board-updated, {boardName: '${STATE.selectedBoard.name}'}`);
	$("#edit-board").closeModal();
}

/**
 * Updates the board categories.
 * @param {Object} categories - The categories to update.
 * @returns {Promise<void>|void} Resolves when the categories are updated, or void if they are unchanged.
 */
function updateBoardCategories(categories) {
	if (isEqual(categories, STATE.selectedBoard.categories)) return;
	STATE.selectedBoard.categories = {};
	Object.entries(categories).for(([name, color]) => (STATE.selectedBoard.categories[name] = color));
	return STATE.selectedBoard.update();
}

/**
 * Initializes the edit board modal.
 * @async
 * @returns {Promise<void>} Resolves when the edit board modal is initialized.
 */
export async function initEditBoard() {
	event.stopPropagation();
	NEW_BOARD_COLLABORATORS = [];
	const editBoardModal = $("#edit-board");
	await editBoardModal.$(".edit-board-data").includeTemplate({
		url: "/Join/assets/templates/index/edit-board.html",
		replace: false
	});
	renderEditBoard();
	editBoardModal.openModal();
}

/**
 * Deletes the current board after confirmation.
 * @returns {Promise<void>} Resolves when the board is deleted.
 */
export function deleteBoard() {
	return confirmation(`delete-board, {boardName: '${STATE.selectedBoard.name}'}`, async () => {
		await STATE.selectedBoard.delete();
		STATE.selectedBoard = Object.values(STORAGE.currentUserBoards)[0] || undefined;
		await notification("board-deleted");
		$("#edit-board").closeModal();
		location.reload();
	});
}
