const initWebsocket = () => {
    SOCKET = io("wss://join-websocket.onrender.com", {
        query: {
            uid: USER.id
        }
    });

    SOCKET.io.on('error', e => {
        log('SOCKET error!')
    });

    SOCKET.io.on('close', e => {
        log('SOCKET closed!', e)
        notification('websocket-disconnect');
    })

    SOCKET.io.on('disconnect', e => {
        log('SOCKET disconnected!')
    })
    
    SOCKET.io.on('reconnect', e => {
        log('reconnected!')
        notification('websocket-reconnect');
    })

    SOCKET.on('notification', async () => {
        console.log(`Your received a new Notification!`);
        notifySound.play();
        await getUser();
        checkNotifications();
    });

    SOCKET.on('account-in-use', () => {
        goTo('login', {reroute: true, search: '?account_in_use'});
    })
}

const sendMessage = (recipients) => {
    if (!recipients.every(id => CONTACTS.hasOwnProperty(id))) return error(`user '${id}' not in contacts!`);
    SOCKET.emit('notification', {to: recipients});
}