import { BaseClass } from "./base.class.js";
import { Notify } from "./notify.class.js";
import { STORAGE } from "./storage.js";
import { Task } from "./task.class.js";
import { cloneDeep, currentUserId, error } from "./utilities.js";

/**
 * @typedef {Object} BoardParams
 * @property {string} name - The name of the board.
 * @property {string} [owner=currentUserId()] - The owner of the board.
 * @property {string} [id=Date.now().toString()] - The ID of the board.
 * @property {Array<string>} [collaborators=[]] - The collaborators of the board.
 * @property {number} [dateOfCreation=Date.now()] - The date of creation.
 * @property {number} [dateOfLastEdit=Date.now()] - The date of last edit.
 * @property {...Object<string, Task>} [tasks={}] - The tasks associated with the board.
 * @property {...Object<string, string>} [categories={}] - The categories of the board.
 */

/**
 * Class representing a Board.
 * @extends BaseClass
 * @implements {BoardParams}
 */
export class Board extends BaseClass {
	name;
	owner;
	id;
	collaborators;
	dateOfCreation;
	dateOfLastEdit;
	tasks;
	categories;

	/**
	 * Creates an instance of Board.
	 * @param {BoardParams} boardParams - The parameters for the Board.
	 */
	constructor({ name, owner = currentUserId(), id = Date.now().toString(), collaborators = [], dateOfCreation = Date.now(), dateOfLastEdit = Date.now(), tasks = {}, categories = {} }) {
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
	 * @param {import("./task.class.js").TaskParams} taskData - The data of the task to be added.
	 * @returns {Promise<Task>} The newly added task.
	 */
	async addTask(taskData) {
		if (typeof taskData !== "object") return;
		const task = new Task(taskData);
		task.color = this.categories[taskData.category];
		task.boardId = this.id;
		this.tasks[task.id] = cloneDeep(task);
		const user = STORAGE.currentUser;
		await this.update();

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
		if (!STORAGE.currentUser.contacts.includes(collaboratorId)) return error("collaboratorId not in contacts!");
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
		if (STORAGE.currentUserId() !== this.owner) return error(`not the owner of "${this.name}"!`);
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
