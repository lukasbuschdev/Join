import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
import { error, notification } from "./utilities.js";
import { checkNotifications } from "../index/index/index.js";
import { STORAGE } from "./storage.js";

export class WebSocket {
	url = "wss://join-websocket.onrender.com";
	notifySound = new Audio("/Join/assets/audio/mixkit-soap-bubble-sound-2925.wav");
	#socket;
	/**@type {string|null} */

	get socket() {
		if (!this.#socket) throw new Error(`io not defined! call SOCKET.init()`);
		return this.#socket;
	}

	set socket(value) {
		this.#socket = value;
	}

	constructor(storage) {
		this.storage = storage;
	}
	
	init(userId) {
		this.#socket = io(this.url, { query: { uid: userId } });
		this.#socket.on("close", () => notification("websocket-disconnect"));
		this.#socket.on("reconnect", () => notification("websocket-reconnect"));
		this.#socket.on("notification", async () => {
			this.notifySound.play();
			await STORAGE.init();
			checkNotifications();
		});
	}

	uploadImg(img) {
		const extension = img.type.split("/")[1];
		this.socket.emit("uploadImg", img, extension);
	}

	removeImg() {
		this.socket.emit("deleteImg");
	}
}
