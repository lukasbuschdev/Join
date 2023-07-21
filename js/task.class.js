class Task {
    constructor({ type, title, description, category, ["assigned-to"]: assignedTo = [], dueDate, priority, progress }) {
        type,
        title,
        description,
        category,
        this["assigned-to"] = assignedTo,
        dueDate,
        priority,
        subTasks,
        progress
    }
    
    changePriority = (priority) => {
        if (!(priority == 'urgent' || priority == 'medium' || priority == 'low')) {
            console.error(`priority '${priority}' does not exist!`)
        }
        this.priority = priority;
    }

}