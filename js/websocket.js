const initWebsocket = (uid) => {
    SOCKET = io("wss://join-websocket.onrender.com", {
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

    SOCKET.on('imgId', id => {
        console.log(Date.now() - window.startTime);
        REMOTE_setData(`users/${uid}`, {img: `https://drive.google.com/uc?export=view&id=${id}`});
    })
}

const sendMessage = (recipients) => {
    if (!recipients.every(id => CONTACTS.hasOwnProperty(id))) return error(`user '${id}' not in contacts!`);
    SOCKET.emit('notification', {to: recipients});
}

async function uploadImg(img) {
    const extension = img.type.split('/')[1];
    console.log(extension)
    console.log("starting upload");
    window.startTime = Date.now();
    SOCKET.emit('uploadImg', img, extension);
}