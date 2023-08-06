class Account extends BaseClass {
    constructor({ id = `${Date.now()}`, name, email, img = "", color, loggedIn = 'false', boards = [], contacts = [], phone = 'N/A', friendRequests = [], notifications = [] }) {
        super();
        this.name = name;
        this.id = `${id}`;
        this.email = email;
        this.phone = phone;
        this.img = img;
        this.color = color;
        this.loggedIn = loggedIn;
        this.boards = boards;
        this.contacts = contacts;
        this.friendRequests = friendRequests;
        this.notifications = notifications;
    }
}