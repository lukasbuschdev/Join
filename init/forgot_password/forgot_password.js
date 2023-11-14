let SOCKET;

const initPage = () => {
    // LANG_load();
}

const forgotPassword = async () => {
    event.preventDefault();
    
    const email = $('input').value;
    
    const user = await getUserByInput(email);
    const emailValidity = invalidEmail(email);
    
    throwErrors({ identifier: 'invalid-email', bool: emailValidity });
    if (emailValidity) return;
    
    throwErrors({ identifier: 'email-not-found', bool: !user });
    if (!user) return;
    initWebsocket(user.id);

    await user.initPasswordReset();
    await notification("email-sent");
    goTo('init/login/login');
}