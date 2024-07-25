import { STORAGE } from "./storage.js";
import { cloneDeep } from "./utilities.js";

/**
 * Class representing a notification.
 */
export class Notify {

	/** @type {string} */
	id;

	/**
	 * Create a notification.
	 * @param {Object} notification - The notification data.
	 * @param {Array<string>} notification.recipients - The recipients of the notification.
	 * @param {string} notification.message - The message of the notification.
	 * @param {string} [notification.type] - The type of the notification.
	 * @param {Date} [notification.timestamp] - The timestamp of the notification.
	 */
	constructor(notification) {
		Object.entries(notification).forEach(([key, value]) => (this[key] = value));
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
