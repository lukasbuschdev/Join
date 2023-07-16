class Account {
    constructor({ id = Date.now(), name, email, img = "", color, loggedIn = 'false', boards = [], contacts = [], phone = 'N/A' }) {
        this.userData = {
            id,
            name,
            email,
            phone,
            img,
            color,
            loggedIn,
            boards,
            contacts
        }
    }
}