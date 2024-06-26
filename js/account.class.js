import { BaseClass } from "./base.class.js";

export class Account extends BaseClass {
    constructor({
        name,
        email,
        color = '#D1D1D1',
        id = `${Date.now()}`,
        img = "",
        loggedIn = 'false',
        boards = [],
        contacts = [],
        phone = 'N/A',
        notifications = [],
        pendingFriendshipRequests = []
    }) {
        super();
        this.name = name;
        this.email = email;
        this.color = color;
        this.id = `${id}`;
        this.img = img;
        this.loggedIn = loggedIn;
        this.boards = boards;
        this.contacts = contacts;
        this.phone = phone;
        this.notifications = notifications;
        this.pendingFriendshipRequests = pendingFriendshipRequests;
    }
}