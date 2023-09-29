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
    const user = await REMOTE_getData(`users/${currentUserId()}`, true);
    await user.resetPassword(newPasswordInput);
    await notification("password-reset");
    goTo('summary', {reroute: true});
}