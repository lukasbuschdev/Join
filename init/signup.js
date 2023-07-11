const validateInputs = async ({ name, email, password }) => {

    const nameValidity = validName(name);
    const nameInUse = await getUserByInput(name) == false;
    const emailValidity = validEmail(email);
    const emailInUse = await getUserByInput(email) == false;
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

    const dataInput = {
        name: $('#name input').value,
        email: $('#email input').value,
        password: $('#password input').value
    }

    if (await validateInputs(dataInput) == false) return;
    const user = new User(dataInput)
    user.initVerification();
}

