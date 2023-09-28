const initWebsocket = () => {
    SOCKET = io("wss://join-websocket.onrender.com", {
        query: {
            uid: USER.id
        }
    });

    SOCKET.io.on('error', e => {
        log('SOCKET error!')
        // SOCKET.close();
        // setTimeout(initWebsocket, 1 * 60 * 1000);
    });

    SOCKET.io.on('close', e => {
        log('SOCKET closed!', e)
        checkNotifications();
    }, e => {log('SOCKET closed2!: ', e)})

    SOCKET.io.on('disconnect', e => {
        log('SOCKET disconnected!')
    })
    
    SOCKET.io.on('reconnect', e => {
        log('reconnected!')
    })

    SOCKET.on('notification', async () => {
        console.log(`Your received a new Notification!`);
        notifySound.play();
        await getUser();
        checkNotifications();
    });

    SOCKET.on('account-in-use', () => {
        goTo('login', {reroute: true});
    })
}

const sendMessage = (recipients) => {
    if (!recipients.every(id => CONTACTS.hasOwnProperty(id))) return error(`user '${id}' not in contacts!`);
    SOCKET.emit('notification', {to: recipients});
}