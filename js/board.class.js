import { BaseClass } from "./base.class.js";
import { Notify } from "./notify.class.js";
import { STORAGE } from "./storage.js";
import { Task } from "./task.class.js";
import { cloneDeep, currentUserId, error } from "./utilities.js";

/**
 * @typedef {Object<string, string>} Categories
 * @property {string} name
 * @property {string} color
 */

/**
 * Class representing a Board.
 * @extends BaseClass
 */
export class Board extends BaseClass {
	/** @type {string} */
	name;

	/** @type {string} */
	owner;

	/** @type {string} */
	id;

	/** @type {Array<string>} */
	collaborators;

	/** @type {number} */
	dateOfCreation;

	/** @type {number} */
	dateOfLastEdit;

	/** @type {Object<string, Task>} */
	tasks;

	/** @type {Categories} */
	categories;

	/**
	 * Creates an instance of Board.
	 * @param {Object} params - The parameters for the Board.
	 * @param {string} params.name - The name of the board.
	 * @param {string} [params.owner=currentUserId()] - The owner of the board.
	 * @param {string} [params.id=Date.now().toString()] - The ID of the board.
	 * @param {Array<string>} [params.collaborators=[]] - The collaborators of the board.
	 * @param {number} [params.dateOfCreation=Date.now()] - The date of creation.
	 * @param {number} [params.dateOfLastEdit=Date.now()] - The date of last edit.
	 * @param {Object<string, Task>} [params.tasks={}] - The tasks associated with the board.
	 * @param {Categories} [params.categories={}] - The categories of the board.
	 */
	constructor({
		name,
		owner = currentUserId(),
		id = Date.now().toString(),
		collaborators = [],
		dateOfCreation = Date.now(),
		dateOfLastEdit = Date.now(),
		tasks = {},
		categories = {}
	}) {
		super();
		this.name = name;
		this.owner = owner;
		this.id = id;
		this.collaborators = collaborators;
		this.dateOfCreation = dateOfCreation;
		this.dateOfLastEdit = dateOfLastEdit;
		this.tasks = tasks;
		this.categories = categories;
	}

	/**
	 * Adds a new task to the board and updates it.
	 * @param {Object} taskData - The data of the task to be added.
	 * @returns {Promise<Task>} The newly added task.
	 */
	async addTask(taskData) {
		if (typeof taskData !== "object") return;
		const task = new Task(taskData);
		task.color = this.categories[taskData.category];
		task.boardId = this.id;

		this.tasks[task.id] = cloneDeep(task);
		console.log(task.assignedTo);

		const user = STORAGE.currentUser;
		await this.update();
		console.log(task.assignedTo);
		const notification = new Notify({
			userName: STORAGE.currentUser.name,
			recipients: task.assignedTo.filter((id) => id !== user.id),
			type: "assignTo",
			taskName: task.title,
			boardName: this.name
		});
		notification.send();
		return task;
	}

	/**
	 * Gets a task by its ID.
	 * @param {string} id - The ID of the task to retrieve.
	 * @returns {Task} The retrieved task.
	 */
	getTask(id) {
		return new Task(this.tasks[id]);
	}

	/**
	 * Adds a collaborator to the board.
	 * @param {string} collaboratorId - The ID of the collaborator to add.
	 * @returns {Promise<void>} The promise that resolves when the collaborator is added.
	 */
	async addCollaborator(collaboratorId) {
		if (!STORAGE.currentUser.contacts.includes(collaboratorId))
			return error("collaboratorId not in contacts!");
		this.collaborators.push(collaboratorId);
		return this.update();
	}

	/**
	 * Adds a category to the board.
	 * @param {string} name - The name of the category.
	 * @param {string} color - The color of the category.
	 * @returns {Promise<void>} The promise that resolves when the category is added.
	 */
	async addCategory(name, color) {
		this.categories[name] = color;
		return this.update();
	}

	/**
	 * Gets the collaborators of the board.
	 * @returns {Array<User>} The collaborators of the board.
	 */
	getCollaborators() {
		return STORAGE.getUsersById(this.collaborators);
	}

	/**
	 * Updates the board data in storage.
	 * @returns {Promise<void>} The promise that resolves when the board is updated.
	 */
	update() {
		STORAGE.data.boards[this.id] = cloneDeep(this);
		return super.update(`boards/${this.id}`);
	}

	/**
	 * Deletes the board.
	 * @returns {Promise<void>} The promise that resolves when the board is deleted.
	 */
	async delete() {
		if (STORAGE.currentUserId() !== this.owner)
			return error(`not the owner of "${this.name}"!`);
		await Promise.all(
			this.collaborators.map((collaboratorId) => {
				const collaborator = STORAGE.allUsers[collaboratorId];
				collaborator.boards.remove(this.id);
				return collaborator.update();
			})
		);
		return STORAGE.delete(`boards/${this.id}`);
	}
}

