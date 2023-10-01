const initPage = () => {
    LANG_load();
}

const forgotPassword = async () => {
    event.preventDefault();

    const email = $('input').value;

    const user = await getUserByInput(email);
    const emailValidity = validEmail(email);

    throwErrors({ identifier: 'invalid-email', bool: !emailValidity });
    if (!emailValidity) return;

    throwErrors({ identifier: 'email-not-found', bool: !user });
    if (!user) return;

    log(await user.initPasswordReset());
    // await notification("email-sent");
    // goTo('login', {reroute: true});
}