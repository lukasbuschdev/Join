const validName = nameInput => nameInput !== '';

const validEmail = emailInput => {
    const emailRegex = new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");
    return emailRegex.test(emailInput);
}

const validPasswords = ([ { value: password }, { value: confirmPassword } ]) => password !== '' && password == confirmPassword;

const validateInputs = () => {
    const nameInput = $('input[type="text"]').value;
    const emailInput = $('input[type="email"]').value;
    const passwordInputs = $$('input[type="password"]');

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

const signupInit = () => {
    const name = $('input[type="text"]').value;
    const email = $('input[type="email"]').value;
    const password = $('input[type="password"]').value;
    event.preventDefault();
    if (!validateInputs(name, email, password)) return;
    checkAccount(name, email, password);
}

const checkAccount = async (key) => {
    if (await getItem(key)) {
        log('email adress already in use!');
        return;
    } else {
        createAccount();
    }
}

const createAccount = (name, email, password) => {
    const newAccount = new Account(name, email, password);
    REMOTE_setItem(newAccount.email, newAccount);
}

const togglePasswordVisibility = () => {
    event.preventDefault();
    const passwordInput = $('#password');
    const eye = $('#eye');
    passwordInput.type == 'password' ? passwordInput.type = 'text' : passwordInput.type = 'password';
    eye.src.includes('show.png') ? eye.src = '../assets/img/icons/hide.png' : eye.src = '../assets/img/icons/show.png';
}