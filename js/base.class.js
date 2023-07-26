class BaseClass {
    constructor() {
    }

    setProperty = (property, value) => {
        this[property] = value;
        this.update();
    }

    getPropertyValue = (property) => this[property] ?? undefined;
}

// let userId = "1689153888103";
// let boardData = {
//     name: "Example Board"
// }


// const user = await REMOTE_getData(`users/${userId}`, true);

// if (user) {
//     await user.addBoard(boardData);
// }

// let taskData = {
//     title: "Website Redesign",
//     description: "Upade the main Layout",
//     priority: "urgent",
//     category: "Backoffice"
// }



