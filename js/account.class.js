class Account {
    constructor({ id = Date.now(), name, email, img = "", loggedIn = 'false', boards = [], contacts = [] }) {
        this.userData = {
            id,
            name,
            email,
            img,
            loggedIn,
            boards,
            contacts
        }
    }
}