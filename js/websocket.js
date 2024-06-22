import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
import { getUser } from "./storage.js";
import { error, notification } from "./utilities.js";
import { checkNotifications } from "../index/index/index.js";

export function initWebsocket() {
    const url = "wss://join-websocket.onrender.com";
    // const url = "ws://localhost:10000";
    // window.USER.socket = io(url, {
    //     query: {
    //         uid: window.USER.id
    //     }
    // });

    // window.USER.socket.io.on('close', e => {
    //     notification('websocket-disconnect');
    // })
    
    // window.USER.socket.io.on('reconnect', e => {
    //     notification('websocket-reconnect');
    // })

    // window.USER.socket.on('notification', async () => {
    //     notifySound.play();
    //     await getUser();
    //     checkNotifications();
    // });
}

export function sendMessage (recipients) {
    if (!recipients.every(id => CONTACTS.hasOwnProperty(id))) return error(`user '${id}' not in contacts!`);
    socket.emit('notification', {to: recipients});
}

export async function uploadImg(img) {
    const extension = img.type.split('/')[1];
    socket.emit('uploadImg', img, extension);
}

export function removeImg() {
    socket.emit('deleteImg');
}