const validName = nameInput => nameInput !== '';

const validEmail = emailInput => {
    const emailInputArray = [...emailInput];
    return emailInputArray.indexOf('@') < emailInputArray.findLastIndex(character => character == '.');
}

const validPasswords = ([ { value: password }, { value: confirmPassword } ]) => password !== false && password == confirmPassword;

const validateInputs = () => {
    const nameInput = $('input[type="text"]').value;
    const emailInput = $('input[type="email"]').value;
    const passwordInputs = $$('input[type="password"');

    if (!validName(nameInput)) {
        log('Not a valid name!');
        return false;
    }

    if (!validEmail(emailInput)) {
        log('Not a valid email!');
        return false;
    }

    else if (!validPasswords(passwordInputs)) {
        log('Passwords not matching!');
        return false;
    }
    return true;
}

const validatePasswordInputs = () => {
    const passwordInputs = $$('input[type="password"]');
}

const signUp = () => {
    event.preventDefault();
    if (!validateInputs()) return;
    log('Valid Inputs!');
}