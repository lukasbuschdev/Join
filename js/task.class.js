class Task {
    constructor({ type, title, description = "", category = "default", ["assigned-to"]: assignedTo = [], dueDate = "", priority, progress = "", subTasks = "" }) {
        this.type = type,
        this.title = title,
        this.description = description,
        this.category = category,
        this["assigned-to"] = assignedTo,
        this.dueDate = dueDate,
        this.priority = priority,
        this.subTasks = subTasks,
        this.progres = progress
    }
    
    changePriority = (priority) => {
        if (!(priority == 'urgent' || priority == 'medium' || priority == 'low')) {
            console.error(`priority '${priority}' does not exist!`)
        }
        this.priority = priority;
    }

}