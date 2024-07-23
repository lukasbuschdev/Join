import { STORAGE } from "./storage.js";
import { cloneDeep } from "./utilities.js";

export class Notify {
	constructor(notification) {
		Object.entries(notification).forEach(([key, value]) => (this[key] = value));
		this.id = `${Date.now()}`;
	}

	async send() {
		if (STORAGE.webSocket.socket.disconnected) return error("network-error");
		await Promise.all(
			this.recipients.map((id) =>
				STORAGE.set(`users/${id}/notifications/${this.id}`, cloneDeep(this))
			)
		);
		STORAGE.webSocket.socket.emit("notification", { to: this.recipients });
	}
}
