import { BaseClass } from "./base.class.js";

export class Account extends BaseClass {
    constructor({ id = `${Date.now()}`, name, email, img = "", color, loggedIn = 'false', boards = [], contacts = [], phone = 'N/A', friendRequests = [], notifications = [], chats = [] }) {
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
        this.notifications = notifications;
        this.chats = chats;
    }
}