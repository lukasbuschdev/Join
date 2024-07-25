import { Board } from "./board.class.js";
import { STATE } from "./state.js";
import { STORAGE } from "./storage.js";
import { throttle } from "./utilities.js";

let TASK_ELEMENT;
let offset = { x: 0, y: 0 };
let scrollInterval;

const SCROLL_FREQUENCY = 20;
const THROTTLE_DELAY = 10;
const SCROLL_FACTOR = 4;

/**
 * Initializes the drag and drop functionality.
 */
export function addDragAndDrop() {
	TASK_ELEMENT = event.currentTarget;
	const taskBBox = TASK_ELEMENT.getBoundingClientRect();
	offset.x = event.pageX - taskBBox.x;
	offset.y = event.pageY - taskBBox.y;

	TASK_ELEMENT.style.maxWidth = `${taskBBox.width}px`;

	TASK_ELEMENT.addEventListener("pointerup", fullscreenFunctionality, { once: true });
	TASK_ELEMENT.addEventListener("pointermove", dragFunctionality, { once: true });
}

/**
 * Handles the functionality for displaying the task in fullscreen.
 */
export function fullscreenFunctionality() {
	TASK_ELEMENT.removeEventListener("pointermove", dragFunctionality);
	fullscreenHandler();
}

/**
 * Handles the logic for displaying the task in fullscreen.
 */
export function fullscreenHandler() {
	const [boardId, taskId] = TASK_ELEMENT.dataset.id.split("/");
	STATE.selectedTask = STATE.selectedBoard.getTask(taskId);
	renderFullscreenTask();
}

/**
 * Handles the functionality for dragging the task element.
 */
export function dragFunctionality() {
	TASK_ELEMENT.removeEventListener("pointerup", fullscreenFunctionality, { once: true });

	window.addEventListener("pointermove", dragHandler);
	startScroll();

	const placeholderElement = '<div class="element-placeholder"></div>';
	TASK_ELEMENT.insertAdjacentHTML("beforebegin", placeholderElement);

	window.addEventListener("pointerup", () => {
			stopScroll();
			window.removeEventListener("pointermove", dragHandler);
			dropHandler();
		}, { once: true }
	);
	TASK_ELEMENT.classList.add("active");
}

/**
 * Handles the drag event throttled by a delay.
 * @param {Event} event - The pointermove event.
 */
export const dragHandler = throttle(() => {
	checkDropContainers();
	const { pageX, pageY } = event;
	const x = Math.round(pageX - offset.x);
	const y = Math.round(pageY - offset.y);
	moveTask(x, y);
}, THROTTLE_DELAY);

/**
 * Moves the task element to the specified coordinates.
 * @param {number} x - The x-coordinate to move the task to.
 * @param {number} y - The y-coordinate to move the task to.
 */
export function moveTask(x, y) {
	TASK_ELEMENT.style.top = `${y}px`;
	TASK_ELEMENT.style.left = `${x}px`;
}

/**
 * Handles the scroll functionality during drag.
 */
export function scrollFunctionality() {
	const taskContainer = $("#tasks");
	if (checkScrollSoft(taskContainer) === false) return;
	const scrollDirection = checkScrollHard(taskContainer);
	if (scrollDirection) customScroll(scrollDirection);
}

/**
 * Checks if the task container can scroll.
 * @param {HTMLElement} taskContainer - The task container element.
 * @returns {boolean} True if the task container can scroll, otherwise false.
 */
export function checkScrollSoft(taskContainer) {
	const canScroll = taskContainer.scrollHeight > taskContainer.clientHeight;
	return canScroll;
}

/**
 * Determines the scroll direction based on the task's position.
 * @param {HTMLElement} taskContainer - The task container element.
 * @returns {number} The scroll direction: 1 for down, -1 for up, 0 for no scroll.
 */
export function checkScrollHard(taskContainer) {
	const taskBBox = TASK_ELEMENT.getBoundingClientRect();
	const taskContainerBBox = taskContainer.getBoundingClientRect();
	const yOffset = 50;

	const canScrollDown = taskContainer.scrollTop < taskContainer.scrollHeight - taskContainer.clientHeight - 1;
	const canScrollUp = taskContainer.scrollTop > 0;
	const shouldScrollDown = taskBBox.bottom > taskContainerBBox.bottom + yOffset;
	const shouldScrollUp = taskBBox.y < taskContainerBBox.y - yOffset;

	if (canScrollDown && shouldScrollDown) return 1;
	if (canScrollUp && shouldScrollUp) return -1;
	return 0;
}

/**
 * Scrolls the task container in the specified direction.
 * @param {number} direction - The direction to scroll: 1 for down, -1 for up.
 */
export function customScroll(direction) {
	const taskContainer = $("#tasks");
	taskContainer.scrollBy(0, SCROLL_FACTOR * direction);
}

/**
 * Starts the scrolling functionality during drag.
 */
export function startScroll() {
	scrollInterval = setInterval(scrollFunctionality, SCROLL_FREQUENCY);
}

/**
 * Stops the scrolling functionality during drag.
 */
export function stopScroll() {
	clearInterval(scrollInterval);
}

/**
 * Handles the drop event for the task element.
 */
export async function dropHandler() {
	TASK_ELEMENT.classList.remove("active");
	TASK_ELEMENT.style.maxWidth = "";

	const targetContainer = checkDropContainers();
	$(".element-placeholder")?.remove();
	if (!targetContainer) return taskDropAnimation();

	const el = targetContainer.$(".task-container");
	const [boardId, taskId] = TASK_ELEMENT.dataset.id.split("/");

	const activeBoard = STORAGE.currentUserBoards[boardId];
	const activeTask = activeBoard.tasks[taskId];

	const newType = el.id;
	const taskType = activeTask.type;

	if (taskType !== newType) {
		el.append(TASK_ELEMENT);
		changeTaskType(activeBoard, activeTask, newType);
	}
	taskDropAnimation();
	moveTask(0, 0);
	targetContainer.children[1].classList.remove("placeholder");
}

/**
 * Animates the task element during the drop event.
 */
export function taskDropAnimation() {
	const { pageX, pageY } = event;
	const taskBBox = TASK_ELEMENT.getBoundingClientRect();

	const x = Math.round(pageX - taskBBox.x - offset.x);
	const y = Math.round(pageY - taskBBox.y - offset.y);
	TASK_ELEMENT.style.translate = `${x}px ${y}px`;

	setTimeout(() => {
		TASK_ELEMENT.classList.add("drop-transition");
		TASK_ELEMENT.addEventListener("transitionend", () => TASK_ELEMENT.classList.remove("drop-transition"), { once: true });
		TASK_ELEMENT.style.translate = "0 0";
	}, 0);
}

/**
 * Checks the drop containers to determine the drop target.
 * @returns {HTMLElement|null} The target container element or null if no valid target.
 */
export function checkDropContainers() {
	const { pageX, pageY } = event;
	const taskContainer = $("#tasks");
	for (const container of [...taskContainer.children]) {
		const containerBBox = container.getBoundingClientRect();
		const mouseXInside = pageX > containerBBox.x && pageX < containerBBox.right;
		const mouseYInside = pageY > containerBBox.y && pageY < containerBBox.bottom;
		const mouseInside = mouseXInside && mouseYInside;
		container.children[1].classList.toggle("placeholder", mouseInside);
		if (!mouseInside) continue;
		return container;
	}
	return null;
}

/**
 * Changes the task type and updates the board.
 * @param {Board} board - The board object.
 * @param {Task} task - The task object.
 * @param {import("./task.class.js").TaskType} newType - The new type of the task.
 * @returns {Promise<void>} A promise that resolves when the task type is changed and the board is updated.
 */
export async function changeTaskType(board, task, newType) {
	task.type = newType;
	return board.update();
}

