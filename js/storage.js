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
    return fetch(STORAGE_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

const REMOTE_getData = async (path) => {
    if (!/^(?=[a-zA-Z0-9])(?!.*\/\/)[a-zA-Z0-9\/-]*[a-zA-Z0-9]$/.test(path)) {
        console.error(`'${path}' is not a valid path!`);
        return
    };
    let pathArray = path.split('/');
    const directory = pathArray.shift();
    const pathSelector = pathArray.map(directory => `["${directory}"]`).join('');

    const data = await REMOTE_download(directory);
    if(!data) return;

    if (parse(`${JSON.stringify(data)}${pathSelector}`)) {
        return parse(`${JSON.stringify(data)}${pathSelector}`);
    } else {
        console.error(`subdirectory '${path}' not found!`);
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
    Object.assign(currentObj, upload);

    return REMOTE_upload(directories[0], data);
}



const REMOTE_removeData = async (path) => {
    const directory = path.slice(0, path.lastIndexOf('/'));
    const item = path.slice(path.lastIndexOf('/') + 1);
    let data = await REMOTE_getData(directory);
    if (!data) return;
    delete data[item];

    return REMOTE_upload(directory, data);
}

const REMOTE_removeVerification = async (id) => {
    const allVerifications = await REMOTE_getData('verification');
    delete allVerifications[id]
    return REMOTE_upload('verification', {...filteredVerifications});
}

// Directories

const REMOTE_addDirectory = async (directoryName) => {
    if (await REMOTE_getData(directoryName)) {
        console.error(`directory '${directoryName}' already exists!`);
        return;
    }
    return (directoryName, "empty");
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

// USERDATA

const getUserByInput = async (input) => {
    const allUsers = await REMOTE_getData('users');
    const [ userData ] = Object.values(allUsers).filter(({ name, email }) => name == input || email == input);
    return (userData !== undefined) ? new User(userData) : false;
}

const getContactsData = async (contactIds) => {
    return await Promise.all(contactIds.map(
        async (contactId) => {
            return await REMOTE_getData(`users/${contactId}`);
            }
        )
    )
}

// LOCAL STORAGE

const LOCAL_setData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
}

const LOCAL_getData = (key) => {
    return JSON.parse(localStorage.getItem(key)); 
}

const LOCAL_removeData = (key) => {
    localStorage.removeItem(key);
}

// SESSION STORAGE

const SESSION_setData = (key, value) => {
    sessionStorage.setItem(key, JSON.stringify(value));
}

const SESSION_getData = (key) => {
    return sessionStorage.getItem(key);
}

// DEV

const getDevUsers = async () => {
    return await (await fetch("../assets/dev/dev_users.json")).json();
}

const getDevData = async (type) => {
    return await (await fetch(`../assets/dev/dev_${type}.json`)).json();
}

const uploadDevData = async () => {
    const users = await (await fetch("../assets/dev/dev_users.json")).json();
    const boards = await (await fetch("../assets/dev/dev_boards.json")).json();
    await REMOTE_setData('dev', 'users', users);
    await REMOTE_setData('dev', 'boards', boards);
}

// UserData

const getCurrentUserData = async () => {
    const uid = currentUserId();
    if (!uid) return;
    return await REMOTE_getData(`users/${uid}`)
}

const loadUserData = async (id) => {
    const allUsers = await REMOTE_getData("users");
    const user = allUsers[id] ?? allUsers.guest;
    if (user.img !== "") {
        setUserImg(user.img);
    } else {
        setUserImgBackup(user.name);
    }
}

const setUserImg = (img) => {
    const imgContainer = $('.user-image img');
    imgContainer.src = `${img}`;
}

const setUserImgBackup = (name) => {
    const initials = name.slice(0, 2).toUpperCase();
    $('.user-image').innerText = initials;
}