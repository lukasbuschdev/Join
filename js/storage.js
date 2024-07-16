// REMOTE

import { Board } from "./board.class.js";
import { Notify } from "./notify.class.js";
import { User } from "./user.class.js";
import { parse, searchParams } from "./utilities.js";
import { WebSocket } from "./websocket.js";

class Storage {
  STORAGE_URL =
    "https://join-storage-83306-default-rtdb.europe-west1.firebasedatabase.app";
  // SOCKET =
  #data;
  #isLoaded = false;
  webSocket;

  get data() {
    if (!this.#isLoaded)
      throw Error(`storage not yet initialized! await 'STORAGE.init()' to fix`);
    return this.#data;
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

  get currentUserContacts() {
    return this.currentUser.contacts.reduce(
      (contacts, contactId) => ({
        ...contacts,
        [contactId]: new User(this.data.users[contactId])
      }),
      {}
    );
  }

  get currentUserBoards() {
    const user = this.currentUser;
    return user.boards.reduce((boards, boardId) => {
      if (boardId in this.data.boards)
        boards[boardId] = new Board(this.data.boards[boardId]);
      else {
        user.boards.remove(boardId);
        user.update();
      }
      return boards;
    }, {});
  }

  // TO DO
  get activeBoard() {
    const boardId =
      SESSION_getData("activeBoardId") || this.currentUser.boards[0];
    return boardId;
  }

  /**
   * gets all data and returns a storage conainer
   * @returns {Promise<any>}
   */
  async init() {
    this.#data = await this.#download();
    this.#isLoaded = true;
    this.webSocket = new WebSocket(this);
    return this;
  }

  currentUserId() {
    return searchParams().get("uid") == null
      ? undefined
      : `${searchParams().get("uid")}`;
  }

  /**
   *
   * @param {string} path
   * @returns {User | Board | Notify}
   */
  get(path) {
    const formattedPath = path.split("/").join('"]["');
    const requestedData = parse(
      `${JSON.stringify(this.data)}["${formattedPath}"]`
    );
  }

  /**
   *
   * @param {string} path
   * @param {any} value
   */
  set(path, value) {
    return this.#upload(path, value);
  }

  async #download(path = "") {
    try {
      const data = await (
        await fetch(`${this.STORAGE_URL}/${path}.json`)
      ).json();
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

      if (data) return this.#unpackData(data);

      throw new Error(`upload failed. '${path}' not found!`);
    } catch (error) {}
  }

  async delete(path) {
    try {
      return (
        await fetch(`${this.STORAGE_URL}/${path}.json`, { method: "DELETE" })
      ).json();
    } catch (e) {}
  }

  async #updateAllUsers() {
    return this.set("users", this.allUsers);
  }

  /**
   *
   * @param {string} dataString
   * @returns {string}
   */
  #packData(upload) {
    if (upload === null || !(typeof upload === "object")) return;
    Object.entries(upload).forEach(([key, value]) => {
      //handle array
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
   *
   * @param {any} data upload data
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
      else if (value.hasOwnProperty("null") && value["null"] === "null")
        data[key] = {};
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
  }

  #arrayToJSON(array) {
    return array.reduce(
      (json, item, index) => ({ ...json, [index]: item }),
      {}
    );
  }

  // DEV
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
  localStorage.setItem(
    key,
    typeof value === "object" ? JSON.stringify(value) : value
  );
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
  sessionStorage.setItem(key, JSON.stringify(value));
}

/**
 * gets an item from session storage by key
 * @param {string} key
 * @returns {any | undefined}
 */
export function SESSION_getData(key) {
  let data = sessionStorage.getItem(key);
  if (
    data === "null" ||
    data === "undefined" ||
    data === "NaN" ||
    data === "false"
  )
    return undefined;
  if (data) return data;
}

/**
 * removes an item from session storage by key
 * @param {string} key
 */
export function SESSION_removeData(key) {
  sessionStorage.removeItem(key);
}
