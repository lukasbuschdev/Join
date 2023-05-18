const logIn = async () => {
    event.preventDefault();
    const email = $('#email input').value;
    const password = $('#password input').value;

    const accountData = await REMOTE_getItem(email);
    const user = new User(accountData.name, accountData.email, accountData.password);
    if (!user) {
        $('#email .error').classList.add('active');
        return;
    }
    if (user.password !== password) {
        $('#password .error').classList.add('active');
        return;
    }
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