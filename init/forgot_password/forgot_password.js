import { LANG_load } from "../../js/language.js";
import { bindInlineFunctions, goTo } from "../../js/setup.js";
import { getUserByInput } from "../../js/storage.js";
import { $, notification, throwErrors } from "../../js/utilities.js";
import { initWebsocket } from "../../js/websocket.js";
import { invalidEmail } from "../init/init.js";
bindInlineFunctions(getContext())

export function initPage() {
    return LANG_load()
}

export const forgotPassword = async () => {
    event.preventDefault();
    
    const email = $('input').value;
    
    const user = await getUserByInput(email);
    const emailValidity = invalidEmail(email);
    
    throwErrors({ identifier: 'invalid-email', bool: emailValidity });
    if (emailValidity) return;
    
    throwErrors({ identifier: 'email-not-found', bool: !user });
    if (!user) return;
    initWebsocket();

    await user.initPasswordReset();
    await notification("email-sent");
    goTo('init/login/login');
}