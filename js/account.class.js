class Account {
    constructor(name, email, password) {
        this.id = Date.now();
        this.name = name;
        this.email = email;
        this.password = password;
        this.contacts = [];
    }
}