class Account {
    constructor({ id = Date.now(), name, email, password }) {
        this.userData = {
            id,
            name,
            email,
            password,
            contacts: []
        }
    }
}