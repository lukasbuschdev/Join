import { BaseClass } from "./base.class.js";

export class Account extends BaseClass {
    /**
     * 
     * @param {{name: string, email: string, color: string | undefined, id: string | undefined, img: string, loggedIn: string, boards: string[], contacts: string[], phone: string, notifications: {id: Notify}, pendingFriendshipRequests: string[]}} param0 
     */
    constructor({
        name,
        email,
        color = '#D1D1D1',
        id = Date.now().toString(),
        img = "",
        loggedIn = 'false',
        boards = [],
        contacts = [],
        phone = 'N/A',
        notifications = {},
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