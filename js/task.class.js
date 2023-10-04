class Task extends BaseClass {
    constructor({ id = Date.now().toString(), type = "to-do", title, description, category = "default", assignedTo = [], dueDate, priority, subTasks = [], boardId }) {
        super();
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.category = category;
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
        const collaborators = BOARDS[this.boardId].collaborators;
        if (!(collaborators.includes(userId)) && userId !== USER.id) return error('user not in collaborators!');
        if (this.assignedTo.includes(userId)) return error('user already assigned!')
        this.assignedTo.push(userId);
        return this.update();
    }

    update = () => {
        Object.assign(BOARDS[this.boardId].tasks[this.id], this);
        return REMOTE_setData(`boards/${this.boardId}/tasks`, {[this.id]: this});
    }
}