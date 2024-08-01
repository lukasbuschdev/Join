import { BaseClass } from "./base.class.js";
import { STORAGE } from "./storage.js";
import { cloneDeep } from "./utilities.js";

/**
 * @typedef {"to-do"|"in-progress"|"awaiting-feedback"|"done"} TaskType
 */

/**
 * @typedef {"urgent"|"medium"|"low"} TaskPriority
 */

/**
 * @typedef {Object} TaskParams
 * 	 * @property {string} [id=Date.now().toString()] - The ID of the task.
 * @property {TaskType} [type="to-do"] - The type of the task.
 * @property {string} title - The title of the task.
 * @property {string} description - The description of the task.
 * @property {string} [category="default"] - The category of the task.
 * @property {Array<string>} [assignedTo=[]] - The users assigned to the task.
 * @property {string} dueDate - The due date of the task.
 * @property {TaskPriority} priority - The priority of the task.
 * @property {Array<{name: string, done: boolean}>} [subTasks=[]] - The subtasks of the task.
 * @property {string} boardId - The ID of the board the task belongs to.
 */

/**
 * @implements {TaskParams}
 */
export class Task extends BaseClass {
	id;
	type;
	title;
	description;
	category;
	assignedTo;
	dueDate;
	priority;
	subTasks;
	boardId;

	/**
	 * Creates an instance of Task.
	 * @param {TaskParams} params - The parameters for the task.
	 */
	constructor({
		id = Date.now().toString(),
		type = "to-do",
		title,
		description,
		category = "default",
		assignedTo = [],
		dueDate,
		priority,
		subTasks = [],
		boardId
	}) {
		super();
		this.id = id;
		this.type = type;
		this.title = title;
		this.description = description;
		this.category = category;
		this.assignedTo = assignedTo;
		this.dueDate = dueDate;
		this.priority = priority;
		this.subTasks = subTasks;
		this.boardId = boardId;
	}

	/**
	 * Changes the priority of the task.
	 * @param {TaskPriority} priority - The new priority of the task.
	 * @returns {Promise<any>} The result of the update operation.
	 */
	changePriority(priority) {
		if (!(priority == "urgent" || priority == "medium" || priority == "low")) {
			console.error(`priority '${priority}' does not exist!`);
		}
		this.priority = priority;
		return this.update();
	}

	/**
	 * Adds subtasks to the task.
	 * @param {string | Array<string>} names - The names of the subtasks to add.
	 * @returns {Promise<any>} The result of the update operation.
	 */
	addSubtask(names) {
		if (typeof names === "string") names = [names];
		for (const name of names) {
			this.subTasks.push({
				name: name,
				done: false
			});
		}
		return this.update();
	}

	/**
	 * Assigns the task to one or more users.
	 * @param {string | Array<string>} userIds - The IDs of the users to assign the task to.
	 * @returns {Promise<any>} The result of the update operation.
	 */
	async assignTo(userIds) {
		const collaborators = BOARDS[this.boardId].collaborators;
		if (typeof userIds === "string") userIds = [userIds];
		for (const userId of userIds) {
			if (!collaborators.includes(userId) && userId !== USER.id)
				return error("user not in collaborators!");
			if (this.assignedTo.includes(userId)) return error("user already assigned!");
			this.assignedTo.push(userId);
		}
		return this.update();
	}

	/**
	 * Updates the task in the storage.
	 * @returns {Promise<void>} The result of the update operation.
	 */
	async update() {
		const url = `boards/${this.boardId}/tasks/${this.id}`;
		const newTask = await STORAGE.set(url, cloneDeep(this));
		Object.assign(STORAGE.data.boards[this.boardId].tasks[this.id], newTask);
		Object.assign(this, newTask);
	}
}
