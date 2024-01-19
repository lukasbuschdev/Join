function initLogin() {
    rememberLoginDetails();
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
    Object.assign(tempUser, user);
    tempUser.password = password;
    
    rememberMe(tempUser);
    user.logIn();
}

const rememberMe = (user) => {
    const rememberLogin = $('#remember-me').getAttribute('checked');
    if (rememberLogin == 'false') return LOCAL_setData('rememberMe', false);
    LOCAL_setData('rememberMe', user);
    if ("PasswordCredential" in window) user.setCredentials();
}

const rememberLoginDetails = () => {
    const rememberedData = LOCAL_getData('rememberMe');
    if (!rememberedData) return;
    const { name, password } = rememberedData;
    console.log(rememberedData.password)
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