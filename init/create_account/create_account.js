import { bindInlineFunctions, getContext } from "../../js/setup.js";
bindInlineFunctions(getContext(), [
    '/Join/js/utilities.js'
])

export async function initCreateAccount() {
    renderColorWheel();
    initWebsocket();
    const { name } = await getCurrentUser();
    $('.user-img-container h1').innerText = name.slice(0, 2).toUpperCase();
    $('#user-name').innerText = name;
}

export async function finishSetup() {
    event.preventDefault();

    const phoneInput = $('#phone input').value;
    const phoneValidity = phoneInput ? validPhone(phoneInput) : true;
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

