import { STORAGE } from "./storage.js";
import { SOCKET } from "./websocket.js";

export class Notify {
    constructor(notification) {
        Object.entries(notification).forEach(
            ([key, value]) => this[key] = value
        );
        this.id = `${Date.now()}`;
    }

    async send() {
        if(SOCKET.socket.disconnected) return error('network-error');
        SOCKET.socket.emit('notification', { to: this.recipients });
        return Promise.all( this.recipients.map((id) => STORAGE.set(`users/${ id }/notifications/${ this.id }`, this)));
    };
}