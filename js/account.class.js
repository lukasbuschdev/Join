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

/**
 * @typedef {Object} AccountParams
    * @property {string} [id=Date.now().toString()]
    * @property {string} name
    * @property {string} email
    * @property {string} [color="#D1D1D1"]
    * @property {string} [img=""]
    * @property {"true" | "false"} [loggedIn="false"]   
    * @property {Array<string>} [boards=[]]  
    * @property {Array<string>} [contacts=[]]  
    * @property {Array<string>} [pendingFriendshipRequests=[]]  
    * @property {string} [phone="N/A"]  
    * @property {Object<string, Notification>} [notifications={}]  
 */

/**
 * @implements {AccountParams}
 */
export class Account extends BaseClass {
    id;
    name;
    email;
    color;
    img;
    loggedIn;
    boards = [];
    contacts = [];
    phone = 'N/A';
    notifications = {};
    
/**
 * 
 * @param {AccountParams} accountData
*/
    constructor({
        id = Date.now().toString(),
        name,
        email,
        color = '#D1D1D1',
        img = "",
        loggedIn = 'false',
        boards = [],
        contacts = [],
        phone = 'N/A',
        notifications = {},
        pendingFriendshipRequests = []
    }) {
        super();
        this.id = id;
        this.name = name;
        this.email = email;
        this.color = color;
        this.img = img;
        this.loggedIn = loggedIn;
        this.boards = boards;
        this.contacts = contacts;
        this.phone = phone;
        this.notifications = notifications;
        this.pendingFriendshipRequests = pendingFriendshipRequests;
    }
}