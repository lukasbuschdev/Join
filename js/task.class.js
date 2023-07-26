class Task extends BaseClass {
    constructor({ id = Date.now().toString(), type = "to-do", title, description = "", category = "default", color = "#d1d1d1", assignedTo = [], dueDate = "", priority, subTasks = [], boardId }, methods) {
        super();
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.category = category;
        this.color = color;
        this.assignedTo = assignedTo;
        this.dueDate = dueDate;
        this.priority = priority;
        this.subTasks = subTasks;
        this.boardId = boardId;
    }
    
    changePriority = (priority) => {
        if (!(priority == 'urgent' || priority == 'medium' || priority == 'low')) {
            console.error(`priority '${priority}' does not exist!`)
        }
        this.priority = priority;
        return this.update();
    }

    addSubtask = (name) => {
        this.subTasks.push({
            name: name,
            done: false
        });
        return this.update();
    }

    finishSubtask = (name) => {
    }

    assignTo = async (userId) => {
        const collaborators = await REMOTE_getData(`boards/${this.boardId}/collaborators`);
        if (!collaborators.includes(userId)) return error('user not in collaborators!');
        this.assignedTo.push(userId);
        return this.update();
    }

    update = () => {
        return REMOTE_setData(`boards/${this.boardId}/tasks/${this.type}`, {[this.id]: this});
    }
}

const newTask = { // hier rein müssen dann die input werte von add Task
    type: "awaiting-feedback",
    category: "design",
    title: "Bla Bla Bla...",
    priority: "medium",
    assignedTo: ['1689153888103', '1689153951244'],
    dueDate: "20.09.2023",
    subTasks: []
}