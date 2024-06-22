export class Notify {
    constructor(notification) {
        Object.entries(notification).for(
            ([key, value]) => this[key] = value
        );
        this.id = `${Date.now()}`;
    }

    async send () {
        if (SOCKET.disconnected) return error('network-error');
        SOCKET.emit('notification', {to: this.recipients});
        return this.recipients.forAwait((recipientId) => REMOTE_setData(`users/${recipientId}/notifications`, {[this.id]: this}));
    };
}