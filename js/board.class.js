class Board {
    constructor({
        owner,
        id = "Testboard-3",
        collaborators = [],
        ["date-of-creation"]: dateOfCreation = Date.now(),
        ["date-of-last-edit"]: dateOfLastEdit = Date.now(),
        tasks = {
            "to-do": [],
            "in-progress": [],
            "awaiting-feedback": [],
            "done": []
        }
    }) {
        this.owner = owner,
        this.collaborators = collaborators,
        this.dateOfCreation = dateOfCreation,
        this.dateOfLastEdit = dateOfLastEdit,
        this.tasks = tasks
    }

    addTask = async (taskData) => {
        const task = new Task(taskData);
        this.tasks[taskData.type].push(task);
        await this.update();
    }
    
    addCollaborator = async (collaboratorId) => {
        this.collaborators.push(collaboratorId);
        await this.update();
    }
    
    update = async () => {
        this.dateOfLastEdit = Date.now();
        return REMOTE_setData(`boards`, {[this.id]: this});
    }
}