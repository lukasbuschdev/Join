// REMOTE

import { Account } from "./account.class.js"
import { Board } from "./board.class.js"
import { Notify } from "./notify.class.js"
import { User } from "./user.class.js"
import { error, notification, parse, searchParams } from "./utilities.js"
import { WebSocket } from "./websocket.js"

class Storage {
  STORAGE_URL =
    "https://join-storage-83306-default-rtdb.europe-west1.firebasedatabase.app"
  // SOCKET =
  #data
  #isLoaded = false
  webSocket

  get data() {
    if (!this.#isLoaded)
      throw Error(`storage not yet initialized! await 'STORAGE.init()' to fix`)
    return this.#data
  }

  get allUsers() {
    return Object.entries(this.data.users).reduce((all, [id, user]) => ({ ...all, [id]: new User(user) }), {});
  }

  get currentUser() {
    const userId = this.currentUserId()
    if (!userId) return
    return new User(this.data.users[userId])
  }

  get currentUserContacts() {
    return this.currentUser.contacts.reduce(
      (contacts, contactId) => ({
        ...contacts,
        [contactId]: new User(this.data.users[contactId]),
      }),
      {}
    )
  }

  get currentUserBoards() {
    const user = this.currentUser;
    return user.boards.reduce(
      (boards, boardId) => {
        if(boardId in this.data.boards) boards[boardId] = new Board(this.data.boards[boardId]);
        else {
          user.boards.remove(boardId);
          user.update();
        } 
        return boards;
      }, {}
    )
  }

  // TO DO
  get activeBoard() {
    const boardId = SESSION_getData('activeBoardId') || this.currentUser.boards[0]
    return boardId
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
    const formattedPath = path.split("/").join('"]["')
    const requestedData = parse(
      `${JSON.stringify(this.data)}["${formattedPath}"]`
    )
    // console.log(requestedData)
  }

  /**
   *
   * @param {string} path
   * @param {any} value
   */
  set(path, value) {
    return this.#upload(path, value)
  }

  async #download(path = "") {
    try {
      const data = await (
        await fetch(`${this.STORAGE_URL}/${path}.json`)
      ).json();
      if (data) return this.#unpackData(data)
      throw new Error(`download failed. '${path}' not found!`)
    } catch (error) {
      console.log(error)
    }
  }

  async #upload(path, upload) {
    try {
      const data = await (
        await fetch(`${this.STORAGE_URL}/${path}.json`, {
          method: "PUT",
          body: JSON.stringify(this.#packData(upload)),
        })
      ).text()

      // console.log(`upload: `, data)
      if (data) return this.#unpackData(data)

      throw new Error(`upload failed. '${path}' not found!`)
    } catch (error) {
      console.log(error)
    }
  }

  async delete(path) {
    try {
      return (await fetch(`${this.STORAGE_URL}/${path}.json`, { method: "DELETE", })).json();
    } catch (e) {}
  }

  async #updateAllUsers() {
    return this.set('users', this.allUsers)
  }

  /**
   *
   * @param {string} dataString
   * @returns {string}
   */
  #packData(upload) {
    if (upload === null || !(typeof upload === "object")) return
    Object.entries(upload).forEach(([key, value]) => {

      //handle array
      if (Array.isArray(value)) {
        delete upload[key]
        upload[`_${key}`] = this.#arrayToJSON(value)
        if(!value.length) upload[`_${key}`] = {'_placeholder': ''}
      }
    
      // handle empty object
      else if(typeof value === "object" && !Object.values(value).length) {
        upload[key] = { "null": "null" }
      }

      this.#packData(value)
    })
    return upload
  }

  #unpackData(data) {
    if(!data || !(typeof data === "object")) return;
    Object.entries(data).forEach(([key, value]) => {

      // handle arrays
      if(key.startsWith("_")) {
        delete data[key];
        data[key.slice(1)] = (value.hasOwnProperty("_placeholder")) ? [] : Object.values(value);
      }

      // handle empty object
      else if(value.hasOwnProperty("null") && value["null"] === "null") data[key] = {};
      this.#unpackData(value);
    });
    return data;
  }

  getUserByInput(nameOrEmail) {
    const userData = Object.values(this.data.users).find(
      ({ name, email }) => name === nameOrEmail || email === nameOrEmail
    )
    if(!userData) return undefined;
    return new User(userData);
  }

  getUsersById(ids) {
    const users = Object.values(this.data.users)
      .filter(({ id }) => ids.includes(id))
      .map((userData) => new User(userData))
  }

  #arrayToJSON(array) {
    return array.reduce((json, item, index) => ({ ...json, [index]: item }), {})
  }


  // DEV
  async syncBoards() {
    Object.values(this.allUsers).forEach((user) => {
      user.boards.forEach((boardId) => {
        if(!(boardId in this.data.boards)) {
          console.log(`removing boardId '${boardId}' from User '${user.name}'`);
          user.boards.remove(boardId);
          user.update();
        }
      })
    });
  }
}

export const STORAGE = new Storage()

//________________________________________________

const STORAGE_TOKEN = "NVTVE0QJKQ005SECVM4281V290DQJKIG6V0LRBYV"
const STORAGE_URL = "https://remote-storage.developerakademie.org/item"

// DOWNLOAD

/**
 * returns a Promise which resolves to the fetched data as JSON when the directory is found, otherwise returns undefined
 * @param {"users" | "boards" | "verification" | "dev"} directory
 * @returns {Promise<any | undefined>};
 */
export async function REMOTE_download(directory) {
  try {
    const {
      data: { value },
    } = await (
      await fetch(`${STORAGE_URL}?key=${directory}&token=${STORAGE_TOKEN}`)
    ).json()
    return value !== "empty" ? parse(value) : value
  } catch (e) {
    console.log(`download failed! ${e}`)
    return undefined
  }
}

// UPLOAD

/**
 * uploads the specified data into the provided directory
 * @param {"users" | "boards" | "verification" | "dev"} directory
 * @param {any} data
 * @returns {Promise<Response | undefined>};
 */
export function REMOTE_upload(directory, data) {
  if (
    directory !== "users" ||
    directory !== "boards" ||
    directory !== "verification" ||
    directory !== "dev"
  )
    return Promise.resolve(undefined)
  // return log(directory, data)
  const payload = { key: directory, value: data, token: STORAGE_TOKEN }
  return fetch(STORAGE_URL, { method: "POST", body: JSON.stringify(payload) })
}

/**
 * fetches data from the specified url and if it is a USER, BOARD or TASK, returns a new Instance of it. If nothing is found, returns undefined
 * @param {string} path path url in the format 'parent/child/grandchild'
 * @returns {Promise<User | Board | Task | any | undefined>};
 */
export async function REMOTE_getData(path) {
  if (!path) return
  const isValidPath =
    /^(?=[a-zA-Z0-9])(?!.*\/\/)[a-zA-Z0-9\/-]*[a-zA-Z0-9]$/.test(path)
  if (!isValidPath) return console.error(`'${path}' is not a valid path!`)

  let pathArray = path.split("/")
  const directory = pathArray[0]
  // const data = await (await fetch(`${STORAGE_URL}/${path}.json`)).json();
  // console.log(data)
  const pathSelector = pathArray
    .slice(1)
    .map((directory) => `["${directory}"]`)
    .join("")
  const data = await REMOTE_download(directory)
  if (!data) return notification("network-error")

  const result = parse(`${JSON.stringify(data)}${pathSelector}`)
  if (!result) return error(`subdirectory '${path}' not found!`)

  const mainDirectory = pathArray.at(-2)
  if (mainDirectory === "users") window.users = data
  switch (mainDirectory) {
    case "users":
      return new User(result)
    case "boards":
      return new Board(result)
    case "tasks":
      return new Task(result)
    default:
      return result
  }
}

/**
 * propagates the directory tree via the path and if successful adds the data, then uploads it
 * and returns the data
 * @param {string} path path url in the format 'parent/child/grandchild'
 * @param {any} upload
 * @returns {Promise<any | undefined>};
 */
export async function REMOTE_setData(path, upload) {
  const data = await REMOTE_getData(path.split("/")[0])
  const directories = path.split("/")
  let currentObj = data
  for (let i = 1; i < directories.length; i++) {
    const directory = directories[i]

    if (!currentObj.hasOwnProperty(directory))
      return (currentObj[directory] = {})
    currentObj = currentObj[directory]
  }

  if (Array.isArray(currentObj)) {
    if (Array.isArray(upload))
      currentObj.splice(0, currentObj.length, ...upload)
    else if (currentObj.indexOf(upload !== -1)) currentObj.push(upload)
  } else Object.assign(currentObj, upload)
  await REMOTE_upload(directories[0], data)
  return data
}

/**
 * deletes specified path (if found)
 * @param {string} path path url in the format 'parent/child/grandchild'
 * @returns {Promise<Response | undefined>};
 */
export async function REMOTE_removeData(path) {
  if (!path.includes("/")) return error("can only remove subdirectory!")
  const directory = path.slice(0, path.lastIndexOf("/"))
  const item = path.slice(path.lastIndexOf("/") + 1)
  const data = await REMOTE_getData(directory)
  if (!data) return
  if (Array.isArray(data) && data.includes(item))
    data.splice(data.indexOf(item), 1)
  else {
    delete data[item]
  }
  if (directory.includes("/")) {
    const parentDirectory = directory.slice(0, directory.lastIndexOf("/"))
    const childDirectory = directory.split("/").at(-1)
    return REMOTE_setData(parentDirectory, { [childDirectory]: data })
  } else {
    return REMOTE_upload(path.split("/")[0], data)
  }
}

/**
 * sets an item in local storage
 * @param {string} key
 * @param {any} value
 */
export function LOCAL_setData(key, value) {
  localStorage.setItem(
    key,
    typeof value === "object" ? JSON.stringify(value) : value
  )
}

/**
 * gets an item from local storage by key
 * @param {string} key
 * @returns {any}
 */
export function LOCAL_getData(key) {
  let data = localStorage.getItem(key)
  try {
    return JSON.parse(data)
  } catch (e) {
    return data
  }
}

/**
 * removes an item from local storage by key
 * @param {string} key
 */
export function LOCAL_removeData(key) {
  localStorage.removeItem(key)
}

/**
 * sets an item in session storage
 * @param {string} key
 * @param {any} value
 */
export function SESSION_setData(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value))
}

/**
 * gets an item from session storage by key
 * @param {string} key
 * @returns {any | undefined}
 */
export function SESSION_getData(key) {
  let data = sessionStorage.getItem(key)
  if (
    data === "null" ||
    data === "undefined" ||
    data === "NaN" ||
    data === "false"
  )
    return undefined
  if (data) return data
}

/**
 * removes an item from session storage by key
 * @param {string} key
 */
export function SESSION_removeData(key) {
  sessionStorage.removeItem(key)
}