import { STORAGE } from "./storage.js";
import { SOCKET } from "./websocket.js";

export class Notify {
    constructor(notification) {
        Object.entries(notification).for(
            ([key, value]) => this[key] = value
        );
        this.id = `${Date.now()}`;
    }

    async send () {
        if (SOCKET.socket.disconnected) return error('network-error');
        SOCKET.socket.emit('notification', {to: this.recipients});
        return this.recipients.forAwait((recipientId) => STORAGE.set(`users/${recipientId}/notifications/${this.id}`, this));
    };
}