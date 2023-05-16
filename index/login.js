const logIn = async () => {
    event.preventDefault();
    const email = $('input[type="email"]').value;
    const password = $('input[type="password"]').value;

    const account = await REMOTE_getItem(email);
    if (account) {
        if (account.password == password) {
            logInUser(account);
        } else {
            log('wrong password!');
        }
    } else {
        log('email not found!')
    }
}

const logInUser = ({ name, email, password }) => {
    const rememberLoginCredentials = $('input[type="checkbox"]').checked;
    if (rememberLoginCredentials) {
        LOCAL_setItem('remember-me', { email, password });
    } else {
        if (LOCAL_getItem('remember-me') !== null) {
            LOCAL_removeItem('remember-me');
            log('forgot login Credentials')
        }
    }
    log(`Welcome back, ${name}!`);
    goToPage('summary');
}

const rememberLogin = () => {
    if (LOCAL_getItem('remember-me') !== null) {
        const { email, password } = LOCAL_getItem('remember-me');
        LOCAL_setItem('user', { email, password });
    }
    goToPage('summary');
}