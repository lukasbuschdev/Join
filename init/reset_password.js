const initPage = () => {
    LANG_load();
}

const resetPassword = async () => {
    event.preventDefault();

    const newPasswordInput = $('#new-password input').value;
    const confirmPasswordInput = $('#confirm-password input').value;

    const paswordValidity = validPassword(newPasswordInput);
    const passwordsMatching = newPasswordInput == confirmPasswordInput;

    throwErrors({ identifier: 'invalid-password', bool: !paswordValidity });
    if (!paswordValidity) return;

    throwErrors({ identifier: 'different-passwords', bool: !passwordsMatching });
    if (!passwordsMatching) return;
    
    initiatePasswordChange(newPasswordInput);
}

const initiatePasswordChange = async (newPasswordInput) => {
    const userData = await REMOTE_getData(`users/${currentUserId()}`);
    const user = new User(userData);
    await user.resetPassword(newPasswordInput);
    await notification("password-reset");
    goTo('./init.html');
}