let SOCKET;

const initSignup = () => {
    window.addEventListener('langLoaded', initPrivacyLink, {once: true});
    initPrivacyLink();
    initWebsocket();
}

const initPrivacyLink = () => {
    const privacyContainer = $('[data-lang="register-privacy"]');  
    privacyContainer.innerHTML = privacyContainer.innerHTML.replace(/%(.+)%/, (match, words) => {
        return /*html*/ `
            <span class="txt-blue" style="cursor: pointer;" onclick="initPrivacy()">${words}</span>
        `});
}

const initPrivacy = () => {
    window.open(`/Join/assets/templates/init/privacy.html`, '_blank')
}

const validateInputs = async ({ name, email, password, confirmPassword }) => {

    const nameValidity = invalidName(name);
    const nameInUse = !!(await getUserByInput(name));
    const emailValidity = invalidEmail(email);
    const emailInUse = !!(await getUserByInput(email));
    const passwordValidity = invalidPassword(password);
    const differentPasswords = password !== confirmPassword;
    const privacyAccepted = !($('[type="checkbox"]').checked);
    const legalNoticeAccepted = !($('[type="checkbox"]').checked);

    throwErrors(
        { identifier: 'invalid-name', bool: nameValidity },
        { identifier: 'name-in-use', bool: nameInUse },
        { identifier: 'invalid-email', bool: emailValidity },    
        { identifier: 'email-in-use', bool: emailInUse },    
        { identifier: 'invalid-password', bool: passwordValidity },
        { identifier: 'different-passwords', bool: differentPasswords },
        { identifier: 'accept-privacy', bool: privacyAccepted },
        { identifier: 'accept-legal-notice', bool: legalNoticeAccepted }
    );

    if(nameValidity == false &&
        nameInUse == false &&
        emailValidity == false &&
        passwordValidity == false &&
        emailInUse == false &&
        differentPasswords == false &&
        privacyAccepted == false &&
        legalNoticeAccepted == false) {
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

    if(await validateInputs(dataInput) == false) return;

    const hash = await hashInputValue(dataInput.password);
    dataInput.password = hash;
    const user = new User(dataInput);
    user.initVerification();
}