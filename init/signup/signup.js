let SOCKET;

const initSignup = () => {
    initPrivacyLink();
    initWebsocket();
}

const initPrivacyLink = () => {
    const privacyContainer = $('[data-lang="register-privacy"]')
    privacyContainer.innerHTML = privacyContainer.innerText.replace(/%.+%/, words => /*html*/`<span class="txt-blue" style="cursor: pointer;" onclick="initPrivacy()">${words.replaceAll('%','')}</span>`)
}

const initPrivacy = () => {
    window.open('/Join/index/privacy/privacy.html', '_blank')
}

const validateInputs = async ({ name, email, password, confirmPassword }) => {

    const nameValidity = invalidName(name);
    const nameInUse = !!(await getUserByInput(name));
    const emailValidity = invalidEmail(email);
    const emailInUse = !!(await getUserByInput(email));
    const passwordValidity = invalidPassword(password);
    const differentPasswords = password !== confirmPassword;
    const privacyAccepted = !($('[type="checkbox"]').checked);

    throwErrors(
        { identifier: 'invalid-name', bool: nameValidity },
        { identifier: 'name-in-use', bool: nameInUse },
        { identifier: 'invalid-email', bool: emailValidity },    
        { identifier: 'email-in-use', bool: emailInUse },    
        { identifier: 'invalid-password', bool: passwordValidity },
        { identifier: 'different-passwords', bool: differentPasswords },
        { identifier: 'accept-privacy', bool: privacyAccepted }
    );

    if (nameValidity == false &&
        nameInUse == false &&
        emailValidity == false &&
        passwordValidity == false &&
        emailInUse == false &&
        differentPasswords == false &&
        privacyAccepted == false) {
        return true;
    }
    return false;
}

const signupInit = async () => {
    event.preventDefault();

    const dataInput = {
        name: $('#name input').value,
        email: $('#email input').value,
        password: $('#password input').value,
        confirmPassword: $('#confirm-password input').value
    }

    if (await validateInputs(dataInput) == false) return;

    const hash = await hashInputValue(dataInput.password);
    dataInput.password = hash;
    const user = new User(dataInput);
    user.initVerification();
}

