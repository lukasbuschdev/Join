class Board extends BaseClass {
    constructor({
        name,
        owner = currentUserId(),
        id = Date.now().toString(),
        collaborators = [],
        ["date-of-creation"]: dateOfCreation = Date.now().toString(),
        ["date-of-last-edit"]: dateOfLastEdit = Date.now().toString(),
        tasks = {
            "to-do": {},
            "in-progress": {},
            "awaiting-feedback": {},
            "done": {}
        },
        categories = {
            "Design": "#FF7A00",
            "Media": "#FFC701",
            "Sales": "#FC71FF",
            "Backoffice": "#1FD7C1"
        }
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
        const task = new Task(taskData, true);
        task.color = this.categories[taskData.category];
        task.boardId = this.id;
        this.tasks[taskData.type][task.id] = task;
        await this.update();
        return task;
    }

    getTasks = async (taskIds) => {
        let tasks = [];
        const allTasks = Object.values(await REMOTE_getData(`boards/${this.id}/tasks`))
        taskIds.for(
            id => allTasks.for(
                task => {
                    if (task.hasOwnProperty(id)) tasks.push(task[id]);
                }
            )
        )
        return tasks.map(
            task => new Task(task)
        )
    }

    editTask = async (taskId) => {
        let task;
        Object.values(this.tasks).for(
            taskType => {
                if (taskType[taskId]) task = taskType[taskId];
            } 
        );
    };
    
    addCollaborator = async (collaboratorId) => {
        const contacts = await REMOTE_getData(`users/${currentUserId()}/contacts`);
        if (!contacts.includes(collaboratorId)) return error('collaboratorId not in contacts!');
        this.collaborators.push(collaboratorId);
        return this.update();
    }
    
    addCategory = async (name, color) => {
        this.categories[name] = color;
        return this.update;
    }

    update = async () => {
        this.dateOfLastEdit = Date.now();
        return REMOTE_setData(`boards`, {[this.id]: this});
    }
}