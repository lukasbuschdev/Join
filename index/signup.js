const validName = nameInput => nameInput !== '';

const validEmail = emailInput => {
    const emailInputArray = [...emailInput];
    const emailRegex = 
 new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
    // return emailInputArray.indexOf('@') < emailInputArray.findLastIndex(character => character == '.');
    return emailRegex.test(emailInput);
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