const validName = (nameInput) => nameInput !== '';

const validEmail = (emailInput) => {
    const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
    return emailRegex.test(emailInput);
}

const validPassword = (passwordInput) => {
    const passwordRegex = new RegExp(/(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z]).+/, "g"); // at least one lowercase and one uppercase letter and one digit
    return passwordInput.length >= 8 && passwordRegex.test(passwordInput);
}

const validateInputs = async () => {
    const name = $('#name input').value;
    const email = $('#email input').value;
    const password = $('#password input').value;

    const nameValidity = validName(name);
    const emailValidity = validEmail(email);
    const emailRegistered = await REMOTE_getItem(email);
    const passwordValidity = validPassword(password);

    if (nameValidity == true && emailValidity == true && passwordValidity == true && emailRegistered == false) {
        clearErrors();
        return true;
    }
    throwErrors(nameValidity, emailValidity, emailRegistered, passwordValidity);
    return false;
}

const throwErrors = (nameValidity, emailValidity, emailRegistered, passwordValidity) => {
    clearErrors();
    if (!nameValidity) {
        $('#name .error').classList.add('active');
    }
    if (!emailValidity) {
        $$('#email .error')[0].classList.add('active');
    }
    if (emailRegistered !== false) {
        $$('#email .error')[1].classList.add('active');
    }
    if (!passwordValidity) {
        $('#password .error').classList.add('active');
    }
}

const clearErrors = () => {
    $$('#name .error, #email .error, #password .error').forEach(
        field => field.classList.remove('active')
    );
}

const signupInit = async () => {
    event.preventDefault();

    const name = $('#name input').value;
    const email = $('#email input').value;
    const password = $('#password input').value;

    if (await validateInputs(name, email, password) == false) return;
    createAccount(name, email, password);
}

const createAccount = (name, email, password) => {
    // const newAccount = new Account(name, email, password);
    // REMOTE_setItem(newAccount.email, newAccount);
    log('creating account...')
    goToVerifyAccount();
}

