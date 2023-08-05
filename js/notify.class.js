class Notify {
    constructor(notification) {
        this.id = Date.now();
        this.recipientId = notification.recipient;
        this.type = Object.keys(notification)[1];
        Object.entries(notification[this.type]).for(
            ([key, value]) => this[key] = value
        );
    }

    send = async () => {
        await REMOTE_setData(`users/${this.recipientId}/notifications`, {[this.id]: removeMethods(this)});
        SOCKET.emit('message', {recipientId: this.recipientId});
    };
}