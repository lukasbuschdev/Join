const initPage = () => {
    LANG_load();
}

const forgotPassword = async () => {
    event.preventDefault();

    const email = $('input').value;

    const emailInUse = await getUser(email) !== false;
    const validEmail = validEmail(email) == false;
    throwErrors({ identifier: 'invalid email', bool }, { identifier: 'email-not-found', bool: emailInUse });
}