class Account {
    constructor({ id = Date.now(), name, email, password, img = "", loggedIn = 'false', boards = [], contacts = [] }) {
        this.userData = {
            id,
            name,
            email,
            password,
            img,
            loggedIn,
            boards,
            contacts
        }
    }
}