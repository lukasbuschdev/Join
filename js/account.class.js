class Account {
    constructor({ id = Date.now(), name, email, img = "", loggedIn = 'false', boards = [], contacts = [], phone = 'N/A' }) {
        this.userData = {
            id,
            name,
            email,
            phone,
            img,
            loggedIn,
            boards,
            contacts
        }
    }
}