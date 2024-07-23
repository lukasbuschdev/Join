import { SESSION_getData, SESSION_setData, STORAGE } from "../../js/storage.js";
import { $, $$, dateFormat, debounce, getInitialsOfName, isEqual, notification, throwErrors } from "../../js/utilities.js";
import { Notify } from "../../js/notify.class.js";
import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { boardTitleSelectionTemplate } from "../index/index.js";
import { summaryTemplate } from "../../assets/templates/index/summary_template.js";
import { STATE } from "../../js/state.js";
import { addBoardCategoryTemplate } from "../../assets/templates/index/task_template.js";
import { boardEditButtonTemplate } from "../../assets/templates/index/summary_template.js";
bindInlineFunctions(getContext(), [
	"/Join/index/index/index.js",
	"/Join/js/utilities.js",
	"/Join/js/language.js"
]);

let NEW_BOARD_COLLABORATORS = [];

export async function initSummary() {
	if (!STORAGE.currentUser.boards.length) return;

	const activeSessionBoardId = SESSION_getData("activeBoard");
	const boardId = STORAGE.currentUser.boards.includes(activeSessionBoardId)
		? activeSessionBoardId
		: undefined || STORAGE.currentUser.boards[0];
	if (!boardId) return;
	renderBoard(boardId);
	renderBoardTitleSelection();
	$("#summary-content").classList.remove("d-none");
}

export function getTaskStats(tasksObj) {
	const tasks = Object.values(tasksObj);
	const now = new Date();

	const allStats = {
		tasksInBoard: tasks.length,
		tasksInProgress: 0,
		tasksAwaitingFeedback: 0,
		tasksToDo: 0,
		tasksDone: 0,
		tasksUrgent: 0,
		upcomingDeadline: tasks.length
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
			: 0
	};

	if (!tasks.length) return allStats;
	tasks.forEach((task) => {
		if (task.type === "in-progress") allStats.tasksInProgress++;
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

export function renderBoard(boardId) {
	STATE.selectedBoard = STORAGE.currentUserBoards[boardId];
	const { id, name, tasks: tasksObj, owner } = STATE.selectedBoard;

	const taskStats = getTaskStats(tasksObj);
	SESSION_setData('activeBoard', Number(id));
	$("#summary-content").innerHTML = summaryTemplate(taskStats);
	if (owner == STORAGE.currentUser.id) $("#summary-data").innerHTML += boardEditButtonTemplate(id);
	else $("#board-title .circle")?.remove();

	const summaryHeader = $(".summary-header h2");
	delete summaryHeader.dataset.lang;
	summaryHeader.innerText = name;
}

export function renderBoardTitleSelection() {
	const activeBoardId = SESSION_getData("activeBoard");
	$("#board-title-selection .options").innerHTML = Object.values(
		STORAGE.currentUserBoards
	).reduce(
		(template, board) =>
			`${template}${activeBoardId != board.id ? boardTitleSelectionTemplate(board) : ""}`,
		``
	);
}

export async function createBoardModal() {
	await $("#add-board .add-board-data").includeTemplate({
		url: "/Join/assets/templates/index/add-board.html",
		replace: false
	});
	$("#add-board").openModal();
}

export function addBoardCategory() {
	const title = $("#add-board-categories input").value;
	const color = $(".category-color.active").style.getPropertyValue("--clr");
	const titleValidity = title.length > 20;
	throwErrors({ identifier: "name-too-long", bool: titleValidity });
	if (titleValidity) return;
	$(".categories-container").innerHTML += addBoardCategoryTemplate([title, color]);
	$("#add-board-categories input").value = "";
}

export function removeBoardCategory() {
	event.currentTarget.parentElement.remove();
}

export function clearCategoryInput() {
	event.currentTarget.parentElement.previousElementSibling.value = "";
	const title = $("#add-board-categories input").value;
	const titleValidity = title.length > 10;
	throwErrors({ identifier: "name-too-long", bool: titleValidity });
}

export function isValidTitle(titleInput) {
	return /^[a-zA-Z0-9_-]+$/.test(titleInput);
}

export function getCollaborators() {
	return [...$$(".collaborator")].reduce((total, collaborator) => {
		total.push(collaborator.dataset.id);
		return total;
	}, []);
}

export const getTaskCategories = () =>
	[...$$(".task-category")].reduce((total, category) => {
		const color = category.style.getPropertyValue("--clr");
		const name = category.$("span").innerText;
		total[name] = color;
		return total;
	}, {});

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
	await Promise.all([
		createBoardNotification(newBoard, collaborators),
		notification("board-added")
	]);
	location.reload();
}

export function createBoardNotification({ name, id }, collaborators) {
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

export function toggleDrp() {
	event.currentTarget.toggleDropDown();
	const drp = $(":is(.add-board-data, .edit-board-data) #drp-collaborators");
	const filteredContacts = !!event.currentTarget.closest(".edit-board-data")
		? Object.values(STORAGE.currentUserContacts).filter(
				({ id }) => !STATE.selectedBoard.collaborators.includes(id)
		  )
		: Object.values(STORAGE.currentUserContacts);
	const sortedContacts = filteredContacts.sort((a, b) => (a.name > b.name ? 1 : -1));
	drp.innerHTML = "";
	drp.renderItems(sortedContacts, contactDropdownTemplate);
}

export const filterDrp = debounce(() => {
	const drp = $(".add-board-data .drp");
	const filter = $("#add-board-collaborators input").value;
	const sortedContacts = Object.values(STORAGE.currentUserContacts).sort((a, b) =>
		a.name > b.name ? 1 : -1
	);
	const filteredContacts = sortedContacts.filter(({ name }) =>
		name.toLowerCase().includes(filter.toLowerCase())
	);
	drp.innerHTML = "";
	drp.renderItems(filteredContacts, contactDropdownTemplate);
});

export function contactDropdownTemplate({ name, color, id, img }) {
	return /*html*/ `
        <div class="contact row gap-15 drp-option ${
			NEW_BOARD_COLLABORATORS.includes(id) ? "active" : ""
		}" onclick="addCollaborator(${id})">
            <div class="user-img-container" style="--user-clr: ${color};">
                <span>${getInitialsOfName(name)}</span>
                <img src="${img}">
            </div>
            <div>${name}</div>
        </div>
    `;
}

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

export function newBoardCollaboratorTemplate({ img, name, color, id }) {
	return /*html*/ `
    <button class="collaborator ${
		!STATE.selectedBoard?.collaborators.includes(id) ? "invitation" : ""
	}" data-id="${id}">
        <div class="user-img-container" style="--user-clr: ${color}">
            <span>${getInitialsOfName(name)}</span>
            <img src="${img}" alt="">
        </div>
    </button>
`;
}

export function renderEditBoard() {
	const { name, collaborators, categories } = STATE.selectedBoard;
	const editBoardContainer = $(".edit-board-data");
	editBoardContainer.$(":scope > h3").innerText = name;
	editBoardContainer
		.$(".categories-container")
		.renderItems(Object.entries(categories), addBoardCategoryTemplate);

	NEW_BOARD_COLLABORATORS = [...collaborators];
	editBoardContainer.$(".collaborators-container").renderItems(
		Object.values(STORAGE.currentUserContacts).filter((contact) =>
			collaborators.includes(contact.id)
		),
		newBoardCollaboratorTemplate
	);
}

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

export function updateBoardCategories(categories) {
	if (isEqual(categories, STATE.selectedBoard.categories)) return;
	STATE.selectedBoard.categories = {};
	Object.entries(categories).for(
		([name, color]) => (STATE.selectedBoard.categories[name] = color)
	);
	return STATE.selectedBoard.update();
}

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

export const deleteBoard = () =>
	confirmation(`delete-board, {boardName: '${STATE.selectedBoard.name}'}`, async () => {
		await STATE.selectedBoard.delete();
		STATE.selectedBoard = Object.values(STORAGE.currentUserBoards)[0] || undefined;
		await notification("board-deleted");
		$("#edit-board").closeModal();
		location.reload();
	});

export function toggleBoardSelection() {
	console.log(this);
	$("#summary-selection").classList.toggle("active");
}
