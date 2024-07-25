import { Board } from "./board.class.js";
import { Notify } from "./notify.class.js";
import { User } from "./user.class.js";
import { parse, searchParams } from "./utilities.js";
import { WebSocket } from "./websocket.js";

class Storage {
	STORAGE_URL = "https://join-storage-83306-default-rtdb.europe-west1.firebasedatabase.app";
	#data;
	#isLoaded = false;
	webSocket;

	get data() {
		if (!this.#isLoaded)
			throw Error(`storage not yet initialized! await 'STORAGE.init()' to fix`);
		return this.#data;
	}

	updateAllData() {
		return this.set("", this.data);
	}

	get allUsers() {
		return Object.entries(this.data.users).reduce(
			(all, [id, user]) => ({ ...all, [id]: new User(user) }),
			{}
		);
	}

	get currentUser() {
		const userId = this.currentUserId();
		if (!userId) return;
		return new User(this.data.users[userId]);
	}

	/**
	 * @returns {Object<string, User}
	 */
	get currentUserContacts() {
		return this.currentUser.contacts.reduce(
			(contacts, contactId) => ({
				...contacts,
				[contactId]: new User(this.data.users[contactId])
			}),
			{}
		);
	}

	/**
	 * gets all boards the current user is collaborating on
	 * @returns {Object<string, Board>}
	 */
	get currentUserBoards() {
		const user = this.currentUser;
		return user.boards.reduce((boards, boardId) => {
			if (boardId in this.data.boards) boards[boardId] = new Board(this.data.boards[boardId]);
			else {
				user.boards.remove(boardId);
				user.update();
			}
			return boards;
		}, {});
	}

	/**
	 * gets the active board or the newest board or undefined if the user is not collaborating on any board
	 * @returns {Board|undefined}
	 */
	get activeBoard() {
		return SESSION_getData("activeBoardId") || this.currentUser.boards.at(-1);
	}

	/**
	 * gets all data and returns a storage conainer
	 * @returns {Promise<any>}
	 */
	async init() {
		this.#data = await this.#download();
		this.#isLoaded = true;
		this.webSocket = new WebSocket(this);
		if (this.currentUserId()) {
			this.webSocket.init(this.currentUserId());
		}
		this.delete("boards/1695832128586/collaborators/0");
		return this;
	}

	currentUserId() {
		const uid = searchParams().get("uid");
		return uid == null ? undefined : `${uid}`;
	}

	/**
	 * gets data of the specified path. format: 'directory/subdirectory'
	 * @param {string} path
	 * @returns {User|Board|Notify|undefined}
	 */
	get(path) {
		const formattedPath = path.split("/").join('"]["');
		try {
			return parse(`${JSON.stringify(this.data)}["${formattedPath}"]`);
		} catch (e) {
			return undefined;
		}
	}

	/**
	 * sets the provided value to the specified path. format: 'directory/subdirectory'
	 * @param {string} path
	 * @param {any} upload
	 * @returns {Promise<any>}
	 */
	set(path, value) {
		return this.#upload(path, value);
	}

	async #download(path = "") {
		try {
			const data = await (await fetch(`${this.STORAGE_URL}/${path}.json`)).json();
			if (data) return this.#unpackData(data);
			throw new Error(`download failed. '${path}' not found!`);
		} catch (error) {}
	}

	async #upload(path, upload) {
		try {
			const data = await (
				await fetch(`${this.STORAGE_URL}/${path}.json`, {
					method: "PUT",
					body: JSON.stringify(this.#packData(upload))
				})
			).text();
			if (data) {
				await STORAGE.delete(path.slice(0, path.lastIndexOf("/")) + "/null");
				return this.#unpackData(data);
			}

			throw new Error(`upload failed. '${path}' not found!`);
		} catch (error) {
			return undefined;
		}
	}

	/**
	 * deletes the specified path
	 * @param {string} path
	 * @returns {Promise<null | undefined>}
	 */
	async delete(path) {
		try {
			return (await fetch(`${this.STORAGE_URL}/${path}.json`, { method: "DELETE" })).json();
		} catch (e) {
			return undefined;
		}
	}

	/**
	 * Parses the specified upload data in preparation for upload to firebase. Replaces Arrays with JSON and empty JSON and empty Arrays with placeholder elements.
	 *  @template T
	 *  @param {T} upload
	 * @returns {T}
	 */
	#packData(upload) {
		if (upload === null || !(typeof upload === "object")) return;
		Object.entries(upload).forEach(([key, value]) => {
			// handle array
			if (Array.isArray(value)) {
				delete upload[key];
				upload[`_${key}`] = this.#arrayToJSON(value);
				if (!value.length) upload[`_${key}`] = { _placeholder: "" };
			}

			// handle empty object
			else if (typeof value === "object" && !Object.values(value).length) {
				upload[key] = { null: "null" };
			}

			this.#packData(value);
		});
		return upload;
	}

	/**
	 * Parses the specified firebase download
	 * @param {any} data download data
	 * @returns {any | null}
	 */
	#unpackData(data) {
		if (!data || !(typeof data === "object")) return;
		Object.entries(data).forEach(([key, value]) => {
			// handle arrays
			if (key.startsWith("_")) {
				delete data[key];
				data[key.slice(1)] = value.hasOwnProperty("_placeholder")
					? []
					: Object.values(value);
			}

			// handle empty object
			else if (value.hasOwnProperty("null") && value["null"] === "null") data[key] = {};
			this.#unpackData(value);
		});
		return data;
	}

	getUserByInput(nameOrEmail) {
		const userData = Object.values(this.data.users).find(
			({ name, email }) => name === nameOrEmail || email === nameOrEmail
		);
		if (!userData) return undefined;
		return new User(userData);
	}

	getUsersById(ids) {
		const users = Object.values(this.data.users)
			.filter(({ id }) => ids.includes(id))
			.map((userData) => new User(userData));
		return users;
	}

	#arrayToJSON(array) {
		return array.reduce((json, item, index) => ({ ...json, [index]: item }), {});
	}

	async syncBoards() {
		Object.values(this.allUsers).forEach((user) => {
			user.boards.forEach((boardId) => {
				if (!(boardId in this.data.boards)) {
					user.boards.remove(boardId);
					user.update();
				}
			});
		});
	}
}

export const STORAGE = new Storage();

/**
 * sets an item in local storage
 * @param {string} key
 * @param {any} value
 */
export function LOCAL_setData(key, value) {
	localStorage.setItem(key, typeof value === "object" ? JSON.stringify(value) : value);
}

/**
 * gets an item from local storage by key
 * @param {string} key
 * @returns {any}
 */
export function LOCAL_getData(key) {
	let data = localStorage.getItem(key);
	try {
		return JSON.parse(data);
	} catch (e) {
		return data;
	}
}

/**
 * removes an item from local storage by key
 * @param {string} key
 */
export function LOCAL_removeData(key) {
	localStorage.removeItem(key);
}

/**
 * sets an item in session storage
 * @param {string} key
 * @param {any} value
 */
export function SESSION_setData(key, value) {
	// i hate this.
	if(key === "activeBoard" && !Number.isNaN(Number(value))) value = Number(value);
	sessionStorage.setItem(key, JSON.stringify(value));
}

/**
 * gets an item from session storage by key
 * @param {string} key
 * @returns {string | undefined}
 */
export function SESSION_getData(key) {
	const value = sessionStorage.getItem(key);
	// if(key === "activeBoard") console.log( value, STORAGE.currentUserBoards, STORAGE.currentUserBoards[value])
	switch (value) {
		case "null":
		case "undefined":
		case "NaN":
		case "false":
			return undefined;
		default:
			return value;
	}
}

/**
 * removes an item from session storage by key
 * @param {string} key
 */
export function SESSION_removeData(key) {
	sessionStorage.removeItem(key);
}
