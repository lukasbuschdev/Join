const logIn = async () => {
    event.preventDefault();
    const emailOrUsername = $('#email input').value;
    const password = $('#password input').value;

    const user = await getUserByInput(emailOrUsername);
    const { userData } = user;
    throwErrors(
        { identifier: 'invalid-email-or-username', bool: userData == undefined },
        { identifier: 'wrong-password', bool: (!(userData?.password == password)) || false },
        );
    if(userData == undefined) return;
    user.rememberMe();
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