const initWebsocket = (uid) => {
    const url = "wss://join-websocket.onrender.com";
    // const url = "ws://localhost:10000";
    SOCKET = io(url, {
        query: {
            uid
        }
    });

    SOCKET.io.on('close', e => {
        notification('websocket-disconnect');
    })
    
    SOCKET.io.on('reconnect', e => {
        notification('websocket-reconnect');
    })

    SOCKET.on('notification', async () => {
        notifySound.play();
        await getUser();
        checkNotifications();
    });

    
}

const sendMessage = (recipients) => {
    if (!recipients.every(id => CONTACTS.hasOwnProperty(id))) return error(`user '${id}' not in contacts!`);
    SOCKET.emit('notification', {to: recipients});
}

async function uploadImg(img) {
    const extension = img.type.split('/')[1];
    SOCKET.emit('uploadImg', img, extension);
}

function removeImg() {
    SOCKET.emit('deleteImg');
}