const init = async () => {
    await includeTemplates();
    LANG_load();
    if (document.title == 'Join - Login') {
        rememberLoginDetails();
    }

    automaticLogin();
}

const validName = (nameInput) => /^(?=.{5,20}$)(?![_])(?!.*[_]{2})[a-zA-Z0-9_]+(?<![_])$/.test(nameInput);

const validEmail = (emailInput) => /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/.test(emailInput);

const validPassword = (passwordInput) => {
    const passwordRegex = new RegExp(/^(?=.{8,}$)(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z]).+/, "g"); // at least one lowercase and one uppercase letter and one digit
    return passwordRegex.test(passwordInput);
}

const goToLogin = async () => {
    $('[include-template]').setAttribute('include-template', '../assets/templates/login_template.html');
    await includeTemplates();
    LANG_load();
}

const goToSignup = async () => {
    $('[include-template]').setAttribute('include-template', '../assets/templates/signup_template.html');
    await includeTemplates();
    LANG_load();
}

const togglePasswordVisibility = () => {
    event.preventDefault();
    const passwordInput = $('#password input');
    const eye = $('#eye');
    passwordInput.type == 'password' ? passwordInput.type = 'text' : passwordInput.type = 'password';
    eye.src.includes('show.png') ? eye.src = '../assets/img/icons/hide.png' : eye.src = '../assets/img/icons/show.png';
}

const throwErrors = (...params) => {
    params.forEach(({identifier, bool}) => $(`#${identifier}`).classList.toggle('active', bool));
}