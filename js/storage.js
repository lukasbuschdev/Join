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

const REMOTE_upload = (path, data) => {
    const payload = {
        key: path.split('/')[0],
        value: data,
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

const REMOTE_setData = async (targetPath, newDirectory, data) => {
    const initialData = await REMOTE_getData(targetPath);
    if (!initialData) return;
    const upload = (initialData !== "empty") ? { ...initialData, [newDirectory]: data } : { [newDirectory]: data };
    await REMOTE_upload(targetPath, upload);
}

const REMOTE_removeData = async (path) => {
    const directory = path.slice(0, path.lastIndexOf('/'));
    const item = path.slice(path.lastIndexOf('/') + 1);
    let data = await REMOTE_getData(directory);
    if (!data) return;
    delete data[item];
    await REMOTE_upload(path)
}

// Directories

const REMOTE_addDirectory = async (directoryName) => {
    if (await REMOTE_getData(directoryName)) {
        console.error(`directory '${directoryName}' already exists!`);
        return;
    }
    REMOTE_upload(directoryName, "empty");
}

const REMOTE_resetDirectory = async (directoryName) => {
    const dev = await REMOTE_getData('dev/master-pw');
    if (!dev) return;
    let prompt = window.prompt(`Do you really want to reset '${directoryName}'?`, 'Password');
    if (prompt == dev) {
        REMOTE_upload(directoryName, "empty");
    } else if (prompt) {
        window.alert('Wrong password!');
    }
}

// USERDATA

const getUser = async (input) => {
    const allUsers = await REMOTE_getData('users');
    const [ userData ] = Object.values(allUsers).filter(user => user.email == input || user.name == input);
    return (userData !== undefined) ? new User(userData) : undefined;
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