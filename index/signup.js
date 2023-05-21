const validName = (nameInput) => /^(?=.{5,20}$)(?![_])(?!.*[_]{2})[a-zA-Z0-9_]+(?<![_])$/.test(nameInput);

const validEmail = (emailInput) => /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/.test(emailInput);

const validPassword = (passwordInput) => {
    const passwordRegex = new RegExp(/^(?=.{8,}$)(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z]).+/, "g"); // at least one lowercase and one uppercase letter and one digit
    return passwordRegex.test(passwordInput);
}

const validateInputs = async ({ name, email, password }) => {

    const nameValidity = validName(name);
    const nameInUse = await getUser(name) == false;
    const emailValidity = validEmail(email);
    const emailInUse = await getUser(email) == false;
    const passwordValidity = validPassword(password);

    if (nameValidity == true && nameInUse == true && emailValidity == true && passwordValidity == true && emailInUse == true) {
        return true;
    }
    throwErrors(
        { identifier: 'invalid-name', bool: !nameValidity },
        { identifier: 'name-in-use', bool: !nameInUse },
        { identifier: 'invalid-email', bool: !emailValidity },    
        { identifier: 'email-in-use', bool: !emailInUse },    
        { identifier: 'invalid-password', bool: !passwordValidity }    
    );
    return false;
}

const signupInit = async () => {
    event.preventDefault();

    const userData = {
        name: $('#name input').value,
        email: $('#email input').value,
        password: $('#password input').value
    }
    const user = new User(userData);
    if (await validateInputs(userData) == false) {
        log('failed!')
        return;
    };
    log('passed')
    user.initVerification();
}

