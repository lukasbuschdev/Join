import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
import { error, notification } from "./utilities.js";
import { checkNotifications } from "../index/index/index.js";
import { STORAGE } from "./storage.js";

class WebSocket {
    url = "wss://join-websocket.onrender.com";
    notifySound = new Audio('/Join/assets/audio/mixkit-soap-bubble-sound-2925.wav');
    #socket;

    get socket() {
        if(!this.#socket) throw new Error(`io not defined! call SOCKET.init()`);
        return this.#socket;
    }

    set socket(value) {
        this.#socket = value
    }

    constructor() { }
    
    init() {
        const user = STORAGE.currentUser
        if (!user) throw Error(`can't use websocket without a currentUser!`);
        this.socket = io(this.url, { query: { uid: user.id } });
        this.socket.io.on('close', () => notification('websocket-disconnect'));
        this.socket.io.on('reconnect', () => notification('websocket-reconnect'));
        this.socket.io.on('notification', async () => {
            this.notifySound.play();
            await STORAGE.init();
            checkNotifications();
        });
    }

    sendMessage(recipientIds) {
        if (!recipientIds.every(id => STORAGE.currentUserContacts.hasOwnProperty(id))) return error(`user '${id}' not in contacts!`);
        this.socket.emit('notification', { to: recipientIds });
    }

    uploadImg(img) {
        const extension = img.type.split('/')[1];
        this.socket.emit('uploadImg', img, extension);
    }

    removeImg() {
        this.socket.emit('deleteImg');
    }
}

export const SOCKET = new WebSocket();