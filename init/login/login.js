function initLogin() {
    rememberLoginDetails();
    automaticLogin();
}

const logIn = async () => {
    event.preventDefault();
    const emailOrUsername = $('#email input').value;
    const password = $('#password input').value;
    const hash = await hashInputValue(password);
    
    const user = await getUserByInput(emailOrUsername);
    const passwordValidity = user?.password == hash || undefined;
    throwErrors(
        { identifier: 'invalid-email-or-username', bool: user == undefined },
        { identifier: 'wrong-password', bool: !passwordValidity || false },
    );
    if(!user || !passwordValidity) return;
    const tempUser = new User(user);
    tempUser.password = password;
    
    rememberMe(tempUser);
    user.logIn();
}

const rememberMe = (user) => {
    const shouldRemember = $('#remember-me').getAttribute('checked');
    if (shouldRemember == 'false') return LOCAL_setData('rememberMe', false);
    LOCAL_setData('rememberMe', user);
    if ("PasswordCredential" in window) user.setCredentials(user.password);
}

const rememberLoginDetails = () => {
    const rememberedData = LOCAL_getData('rememberMe');
    if (!rememberedData) return;
    const { name, password } = rememberedData;
    $('#email input').value = name;
    $('#password input').value = password;
    $('#remember-me').setAttribute('checked', 'true');
}

const automaticLogin = async () => {
    if (!("PasswordCredential" in window)) return;
    const cred = await navigator.credentials.get({ password: true }) || false;
    if (!cred) return;
    const user = await getUserByInput(cred.id);
    user.logIn();
}