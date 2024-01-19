// REMOTE

const STORAGE_TOKEN = 'NVTVE0QJKQ005SECVM4281V290DQJKIG6V0LRBYV';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';

// DOWNLOAD

const REMOTE_download = async (directory) => {
    try{
        const { data: { value } } = await (await fetch(`${STORAGE_URL}?key=${directory}&token=${STORAGE_TOKEN}`)).json();
        return (value !== "empty") ? parse(value) : value;
    } catch(e) {
        return undefined;
    }
}

// UPLOAD

const REMOTE_upload = async (directory, data) => {
    const payload = {
        key: directory,
        value: JSON.stringify(data),
        token: STORAGE_TOKEN
    };

    // log(data);
    // return;

    return fetch(STORAGE_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

const REMOTE_getData = async (path) => {
    if (!path) return
    if (!/^(?=[a-zA-Z0-9])(?!.*\/\/)[a-zA-Z0-9\/-]*[a-zA-Z0-9]$/.test(path)) {
        console.error(`'${path}' is not a valid path!`);
        return
    };
    let pathArray = path.split('/');
    const directory = pathArray[0];
    const pathSelector = pathArray.slice(1).map(directory => `["${directory}"]`).join('');

    const data = await REMOTE_download(directory);
    if(!data) {
        return notification('network-error');
    };
    
    const result = parse(`${JSON.stringify(data)}${pathSelector}`);
    if (result) {
        if (pathArray.at(-2) == "users") return new User(result);
        else if (pathArray.at(-2) == "boards") return new Board(result);
        else if (pathArray.at(-2) == "tasks") return new Task(result);
        else return result;

    } else {
        error(`subdirectory '${path}' not found!`);
        return undefined;
    }
}

const REMOTE_setData = async (targetPath, upload) => {
    const data = await REMOTE_getData(targetPath.split('/')[0]);
    const directories = targetPath.split('/');
    let currentObj = data;

    for (let i = 1; i < directories.length; i++) {
        const directory = directories[i];
        if (!currentObj.hasOwnProperty(directory)) {
        currentObj[directory] = {};
        }
        currentObj = currentObj[directory];
    }
    if (Array.isArray(currentObj)) {
        if (Array.isArray(upload)) {
            currentObj.splice(0, currentObj.length, ...upload);
        }
        else if (currentObj.indexOf(upload !== -1)) currentObj.push(upload);
    } else Object.assign(currentObj, upload);
    return REMOTE_upload(directories[0], data);
}



const REMOTE_removeData = async (path) => {
    if (!path.includes('/')) return error('can only remove subdirectory!');
    const directory = path.slice(0, path.lastIndexOf('/'));
    const item = path.slice(path.lastIndexOf('/') + 1);
    let data = await REMOTE_getData(directory);
    if (!data) return;
    if (Array.isArray(data) && data.includes(item)) {
        data.splice(data.indexOf(item), 1);
    } else {
        delete data[item];
    };
    if (directory.includes('/')) {
        const parentDirectory = directory.slice(0, directory.lastIndexOf('/'));
        const childDirectory = directory.split('/').at(-1);
        return REMOTE_setData(parentDirectory, { [childDirectory]: data});
    } else {
        return REMOTE_upload(path.split('/')[0], data);
    }
}

const REMOTE_clearVerifications = async () => {
    const verifications = await REMOTE_getData('verification');
    for (const verification in verifications) {
        if (verifications[verification].verifyCode.expires < Date.now()) {
            delete verifications[verification]
        }
    }
    return REMOTE_upload('verification', verifications);
}

// Directories

const REMOTE_addDirectory = async (directoryName) => {
    if (await REMOTE_getData(directoryName)) {
        console.error(`directory '${directoryName}' already exists!`);
        return;
    }
    return REMOTE_upload(directoryName, {});
}

const REMOTE_resetDirectory = async (directoryName) => {
    const dev = await REMOTE_getData('dev/master-pw');
    if (!dev) return;
    let prompt = window.prompt(`Do you really want to reset '${directoryName}'?`, 'Password');
    if (prompt == dev) {
        REMOTE_upload(directoryName, {});
    } else if (prompt) {
        window.alert('Wrong password!');
    }
}

const REMOTE_updateUsers = async () => {
    const allUsers = Object.values(await REMOTE_getData('users'));

    let updatedUsersObject = {};

    let updatedUsers = allUsers.map(
        user => new User(user)
    );

    updatedUsers.for(
        user => updatedUsersObject[user.id] = removeMethods(user)
    );

    return await REMOTE_upload('users', updatedUsersObject);
}

// USERDATA

const getUserByInput = async (input) => {
    const allUsers = await REMOTE_getData('users');
    const [ userData ] = Object.values(allUsers).filter(({ name, email }) => name == input || email == input);
    return (userData == undefined) ? null : new User(userData);
}

const getUsersById = async (uids) => {
    let returnData = {};
    const allUsers = await REMOTE_getData(`users`);
    uids.for(
        uid => {
            if (allUsers[uid]) returnData[uid] = allUsers[uid];
        }
    )
    return returnData;
}

const getContactsData = async () => {
    const {contacts: contactIds} = await REMOTE_getData(`users/${currentUserId()}`);
    if (contactIds == false) return;

    const userData = await REMOTE_getData('users');
    let accounts = [];
    Object.values(userData).for(
        account => accounts.push(new Account(account))
    )
    const filteredContacts = accounts.filter(({id}) => contactIds.indexOf(`${id}`) !== -1);
    const sortedContacts = filteredContacts.sort(({name: name1}, {name: name2}) => {
        if (name1 > name2) return 1
        else return -1
    })
    return sortedContacts;
}

// LOCAL STORAGE

const LOCAL_setData = (key, value) => {
    localStorage.setItem(key, (typeof value == "object") ? JSON.stringify(value) : value);
}

const LOCAL_getData = (key) => {
    let data = localStorage.getItem(key);
    try {
        return JSON.parse(data);
    } catch(e) {
        return data;
    }
}

const LOCAL_removeData = (key) => {
    localStorage.removeItem(key);
}

// SESSION STORAGE

const SESSION_setData = (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
}

const SESSION_getData = (key) => {
    let data = sessionStorage.getItem(key);
    if (data) return data;
}

const SESSION_removeData = (key) => {
    sessionStorage.removeItem(key);
}

// UserData

const getCurrentUser = async () => {
    const uid = currentUserId();
    if (!uid) return null;
    return REMOTE_getData(`users/${uid}`);
}

const getUser = async () => {
    USER = await getCurrentUser();
    return getContacts();
};

const getContacts = async () => {
    const allUsers = await REMOTE_getData('users');
    USER.contacts.for(
        contactId => CONTACTS[contactId] = new User(allUsers[contactId])
    );
    return;
}

const getBoards = async () => {
    if (USER.boards == []) return;
    const allBoards = await REMOTE_getData('boards');
    for await (const boardId of USER.boards) {
        if (`${boardId}` in allBoards) BOARDS[boardId] = new Board(allBoards[boardId]); 
        else {
            USER.boards.remove(`${boardId}`);
            delete BOARDS[boardId];
            await USER.update();
        };
    };
    SELECTED_BOARD = BOARDS[SESSION_getData('activeBoard')] ?? BOARDS[Object.keys(BOARDS)[0]];
};

const getAllUsers = async () => {
    const allUsers = await REMOTE_getData('users');
    ALL_USERS = allUsers.map(user => new Account(user));
};