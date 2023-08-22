class Chat extends BaseClass {
    constructor({id = Date.now().toString(), recipients, messages = []}) {
        super();
        this.id = id,
        this.recipients = recipients,
        this.messages = messages
    };

    sendMessage = (message, sender = USER.id) => {
        this.messages.push({
            message,
            timeStamp: Date.now().toString(),
            sender
        });
        const messageNotification = new Notify({
            type: "message",
            sender,
            chatId: this.id
        });
        this.recipients.for(
            recipientId => messageNotification.send(recipientId)
        );
        if (SOCKET) SOCKET.emit('notification', {to: this.recipients});
        return this.update();
    };
    
    update = () => {
        return REMOTE_setData('chats', {[this.id]: this});
    };
}