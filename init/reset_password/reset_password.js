const initPage = () => {
    LANG_load();
}

const resetPassword = async () => {
    event.preventDefault();

    const newPasswordInput = $('#new-password input').value;
    const confirmPasswordInput = $('#confirm-password input').value;

    const paswordValidity = invalidPassword(newPasswordInput);
    const passwordsMatching = newPasswordInput == confirmPasswordInput;

    throwErrors({ identifier: 'invalid-password', bool: paswordValidity });
    if (paswordValidity) return;

    throwErrors({ identifier: 'different-passwords', bool: !passwordsMatching });
    if (!passwordsMatching) return;
    
    initiatePasswordChange(newPasswordInput);
}

const initiatePasswordChange = async (newPasswordInput) => {
    const user = await REMOTE_getData(`users/${currentUserId()}`, true);
    await user.resetPassword(await hashInputValue(newPasswordInput));
    await notification("password-reset");
    goTo('index/summary/summary', {reroute: true, search: `?uid=${user.id}`});
}