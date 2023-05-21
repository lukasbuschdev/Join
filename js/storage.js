// REMOTE

const STORAGE_TOKEN = 'NVTVE0QJKQ005SECVM4281V290DQJKIG6V0LRBYV';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';
const STORAGE_KEY = 'dev';

// ITEMS

const REMOTE_setItem = async (dataType, itemData) => {
    if (dataType !== 'users' &&
        dataType !== 'verification') {
            console.error(`'${dataType}' is not a valid subdirectory! Valid subdirectories are: 'users', 'verification'`);
            return;
        };
    const data = await REMOTE_getDatatype(dataType);
    const updatedData = { [itemData.id]: itemData, ...data }
    return await REMOTE_updateDatatype(dataType, updatedData);
}

const REMOTE_getItem = async (dataType, key) => {
    const data = await REMOTE_getDatatype(dataType)
    return data[key];
}

const REMOTE_removeItem = async (dataType, key) => {
    const data = await REMOTE_getAllData();
    if (data[dataType] == undefined) {
        console.error(`'${dataType}' is not a valid subdirectory!`);
        return;
    };
    if (data[dataType][key] == undefined) {
        console.error(`Cannot remove item; '${key}' not Found!`)
        return;
    }

    delete data[dataType][key];

    const payload = { key: 'dev', value: data, token: STORAGE_TOKEN };
    return fetch(STORAGE_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
}

// DATATYPES

const REMOTE_getAllData = async () => {
    const { data: { value } } = await (await fetch(`${STORAGE_URL}?key=${STORAGE_KEY}&token=${STORAGE_TOKEN}`)).json()
    return JSON.parse(value.replaceAll("'", '"'));
    // return value;
} 

const REMOTE_getDatatype = async (dataType) => {
    try {
        const response = await fetch(`${STORAGE_URL}?key=${STORAGE_KEY}&token=${STORAGE_TOKEN}`);
        const { data: { value } } = await response.json();
        const user = JSON.parse(value.replaceAll("'", '"'));
        return user[dataType];
    } catch(e) {
        return false;
    }
}

const REMOTE_updateDatatype = async (dataType, value) => {
    const initialData = await REMOTE_getAllData();
    const updatedData = { ...initialData, [dataType]: value };

    const payload = { key: STORAGE_KEY, value: updatedData, token: STORAGE_TOKEN };

    return fetch(STORAGE_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
}

const REMOTE_removeDatatype = async (dataType) => {
    const data = await REMOTE_getAllData();
    delete data[dataType];
    const payload = { key: STORAGE_KEY, value: data, token: STORAGE_TOKEN };
    return fetch(STORAGE_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    });
}

const REMOTE_setDatatype = async (dataType) => {
    const initialData = await REMOTE_getAllData();
    const updatedData = { ...initialData, [dataType]: {} };
    const payload = { key: STORAGE_KEY, value: updatedData, token: STORAGE_TOKEN };

    return fetch(STORAGE_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
}

// USERDATA

const getUser = async (input) => {
    const allUsers = await REMOTE_getDatatype('users');
    const user = Object.values(allUsers).filter(user => user.email == input || user.name == input);
    return user[0] ?? false;
}

// LOCAL STORAGE

const LOCAL_setItem = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
}

const LOCAL_getItem = (key) => {
    return JSON.parse(localStorage.getItem(key)); 
}

const LOCAL_removeItem = (key) => {
    localStorage.removeItem(key);
}

// 1684211863626

// RESET

// const resetData = async () => {
//     const payload = {
//         key: 'dev',
//         token: 'NVTVE0QJKQ005SECVM4281V290DQJKIG6V0LRBYV'}
//     }
// }