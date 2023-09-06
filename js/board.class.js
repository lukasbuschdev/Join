class Board extends BaseClass {
    constructor({
        name,
        owner = currentUserId(),
        id = Date.now().toString(),
        collaborators = [],
        ["date-of-creation"]: dateOfCreation = Date.now().toString(),
        ["date-of-last-edit"]: dateOfLastEdit = Date.now().toString(),
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

        const notification = new Notify({
            userName: USER.name,
            recipients: task.assignedTo,
            type: "assignTo",
            taskName: task.name,
            boardName: this.name
        });
        notification.send();
        log()
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

    update = async () => {
        this.dateOfLastEdit = Date.now();
        await REMOTE_setData(`boards`, {[this.id]: this});
        return getBoards();
    }
}