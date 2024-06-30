import { bindInlineFunctions, getContext } from '../../js/setup.js';

bindInlineFunctions(getContext(), [
    '/Join/init/init/init.js',
    '/Join/js/utilities.js',
    // '/Join/js/language.js',
    '/Join/index/legal_notice/legal_notice.js'
])
import { getUserByInput, LOCAL_getData, LOCAL_removeData, LOCAL_setData, STORAGE } from "../../js/storage.js";
import { User } from "../../js/user.class.js";
import { $, hashInputValue, throwErrors } from "../../js/utilities.js";

export function initLogin() {
    rememberLoginDetails();
    initAutomaticLogin();
}

export function initAutomaticLogin() {
    $('form').addEventListener('focusin', () => {
        const target = event.target;
        if (target.tagName !== "INPUT" || target.type === "checkbox") return initAutomaticLogin();
        automaticLogin();
    }, { once: true });
}

export const logIn = async () => {
    event.preventDefault();
    const emailOrUsername = $('#email input').value;
    const password = $('#password input').value;
    const hash = await hashInputValue(password);
    
    const user = STORAGE.getUserByInput(emailOrUsername);
    const passwordValidity = user?.password == hash || undefined;
    throwErrors(
        { identifier: 'invalid-email-or-username', bool: user == undefined },
        { identifier: 'wrong-password', bool: !passwordValidity || false },
    );
    if(!user || !passwordValidity) return;
    
    rememberMe(user, password);
    user.logIn();
}

export async function guestLogin() {
    event.preventDefault();

    const guestUser = STORAGE.getUserByInput('Guest');
    guestUser.logIn();
}

export const rememberMe = (user, password) => {
    const shouldRemember = $('#remember-me').checked;
    if (!shouldRemember) return LOCAL_removeData('rememberMe');

    const tempUser = new User(user);
    tempUser.password = password;
    LOCAL_setData('rememberMe', JSON.stringify(tempUser));
    if ("PasswordCredential" in window) user.setCredentials(tempUser.password);
}

export const rememberLoginDetails = async () => {
    const rememberedData = LOCAL_getData('rememberMe');
    if (!rememberedData) return;
    const { name, password } = rememberedData;
    if (name === "Guest") return
    const user = await getUserByInput(name)
    if (!user || (await hashInputValue(password) !== user.password)) return
    $('#email input').value = name;
    $('#password input').value = password;
    $('#remember-me').setAttribute('checked', 'true');
}

export const automaticLogin = async () => {
    if (!("PasswordCredential" in window)) return;
    navigator.credentials.preventSilentAccess();
    const cred = await navigator.credentials.get({ password: true });
    if (!cred) return;
    const user = await getUserByInput(cred.id);
    user.logIn();
}