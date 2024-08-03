import { io } from "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.esm.min.js";
import { notification } from "./utilities.js";
import { checkNotifications } from "../index/index/index.js";
import { STORAGE } from "./storage.js";

export class WebSocket {
	url = "wss://join-websocket.onrender.com";
	notifySound = new Audio("/Join/assets/audio/mixkit-soap-bubble-sound-2925.wav");
	#socket;
	/** @type {string|null} */
	storage;

	/**
	 * Gets the WebSocket connection.
	 * @returns {WebSocket} The WebSocket connection.
	 * @throws Will throw an error if the WebSocket connection is not initialized.
	 */
	get socket() {
		if (!this.#socket) throw new Error(`io not defined! call SOCKET.init()`);
		return this.#socket;
	}

	/**
	 * Sets the WebSocket connection.
	 * @param {WebSocket} value - The WebSocket connection.
	 */
	set socket(value) {
		this.#socket = value;
	}

	/**
	 * Creates an instance of WebSocket.
	 * @param {Storage} storage - The storage instance.
	 */
	constructor(storage) {
		this.storage = storage;
	}

	/**
	 * Initializes the WebSocket connection and sets up the event listeners.
	 * @param {string} userId - The user ID for the WebSocket connection.
	 */
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

	/**
	 * Uploads the image of the current user through the WebSocket connection.
	 * @param {File} img - The image file to upload.
	 */
	uploadImg(img) {
		const extension = img.type.split("/")[1];
		this.socket.emit("uploadImg", img, extension);
	}

	/**
	 * Removes the image of the current user through the WebSocket connection.
	 */
	removeImg() {
		this.socket.emit("deleteImg");
	}
}
