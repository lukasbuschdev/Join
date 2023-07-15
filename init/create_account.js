const initCreateAccount = async () => {
    const uid = currentUserId();
    const { name } = await REMOTE_getData(`users/${uid}`);
    $('.user-img-container h1').innerText = name.slice(0, 2).toUpperCase();
}

const submitUpload = async () => {
    const formData = new FormData();
    const img = $('[type="file"]').files[0];
    if (!img) return;
    const uid = currentUserId();

    formData.append('user-img', img);
    formData.append('uid', uid)
    
    const {  imageSrc } = await (await fetch('../php/uploadImg.php', {
        method: 'POST',
        body: formData
    })).json();

    $('.user-img').src = imageSrc;
    $('.user-img-container').dataset.img = 'true';

    REMOTE_setData(`users/${uid}`, {img: imageSrc});
}

const removeUpload = async () => {
    const container = event.currentTarget;
    if (container.dataset.img == 'false') return;
    
    const uid = currentUserId();
    const formData = new FormData();
    formData.append('uid', uid)
    await fetch('../php/uploadImg.php', {
        method: 'POST',
        body: formData
    });

    container.$('img').src = '';
    container.dataset.img = false;
    REMOTE_setData(`users/${uid}`, {img: ""});
}

const finishSetup = async () => {
    event.preventDefault();
    const userData = await REMOTE_getData(`users/${currentUserId()}`);
    const user = new User(userData);
    user.logIn();
}