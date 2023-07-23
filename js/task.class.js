class Task {
    constructor({ type, title, description = "", category = "default", ["assigned-to"]: assignedTo = [], dueDate = "", priority, progress = "", subTasks = "" }, methods) {
        this.type = type;
        this.title = title;
        this.description = description;
        this.category = category;
        this["assigned-to"] = assignedTo;
        this.dueDate = dueDate;
        this.priority = priority;
        this.subTasks = subTasks;
        this.progress = progress;
        return (methods) ? this : removeMethods(this); 
    }
    
    changePriority = (priority) => {
        if (!(priority == 'urgent' || priority == 'medium' || priority == 'low')) {
            console.error(`priority '${priority}' does not exist!`)
        }
        this.priority = priority;
    }

}