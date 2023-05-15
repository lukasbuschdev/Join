const STORAGE_TOKEN = 'NVTVE0QJKQ005SECVM4281V290DQJKIG6V0LRBYV';
const STORAGE_URL = 'https://remote-storage.developerakademie.org/item';

const setItem = async (key, value) => 
fetch(STORAGE_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    });