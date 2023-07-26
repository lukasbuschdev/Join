const initCreateAccount = async () => {
    renderColorWheel();
    const { name } = await getCurrentUserData();
    $('.user-img-container h1').innerText = name.slice(0, 2).toUpperCase();
    $('#user-name').innerText = name;
}

const submitUpload = async () => {
    const formData = new FormData();
    const img = $('[type="file"]').files[0];
    if (!img) return;
    const uid = currentUserId();

    formData.append('user-img', img);
    formData.append('uid', uid)
    
    const { imageSrc } = await (await fetch('/sJoin/php/uploadImg.php', {
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
    const phoneInput = $('#phone input').value;
    const phoneValidity = validPhone(phoneInput);
    
    throwErrors({ identifier: 'invalid-phone-number', bool: (phoneInput == true && !phoneValidity) });
    if (phoneInput !== "" && phoneValidity == false) return

    const user = await getCurrentUser();
    const userColor = HSLToHex($('.user-img-container').style.getPropertyValue('--user-clr'));

    if (userColor) user.setColor(userColor);
    user.setPhoneNumber(phoneInput);
    // user.logIn();
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

    const [r, g, b] = HSLToRGB(hue, 100, 50 + lightness);
    addAcceptColor(userColor, r, g, b);
}

const moveColorCursor = (offsetX, offsetY, userColor) => {
    $('#color-cursor').classList.remove('d-none');
    $('#color-cursor').style.setProperty('--x', offsetX);
    $('#color-cursor').style.setProperty('--y', offsetY);
    $('#color-cursor').style.backgroundColor = userColor;
}

const addAcceptColor = (userColor, r, g, b) => {
    $('#accept-user-color').classList.add('active');
    $('label').classList.remove('border');
    try {$('#accept-user-color').removeEventListener("click", colorPicker)}catch(e){};
    $('#accept-user-color').addEventListener("click", colorPicker = (event) => {
        event.preventDefault();
        $('.user-img-container').style.setProperty('--user-clr', userColor);
        event.currentTarget.previousElementSibling.click();
    });
}