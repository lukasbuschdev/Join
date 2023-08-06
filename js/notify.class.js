class Notify {
    constructor(notification) {
        Object.entries(notification).for(
            ([key, value]) => this[key] = value
        );
        this.id = `${Date.now()}`;
    }

    send = async () => {
        await REMOTE_setData(`users/${this.recipientId}/notifications`, {[this.id]: removeMethods(this)});
        SOCKET.emit('message', {recipientId: this.recipientId});
    };
}