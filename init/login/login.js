function initLogin() {
    rememberLoginDetails();
    initAutomaticLogin();
}

function initAutomaticLogin() {
    $('form').addEventListener('focusin', () => {
        const target = event.target;
        if (target.tagName !== "INPUT" || target.type === "checkbox") return initAutomaticLogin();
        automaticLogin();
    }, { once: true });
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
    
    rememberMe(user, password);
    user.logIn();
}

const rememberMe = (user, password) => {
    const tempUser = new User(user);
    tempUser.password = password;
    const shouldRemember = $('#remember-me').checked;
    if (!shouldRemember) return LOCAL_setData('rememberMe', false);
    LOCAL_setData('rememberMe', tempUser);
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
    navigator.credentials.preventSilentAccess();
    const cred = await navigator.credentials.get({ password: true });
    if (!cred) return;
    const user = await getUserByInput(cred.id);
    user.logIn();
}