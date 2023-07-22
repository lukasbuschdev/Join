const logIn = async () => {
    event.preventDefault();
    const emailOrUsername = $('#email input').value;
    const password = $('#password input').value;

    const user = await getUserByInput(emailOrUsername);
    const userData = user?.userData;
    const passwordValidity = userData?.password == password || undefined;
    throwErrors(
        { identifier: 'invalid-email-or-username', bool: userData == undefined },
        { identifier: 'wrong-password', bool: !passwordValidity || false },
        );
    if(!userData || !passwordValidity) return;
    user.rememberMe();
    await checkDevice(user);
    user.logIn();
}

const rememberLoginDetails = () => {
    if (LOCAL_getItem('remember-me') !== null) {
        const { email, password } = LOCAL_getItem('remember-me');
        $('#email input').value = email;
        $('#password input').value = password;
        $('#remember-me').checked = true;
    }
}

const automaticLogin = async () => {
    $$('input:not([type="checkbox"])').for(
        input => input.removeEventListener('focus', automaticLogin)
    );
    if (!("PasswordCredential" in window)) return;
    const cred = await navigator.credentials.get({ password: true }) || false;
    if (cred == false) return;
    const user = await getUser(cred.id);
    user.logIn();
}

const checkDevice = async (user) => {
    const savedId = LOCAL_getData('deviceId');
    if (!savedId) {
        const deviceData = await getDeviceData();
        await user.unknownDevice(deviceData);
    }
}