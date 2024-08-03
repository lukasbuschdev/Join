import { Board } from "./board.class.js";
import { Notify } from "./notify.class.js";
import { User } from "./user.class.js";
import { parse, searchParams } from "./utilities.js";
import { WebSocket } from "./websocket.js";

class Storage {
	STORAGE_URL = "https://join-storage-83306-default-rtdb.europe-west1.firebasedatabase.app";

	/**
	 * @type {Object | undefined}
	 * @private
	 */
	#data;

	/**
	 * @type {boolean}
	 * @private
	 */
	#isLoaded = false;

	/**
	 * @type {WebSocket | undefined}
	 */
	webSocket;

	/**
	 * Gets the data from storage.
	 * @returns {Object} The data from storage.
	 * @throws Will throw an error if the storage is not yet initialized.
	 */
	get data() {
		if (!this.#isLoaded) throw Error(`storage not yet initialized! await 'STORAGE.init()' to fix`);
		return this.#data;
	}

	/**
	 * Updates all data in the storage.
	 * @returns {Promise<any>}
	 */
	updateAllData() {
		return this.set("", this.data);
	}

	/**
	 * Gets all users.
	 * @returns {Object<string, User>} An object containing all users.
	 */
	get allUsers() {
		return Object.entries(this.data.users).reduce((all, [id, user]) => ({ ...all, [id]: new User(user) }), {});
	}

	/**
	 * Gets the current user.
	 * @returns {User | undefined} The current user.
	 */
	get currentUser() {
		const userId = this.currentUserId();
		if (!userId) return;
		return new User(this.data.users[userId]);
	}

	/**
	 * Gets all contacts of current User.
	 * @returns {Object<string, User>}
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
	 * Gets all boards the current user is collaborating on.
	 * @returns {Object<string, Board>} An object containing all boards.
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
	 * Gets all data and returns a storage container.
	 * @returns {Promise<Storage>}
	 */
	async init() {
		this.#data = await this.#download();
		this.#isLoaded = true;
		this.webSocket = new WebSocket(this);
		if (this.currentUserId()) this.webSocket.init(this.currentUserId());
		return this;
	}

	/**
	 * Gets the current user ID.
	 * @returns {string | undefined} The current user ID.
	 */
	currentUserId() {
		const uid = searchParams().get("uid");
		return uid == null ? undefined : `${uid}`;
	}

	/**
	 * Gets data of the specified path. Format: 'directory/subdirectory'
	 * @param {string} path - The path to get data from.
	 * @returns {User | Board | Notify | undefined} The data at the specified path.
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
	 * Sets the provided value to the specified path. Format: 'directory/subdirectory'
	 * @template T
	 * @param {string} path - The path to set data to.
	 * @param {T} value - The value to set.
	 * @returns {Promise<T>}
	 */
	set(path, value) {
		return this.#upload(path, value);
	}

	/**
	 * Downloads data from the specified path.
	 * @param {string} [path=""] - The path to download data from.
	 * @returns {Promise<any>}
	 * @private
	 */
	async #download(path = "") {
		try {
			const data = await (await fetch(`${this.STORAGE_URL}/${path}.json`)).json();
			if (data) return this.#unpackData(data);
			throw new Error(`download failed. '${path}' not found!`);
		} catch (error) {}
	}

	/**
	 * Uploads data to the specified path.
	 * @template T
	 * @param {string} path - The path to upload data to.
	 * @param {T} upload - The data to upload.
	 * @returns {Promise<T | undefined>}
	 * @private
	 */
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
	 * Deletes the specified path.
	 * @param {string} path - The path to delete.
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
	 * Parses the specified upload data in preparation for upload to Firebase. Replaces Arrays with JSON and empty JSON and empty Arrays with placeholder elements.
	 * @template T
	 * @param {T} upload - The data to pack.
	 * @returns {T}
	 * @private
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
	 * Parses the specified Firebase download data.
	 * @param {any} data - The download data.
	 * @returns {any | null}
	 * @private
	 */
	#unpackData(data) {
		if (!data || !(typeof data === "object")) return;
		Object.entries(data).forEach(([key, value]) => {
			// handle arrays
			if (key.startsWith("_")) {
				delete data[key];
				data[key.slice(1)] = value.hasOwnProperty("_placeholder") ? [] : Object.values(value);
			}

			// handle empty object
			else if (value.hasOwnProperty("null") && value["null"] === "null") data[key] = {};
			this.#unpackData(value);
		});
		return data;
	}

	/**
	 * Gets a user by name or email.
	 * @param {string} nameOrEmail - The name or email of the user.
	 * @returns {User | undefined} The user data.
	 */
	getUserByInput(nameOrEmail) {
		const userData = Object.values(this.data.users).find(({ name, email }) => name === nameOrEmail || email === nameOrEmail);
		if (!userData) return undefined;
		return new User(userData);
	}

	/**
	 * Gets users by their IDs.
	 * @param {Array<string>} ids - An array of user IDs.
	 * @returns {Array<User>} An array of users.
	 */
	getUsersById(ids) {
		const users = Object.values(this.data.users)
			.filter(({ id }) => ids.includes(id))
			.map((userData) => new User(userData));
		return users;
	}

	/**
	 * Converts an array to JSON format.
	 * @param {Array} array - The array to convert.
	 * @returns {Object<string, any>} The JSON representation of the array.
	 * @private
	 */
	#arrayToJSON(array) {
		return array.reduce((json, item, index) => ({ ...json, [index]: item }), {});
	}
}

export const STORAGE = new Storage();

/**
 * Sets an item in local storage.
 * @param {string} key - The key to set in local storage.
 * @param {any} value - The value to set.
 */
export function LOCAL_setData(key, value) {
	localStorage.setItem(key, typeof value === "object" ? JSON.stringify(value) : value);
}

/**
 * Gets an item from local storage by key.
 * @param {string} key - The key to get from local storage.
 * @returns {any} The retrieved value.
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
 * Removes an item from local storage by key.
 * @param {string} key - The key to remove from local storage.
 */
export function LOCAL_removeData(key) {
	localStorage.removeItem(key);
}

/**
 * Sets an item in session storage.
 * @param {string} key - The key to set in session storage.
 * @param {any} value - The value to set.
 */
export function SESSION_setData(key, value) {
	// I hate this!
	if (key === "activeBoard" && !Number.isNaN(Number(value))) value = Number(value);
	sessionStorage.setItem(key, JSON.stringify(value));
}

/**
 * Gets an item from session storage by key.
 * @param {string} key - The key to get from session storage.
 * @returns {string | undefined} The retrieved value.
 */
export function SESSION_getData(key) {
	const value = sessionStorage.getItem(key);
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
 * Removes an item from session storage by key.
 * @param {string} key - The key to remove from session storage.
 */
export function SESSION_removeData(key) {
	sessionStorage.removeItem(key);
}
