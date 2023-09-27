class Notify {
    constructor(notification) {
        Object.entries(notification).for(
            ([key, value]) => this[key] = value
        );
        this.id = `${Date.now()}`;
    }

    send = async () => {
        this.collaborators.forAwait(recipientId => REMOTE_setData(`users/${recipientId}/notifications`, {[this.id]: removeMethods(this)}));
        SOCKET.emit('notification', {to: this.collaborators});
    };
}