class Task {
    constructor({ type, category, title, description, priority, progress, ["assigned-to"]: assignedTo }) {
        this.type = type,
        this.category = category,
        this.title = title,
        this.description = description,
        this.priority = priority,
        this.progress = progress,
        this["assigned-to"] = assignedTo
    }
    
    changePriority = (priority) => {
        if (!(priority == 'urgent' || priority == 'medium' || priority == 'low')) {
            console.error(`priority '${priority}' does not exist!`)
        }
        this.priority = priority;
    }

}