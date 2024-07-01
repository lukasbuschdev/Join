import { User } from "./user.class.js";
import { Board } from "./board.class.js";
import { Task } from "./task.class.js";
import { SESSION_getData, SESSION_removeData, SESSION_setData, STORAGE } from "./storage.js";

class State {
  /** @type {User | undefined} */
  #currentUser;
  /** @type {{id: User}} */
  allUsers = {};
  /** @type {Board | undefined} */
  #selectedBoard;
  /** @type {Task | undefined} */
  #selectedTask;

  get selectedBoard() {
    if(!STORAGE.currentUser.boards.length) return null;
    if(this.#selectedBoard) return this.#selectedBoard;

    let boardId = SESSION_getData('activeBoard');
    if(!boardId || !(boardId in STORAGE.currentUserBoards)) boardId = STORAGE.currentUser.boards.at(-1);
    this.selectedBoard = STORAGE.currentUserBoards[boardId];
    return this.#selectedBoard;
  }

  get selectedTask() {
    if(!this.#selectedTask) throw Error(`selectedTask not defined!`);
    return this.#selectedTask;
  } 

  get currentUser() {
    if (!this.#currentUser) throw Error(`currentUser not defined!`);
    return this.#currentUser;
  }

  /** @param {User} */
  set currentUser(user) {
    if(!user.constructor.name === "User") throw Error(user, ' is not a User!'); 
    this.#currentUser = user;
  }

  /** @param {Board} */
  set selectedBoard(board) {
    if(!board.constructor.name === "Board") throw Error(board, ' is not a Board!');
    SESSION_setData('activeBoard', board.id);
    this.#selectedBoard = board;
  }

  /** @param {Task} task */
  set selectedTask(task) {
    if(!task.constructor.name === "Task") throw Error(task, ' is not a Task!');
    this.#selectedTask = task;
  }
}

export const STATE = new State();