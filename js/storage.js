// REMOTE

const STORAGE_TOKEN = 'NVTVE0QJKQ005SECVM4281V290DQJKIG6V0LRBYV';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';
const STORAGE_KEY = 'dev';

// ITEMS

const REMOTE_setItem = async (dataType, itemData) => {
    const data = await REMOTE_getItem(dataType);
    const updatedData = { ...data, [itemData.id]: itemData }
    return REMOTE_updateDatatype(dataType, updatedData);
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
    const allUsers = await REMOTE_getItem('users');
    const [ userData ] = Object.values(allUsers).filter(user => user.email == input || user.name == input);
    if (userData == undefined) return false;
    return new User(userData);
}

const REMOTE_getItem = async (path) => {
    const allData = await REMOTE_getAllData();
    return JSON_getDirectory(path, allData) ?? false;
}

// const JSON_setItem = async (path = 'users/two/three', value = { testkey: 'teststring' }) => {
//     const allData = await REMOTE_getAllData();
// }

const getSelectorsFromPath = (path) => path.split('/').reduce((total, directory) => total += `['${directory}']`, '');

const JSON_getDirectory = (path, json) => customParser(`${JSON.stringify(json)}${getSelectorsFromPath(path)}`);

// const JSON_setDirectory = async (path, json, newValue) => {
//     const data = await REMOTE_getAllData();
//     const obj = JSON.stringify(data);
//     // log(JSON.parse(obj))
//     // const obj = JSON.stringify(json);
//     const value = JSON.stringify(newValue);
//     const directory = path.slice(0, path.indexOf('/'));
//     const key = path.slice(path.lastIndexOf('/')+1);

    

//     return customParser(`{...${obj}, ${directory}: { ...${obj}.${directory}, ${key}: ${value} } }`);
// }

// const JSON_setDirectory = async (path) => {
//     const allData = await REMOTE_getAllData();
//     const JSON_string = JSON.stringify(allData);
//     // JSON_string = JSON.stringify({a: '123', b: '456'})
//     const [pathArray, directoryArray] = JSONdirectories(path);
//     let parseString = `{...${JSON_string}, `;
//     directoryArray.forEach((directory, i) => {
//         // parseString += `"${directory}": {...${JSON_string}.${pathArray[i].replaceAll('/','.')}, `
//         parseString += `"${directory}": ${tst(i, pathArray, JSON_string)} `
//     });
//     directoryArray.forEach(()=>parseString += '}')
//     return customParser(`${parseString}}`);
//     // return `${parseString.replace(', }', ' }')}}`
// }

// const tst = (i, array, JSON_string) => {
//     if (i == array.length - 1) return `{`
//     else return `{...${JSON_string}.${array[i].replaceAll('/','.')},`
// }


// const setDirectory = async (query) => {
//     const allData = await REMOTE_getAllData();
//     const [pathArray, directoryArray] = JSONdirectories(query);
//     directoryArray.forEach((directory, i) => {
//         if (!(`${directory}` in customParser(`${JSON.stringify(allData)}${pathArray[i]}`))) {
//             log('creating directory...')
//             let newArray = customParser(`${JSON.stringify(allData)}${pathArray[i]}['${directory}'] = 'test'`)
//             log(newArray)
//         }
//     })
// }

// const JSONdirectories = (path) => {
//     const directoryArray = path.split('/');
//     let pathArray = [];
//     for (let i = 0; i < directoryArray.length - 1; i++) {
//         pathArray.unshift(`['${path.slice(0, path.lastIndexOf('/')).replaceAll('/',"']['")}']`)
//         path = path.slice(0, path.lastIndexOf('/'));
//     }
//     pathArray.unshift("");
//     return [pathArray, directoryArray];
// }

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