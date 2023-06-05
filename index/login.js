const logIn = async () => {
    event.preventDefault();
    const emailOrUsername = $('#email input').value;
    const password = $('#password input').value;

    const userData = await getUser(emailOrUsername);
    const bool = userData == false;
    throwErrors(
        { identifier: 'invalid-email-or-username', bool },
        { identifier: 'wrong-password', bool: userData.password !== password },
        );
    if(!userData) return;
    if(userData.password !== password) {
        log('wrong password!');
        return;
    };    
    const user = new User(userData);
    user.rememberMe();
    user.logIn();
}

const rememberLoginDetails = () => {
    if (LOCAL_getItem('remember-me') !== null) {
        const { email, password } = LOCAL_getItem('remember-me');
        // LOCAL_setItem('user', { email, password });
        $('#email input').value = email;
        $('#password input').value = password;
        $('#remember-me').checked = true;
    }
}

const automaticLogin = async () => {
    if (!("PasswordCredential" in window)) return;
    const cred = await navigator.credentials.get({ password: true }) || false;
    if (cred == false) return;
    const user = await getUser(cred.id);
    user.logIn();
}