class Task extends BaseClass {
    constructor({ title, description = "", category = "default", ["assigned-to"]: assignedTo = [], dueDate = "", priority, progress = "", subTasks = [] }, methods) {
        super();
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

const newTask = { // hier rein müssen dann die input werte von add Task
    type: "awaiting-feedback",
    category: "design",
    title: "Bla Bla Bla...",
    priority: "medium",
    assignedTo: ['1689153888103', '1689153951244'],
    dueDate: "20.09.2023",
    subTasks: []
}

async function addTask (taskData) {  // so ca würde die funktion dann aussehen
    const boardData = await REMOTE_getData(`boards/Testboard-5`);
    // Testboard-5 halt ersetzen durch ${boardId}

    const currentBoard = new Board(boardData, true);
    // true muss als zweiter parameter, damit du die boardfunktionen wie zb board.addTask() benutzen kannst

    const addedTask = await currentBoard.addTask(taskData);
    // ...
}