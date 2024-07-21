import { BaseClass } from "./base.class.js";
import { Notify } from "./notify.class.js";
import { STORAGE } from "./storage.js";
import { Task } from "./task.class.js";
import { currentUserId, error } from "./utilities.js";

/**
 * @typedef {Object<string, string} Categories
 * @property {string} name
 * @property {string} color
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

  async addTask(taskData) {
    if (typeof taskData !== "object") return;
    const task = new Task(taskData);
    task.color = this.categories[taskData.category];
    task.boardId = this.id;
    this.tasks[task.id] = task;

    const user = STORAGE.currentUser;
    const notification = new Notify({
      userName: STORAGE.currentUser.name,
      recipients: task.assignedTo.filter((id) => id !== user.id),
      type: "assignTo",
      taskName: task.title,
      boardName: this.name
    });
    notification.send();
    await this.update();
    return task;
  }

  getTasks() {
    return this.tasks.map((task) => new Task(task));
  }

  async addCollaborator(collaboratorId) {
    if (!STORAGE.currentUser.contacts.includes(collaboratorId))
      return error("collaboratorId not in contacts!");
    this.collaborators.push(collaboratorId);
    return this.update();
  }

  async addCategory(name, color) {
    this.categories[name] = color;
    return this.update();
  }

  async getCollaborators() {
    return STORAGE.getUsersById(this.collaborators);
  }

  update() {
    STORAGE.data.boards[this.id] = JSON.parse(JSON.stringify(this));
    return super.update(`boards/${this.id}`);
  }

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
