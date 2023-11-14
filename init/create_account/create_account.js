const initCreateAccount = async () => {
    renderColorWheel();
    initWebsocket(currentUserId());
    const { name } = await getCurrentUser();
    $('.user-img-container h1').innerText = name.slice(0, 2).toUpperCase();
    $('#user-name').innerText = name;
}

const submitUpload = async () => {
    const formData = new FormData();
    const img = $('[type="file"]').files[0];
    if (!img) return;
    const uid = currentUserId();

    const [fileType, extension] = img.type.split('/');
    if (fileType !== "image") return error(`file is not an image!`);
    const maxSize = 1024 * 1024;
    if (img.size > maxSize) return error(`file is ${img.size - maxSize} Bytes too big!`);

    SOCKET.emit('uploadImg', img, extension);

    const imageSrc = await new Promise(resolve => {
        SOCKET.on('imgId', async id => {
            const imageSrc = `https://drive.google.com/uc?export=view&id=${id}`;
            await REMOTE_setData(`users/${uid}`, {img: imageSrc});
            resolve(imageSrc);
        });
    });

    // formData.append('user-img', img);
    // formData.append('uid', uid);
    // formData.append('suffix', Date.now().toString().slice(-4));
    
    // const {imageSrc} = await (await fetch('/Join/php/uploadImg.php', {
    //     method: 'POST',
    //     body: formData
    // })).json();

    $('.account.user-img-container').dataset.img = 'true';
    $('[type="file"]').value = '';

    $('.user-img').src = imageSrc;
    // REMOTE_setData(`users/${uid}`, {img: imageSrc});
    // if (typeof USER !== undefined) {
    //     USER.img = imageSrc;
    //     renderUserData();
    // }
}

const removeUpload = async () => {
    const container = event.currentTarget;
    if (event.target.tagName == "LABEL" || event.target.tagName == "INPUT") return;
    if (container.dataset.img == 'false') return;
    
    const uid = currentUserId();
    const formData = new FormData();
    formData.append('uid', uid)
    await fetch('/Join/php/uploadImg.php', {
        method: 'POST',
        body: formData
    });
    
    $('[type="file"]').value = '';
    container.$('img').src = '';
    container.dataset.img = false;
    REMOTE_setData(`users/${uid}`, {img: ""});
}

const finishSetup = async () => {
    event.preventDefault();

    const phoneInput = $('#phone input').value;
    const phoneValidity = validPhone(phoneInput);
    throwErrors({ identifier: 'invalid-phone-number', bool: (phoneInput == true && !phoneValidity) });
    
    if (phoneValidity == false) return

    const user = await getCurrentUser(true);
    const userColor = HSLToHex($('.user-img-container').style.getPropertyValue('--user-clr'));

    if (userColor) user.color = userColor;
    if (phoneInput) user.phone = phoneInput;
    if (userColor) user.color = userColor;
    await user.update();
    user.logIn();
}

const renderColorWheel = () => {
    let clrBg = [];
    const factor = 12;
    for (let i = 0; i < 361; i+= 360 / factor) {
        clrBg.push(`hsl(${i}, 100%, 50%)`)
    }
    const lightnessBg = bezierGradient({
        colors: ['white', 'transparent', 'black'],
        resolution: 10
    });
    $('#color-wheel').style.backgroundImage = `radial-gradient(${lightnessBg}), conic-gradient(${clrBg.join(', ')})`;
}

const toggleColorPicker = () => {
    event.preventDefault();
    event.stopPropagation();
    $('#color-wheel').classList.toggle('d-none');
    $('label').classList.toggle('d-none');
    if (event.currentTarget.classList.contains('active') && $('.user-img-container').style.getPropertyValue('--user-clr') == false) {
        $('#color-cursor').classList.add('d-none');
        $('#accept-user-color').classList.remove('active');
    }
    $('#user-color').classList.toggle('active');
}

const pickColor = () => {
    const width = event.currentTarget.offsetWidth;
    const heigth = event.currentTarget.offsetHeight;
    const { offsetX, offsetY } = event;
    const x = offsetX - width / 2;
    const y = offsetY - heigth / 2;

    const hue = Math.round((Math.atan2(y, x) * (180 / Math.PI)) + 450) % 360;
    const lightness = 30 - Math.round(getFraction(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) * 60, width / 2));
    const userColor = `hsl(${hue}, 100%, ${50 + lightness}%)`

    moveColorCursor(offsetX, offsetY, userColor);
    addAcceptColor(userColor);
}

const moveColorCursor = (offsetX, offsetY, userColor) => {
    const colorCursor = $('#color-cursor');
    colorCursor.classList.remove('d-none');
    colorCursor.style.setProperty('--x', offsetX);
    colorCursor.style.setProperty('--y', offsetY);
    colorCursor.style.backgroundColor = userColor;
}

const addAcceptColor = (userColor) => {
    $('#accept-user-color').classList.add('active');
    $('label').classList.remove('border');
    try {$('#accept-user-color').removeEventListener("click", colorPicker)}catch(e){};
    $('#accept-user-color').addEventListener("click", colorPicker = (event) => {
        event.preventDefault();
        $$('.user-img-container.account').for(button => button.style.setProperty('--user-clr', userColor));
        if (typeof USER !== undefined) {
            USER.color = userColor;
            USER.update();
        };
        $('#user-color').click();
        renderUserData();
    }, {once: true});
}