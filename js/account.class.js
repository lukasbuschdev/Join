class Account {
    constructor({ id = Date.now(), name, email, password, boards, currentBoard, contacts }) {
        this.userData = {
            id,
            name,
            email,
            password,
            boards,
            currentBoard,
            contacts
        }
    }
}