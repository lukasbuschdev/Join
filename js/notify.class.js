import { STORAGE } from "./storage.js";
import { cloneDeep } from "./utilities.js";

/**
 * @typedef {Object} Notification
 * @property {Array<string>} recipients
 * @property {string} boardName
 * @property {string} boardId
 * @property {string} id
 * @property {string} message
 * @property {"boardInvite"|"assignTo"} type
 */

/**
 * Class representing a notification.
 * @implements {Notification}
 */
export class Notify {
	/** @type {string} */
	id;

	/**
	 * Create a notification.
	 * @param {Notification} notification - The notification data.
	 */
	constructor(notification) {
		Object.assign(this, notification);
		this.id = Date.now().toString();
	}

	/**
	 * Send the notification to the recipients.
	 * @returns {Promise<void>} A promise that resolves when the notification is sent.
	 */
	async send() {
		if (STORAGE.webSocket.socket.disconnected) return error("network-error");
		await Promise.all(this.recipients.map((id) => STORAGE.set(`users/${id}/notifications/${this.id}`, cloneDeep(this))));
		STORAGE.webSocket.socket.emit("notification", { to: this.recipients });
	}
}
