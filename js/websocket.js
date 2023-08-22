const initWebsocket = () => {
    SOCKET = io("wss://join-websocket.onrender.com", {
        query: {
            uid: USER.id
        }
    });

    SOCKET.io.on('error', e => {
        SOCKET.close();
        // SOCKET = null;
        SOCKET.io.on('connection', e => {
            log('reconnected!')
        })
        setTimeout(initWebsocket, 1 * 60 * 1000);
    });


    SOCKET.on('notification', async () => {
        console.log(`Your received a new Notification!`);
        notifySound.play();
        await getUser();
        checkNotifications();
    });
}

const sendMessage = (contactIds) => {
    const ids = (Array.isArray(contactIds)) ? contactIds : [contactIds];
    // if (!CONTACTS[contactId]) return error(`user '${contactId}' not in contacts!`);
    if (!contactIds.every(id => CONTACTS.hasOwnProperty(id))) return error(`user not in contacts!`);
    SOCKET.emit('notification', {to: contactIds});
}