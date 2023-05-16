// REMOTE STORAGE

const STORAGE_TOKEN = 'NVTVE0QJKQ005SECVM4281V290DQJKIG6V0LRBYV';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';

const REMOTE_setItem = async (key, value) => {
    const payload = { key, value, token: STORAGE_TOKEN };
    return fetch(STORAGE_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
}

const REMOTE_getItem = async (key) => {
    try {
        const response = await fetch(`${STORAGE_URL}?key=${key}&token=${STORAGE_TOKEN}`);
        const { data: { value } } = await response.json();
        return JSON.parse(value.replaceAll("'", '"'));
    } catch(e) {
        return false;
    }
}

// LOCAL STORAGE

const LOCAL_setItem = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
}

const LOCAL_getItem = (key) => {
    return JSON.parse(localStorage.getItem(key)); 
}

// 1684211863626