// REMOTE

import { Account } from "./account.class.js"
import { Board } from "./board.class.js"
import { Notify } from "./notify.class.js"
import { User } from "./user.class.js"
import { error, notification, parse, searchParams } from "./utilities.js"

class Storage {
  STORAGE_URL =
    "https://join-storage-83306-default-rtdb.europe-west1.firebasedatabase.app"
  // SOCKET =
  #data
  #isLoaded = false

  get data() {
    if (!this.#isLoaded)
      throw Error(`storage not yet initialized! await 'STORAGE.init()' to fix`)
    return this.#data
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
    return this.currentUser.boards.reduce(
      (boards, boardId) => ({
        ...boards,
        [boardId]: new Board(this.data.boards[boardId]),
      }),
      {}
    )
  }

  /**
   * gets all data and returns a storage conainer
   * @returns {Promise<any>}
   */
  async init() {
    this.#data = await this.#download()
    this.#isLoaded = true

    const allUsers = await REMOTE_download("users");
    console.log(allUsers)
    // this.#upload("users", allUsers)

    return this
  }

  currentUserId() {
    return searchParams().get("uid") == null
      ? undefined
      : `${searchParams().get("uid")}`
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
    console.log(requestedData)
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
      if (data) return this.#unpackArrays(data)
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
          body: JSON.stringify(this.#packArrays(upload)),
        })
      ).text()

    //   console.log(`upload: `, data)
      if (data) return this.#unpackArrays(data)

      throw new Error(`upload failed. '${path}' not found!`)
    } catch (error) {
      console.log(error)
    }
  }

  async #delete(path) {
    try {
      const data = await (
        await fetch(`${this.STORAGE_URL}/${path}.json`, {
          method: "DELETE",
        })
      ).json()
      return data
    } catch (e) {}
  }

  /**
   *
   * @param {string} dataString
   * @returns {string}
   */
  #packArrays(upload) {
    if (upload === null || !(typeof upload === "object")) return
    Object.entries(upload).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        delete upload[key]
        upload[`_${key}`] = this.#arrayToJSON(value)
        if(!value.length) upload[`_${key}`] = {'place':'holder'}
      }
      this.#packArrays(value)
    })
    return upload
  }

  #unpackArrays(data) {
    if(data === null || !(typeof data === "object")) return;
    Object.entries(data).forEach(([key, value]) => {
        if(key.startsWith("_")) {
            delete data[key];
            data[key.slice(1)] = Object.values(value);
        }
        this.#unpackArrays(value);
    })
    return data;
  }

  getUserByInput(nameOrEmail) {
    const userData = Object.values(this.data.users).find(
      ({ name, email }) => name === nameOrEmail || email === nameOrEmail
    )
    if (!userData) return undefined;
    return new User(userData);
  }

  getUsersById(ids) {
    const users = Object.values(this.data.users)
      .filter(({ id }) => ids.includes(id))
      .map((userData) => new User(userData))
    console.log(users);
  }

  #arrayToJSON(array) {
    return array.reduce((json, item, index) => ({ ...json, [index]: item }), {})
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
  return console.log("aaaaaaaaa")
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
 * clears all expired verification from the data
 * @returns {Promise<Response | undefined>};
 */
export async function REMOTE_clearVerifications() {
  const verifications = await REMOTE_getData("verification")
  for (const verification in verifications) {
    if (verifications[verification].verifyCode.expires < Date.now()) {
      delete verifications[verification]
    }
  }
  return REMOTE_upload("verification", verifications)
}

/**
 * gets a user by name or email and if successful returns a new User instance
 * @param {string} input name or email of user
 * @returns {Promise<User | undefined>}
 */
export async function getUserByInput(input) {
  const allUsers = await REMOTE_getData("users")
  if (!allUsers) return undefined
  const [userData] = Object.values(allUsers).filter(
    ({ name, email }) => name == input || email == input
  )
  return userData ? new User(userData) : undefined
}

/**
 * returns a Promise resolving to an array containing a User instance for every found User
 * @param {string[]} uids array of user ids
 * @returns {Promise<User[]>}
 */
export async function getUsersById(uids) {
  const allUsers = await REMOTE_getData(`users`)
  const foundUsers = uids.reduce((users, uid) => {
    return allUsers.hasOwnProperty(uid)
      ? { ...users, [uid]: allUsers[uid] }
      : users
  }, {})
  if (Object.values(foundUsers).length === 0) return
  return foundUsers
}

/**
 * returns a promise which resolves to an array of all Users who are not already existing Contacts of the current User sorted by name
 * @returns {Promise<User[]>}
 */
export function getContactsData() {
  const { contacts: contactIds } = STORAGE.currentUser
  if (!contactIds) return []
  const userData = STORAGE.data.users
  const accounts = Object.values(userData).reduce(
    (allAccounts, account) => [...allAccounts, new Account(account)],
    []
  )
  const filteredContacts = accounts.filter(
    ({ id }) => contactIds.indexOf(`${id}`) !== -1
  )
  const sortedContacts = filteredContacts.sort(
    ({ name: name1 }, { name: name2 }) => {
      if (name1 > name2) return 1
      else return -1
    }
  )
  return sortedContacts
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

/**
 * updates the contacts property of the global USER variable
 */
export function getContacts() {
  const allUsers = STORAGE.data.users
  STORAGE.currentUser.contacts.for(
    (contactId) => (CONTACTS[contactId] = new User(allUsers[contactId]))
  )
}

/**
 * updates the global BOARDS variable and also sets the SELECTED_BOARD variable
 */
export async function getBoards() {
  if (!window.USER?.boards?.length) return
  const allBoards = await REMOTE_getData("boards")
  for await (const boardId of USER.boards) {
    if (boardId in allBoards) BOARDS[boardId] = new Board(allBoards[boardId])
    else {
      log(boardId, allBoards)
      // USER.boards.remove(`${boardId}`);
      // delete BOARDS[boardId];
      // await USER.update();
    }
  }
  window.SELECTED_BOARD =
    window.BOARDS[SESSION_getData("activeBoard")] ??
    window.BOARDS[Object.keys(BOARDS)[0]]
}

/**
 * updates the global ALL_USERS variable
 */
// export async function getAllUsers() {
//     const allUsers = await REMOTE_getData('users');
//     window.ALL_USERS = allUsers.map(user => new Account(user));
// };
