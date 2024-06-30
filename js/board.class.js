import { BaseClass } from "./base.class.js";
import { Notify } from "./notify.class.js";
import { REMOTE_removeData, REMOTE_setData, STORAGE, getBoards, getUsersById } from "./storage.js";
import { Task } from "./task.class.js";
import { currentUserId, error } from "./utilities.js";

export class Board extends BaseClass {
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

    addTask = async (taskData) => {
        if (typeof taskData !== "object") return;
        const task = new Task(taskData);
        task.color = this.categories[taskData.category];
        task.boardId = this.id;
        this.tasks[task.id] = task;

        const user = STORAGE.currentUser;
        const notification = new Notify({
            userName: STORAGE.currentUser.name,
            recipients: task.assignedTo.filter(id => id !== user.id),
            type: "assignTo",
            taskName: task.title,
            boardName: this.name
        });
        notification.send();
        await this.update();
        return task;
    }

    getTasks = () => {
        let allTasks = BOARDS[this.id].tasks;
        return allTasks.map(task => new Task(task));
    }
    
    addCollaborator = async (collaboratorId) => {
        if (!USER.contacts.includes(collaboratorId)) return error('collaboratorId not in contacts!');
        this.collaborators.push(collaboratorId);
        return this.update();
    }
    
    addCategory = async (name, color) => {
        this.categories[name] = color;
        return this.update();
    }

    getCollaborators = async () => {
        return getUsersById(this.collaborators);
    }

    update() {
        return STORAGE.set(`boards/${this.id}`, this)
    }

    delete() {
        if (USER.id !== this.owner) return error(`not the owner of "${this.name}"!`);
        delete BOARDS[this.id];
        return REMOTE_removeData(`boards/${this.id}`);
    }
}