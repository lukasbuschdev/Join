import { BaseClass } from "./base.class.js";

/**
 * @typedef {Object} Notification
 * @property {Array<string>} recipients
 * @property {string} boardName
 * @property {string} boardId
 * @property {string} id
 * @property {string} ownerName
 * @property {"boardInvite"|"assignTo"} type
 */

export class Account extends BaseClass {
    /**
     * 
     * @param {{name: string, email: string, color: string | undefined, id: string | undefined, img: string, loggedIn: string, boards: string[], contacts: string[], phone: string, notifications: {id: Notify}, pendingFriendshipRequests: string[]}} param0 
     */

      /** @type {string} */
    name;

    /** @type {string} */
    email;

    /** @type {string} */
    color;
    
    /** @type {string} */
    id;

    /** @type {string} */
    img;

    /** @type {"false"|"true"} */
    loggedIn;

    /** @type {Array<string>} */
    boards = [];

    /** @type {Array<string>} */
    contacts = [];

    /** @type {string} */
    phone = 'N/A';

    /** @type {Object<string, Notification} */
    notifications = {};

    /** @type {Array<string>} */
    contacts = [];
    
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