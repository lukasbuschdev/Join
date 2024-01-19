class Notify {
    constructor(notification) {
        Object.entries(notification).for(
            ([key, value]) => this[key] = value
        );
        this.id = `${Date.now()}`;
    }

    async send () {
        if (SOCKET.disconnected) return error('network-error');
        await this.recipients.forAwait((recipientId) => REMOTE_setData(`users/${recipientId}/notifications`, {[this.id]: removeMethods(this)}));
        SOCKET.emit('notification', {to: this.recipients});
    };
}