import { User } from "./user.class.js";
import { Board } from "./board.class.js";
import { Task } from "./task.class.js";
import { SESSION_getData, SESSION_setData, STORAGE } from "./storage.js";

/**
 * Represents the state of the application.
 */
class State {
	/**
	 * @type {User | undefined}
	 * @private
	 */
	#currentUser;

	/**
	 * @type {Object<string, User>}
	 */
	allUsers = {};

	/**
	 * @type {Board | undefined}
	 * @private
	 */
	#selectedBoard;

	/**
	 * @type {Task | undefined}
	 * @private
	 */
	#selectedTask;

	/**
	 * Gets the selected board.
	 * @returns {Board | null} The selected board or null if no boards are available.
	 */
	get selectedBoard() {
		if (!STORAGE.currentUser.boards.length) return null;
		if (this.#selectedBoard) return this.#selectedBoard;

		let boardId = SESSION_getData("activeBoard");
		if (!boardId || !(boardId in STORAGE.currentUserBoards))
			boardId = STORAGE.currentUser.boards.at(-1);
		this.selectedBoard = STORAGE.currentUserBoards[boardId];
		return this.#selectedBoard;
	}

	/**
	 * Gets the selected task.
	 * @returns {Task} The selected task.
	 * @throws Will throw an error if the selected task is not defined.
	 */
	get selectedTask() {
		if (!this.#selectedTask) throw new Error(`selectedTask not defined!`);
		return this.#selectedTask;
	}

	/**
	 * Gets the current user.
	 * @returns {User} The current user.
	 * @throws Will throw an error if the current user is not defined.
	 */
	get currentUser() {
		if (!this.#currentUser) throw new Error(`currentUser not defined!`);
		return this.#currentUser;
	}

	/**
	 * Sets the current user.
	 * @param {User} user - The user to set as the current user.
	 * @throws Will throw an error if the provided user is not an instance of User.
	 */
	set currentUser(user) {
		if (!user.constructor.name === "User") throw new Error(user, "is not a User!");
		this.#currentUser = user;
	}

	/**
	 * Sets the selected board.
	 * @param {Board} board - The board to set as the selected board.
	 * @throws Will throw an error if the provided board is not an instance of Board.
	 */
	set selectedBoard(board) {
		if (!board.constructor.name === "Board") throw new Error(board, " is not a Board!");
		SESSION_setData("activeBoard", board.id);
		this.#selectedBoard = board;
	}

	/**
	 * Sets the selected task.
	 * @param {Task} task - The task to set as the selected task.
	 * @throws Will throw an error if the provided task is not an instance of Task.
	 */
	set selectedTask(task) {
		if (!task.constructor.name === "Task") throw new Error(task, "is not a Task!");
		this.#selectedTask = task;
	}
}

export const STATE = new State();
