const init = async () => {
    if (document.title == 'Join - Login') {
        rememberLoginDetails();
    }
    // $$('#email input, #password input').for(
    //     input => input.addEventListener('focus', automaticLogin)
    // )
}

function loadContent(template) {
    const url = `../assets/templates/init/${template}_template.html`;
    $('#content').includeTemplate(url);
}

const validName = (nameInput) => /^(?=.{5,20}$)(?![_])(?!.*[_]{2})[a-zA-Z0-9_]+(?<![_])$/.test(nameInput);

const validEmail = (emailInput) => /^(?=[a-zA-Z0-9])(?!.*[^a-zA-Z0-9]{2})[a-zA-Z0-9_!#$%&'*+\/=?`{|}~^.-]{0,63}[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*\.\w{2,3}$/.test(emailInput);

const validPassword = (passwordInput) => {
    const passwordRegex = new RegExp(/^(?=.{8,}$)(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z]).+/, "g"); // at least one lowercase and one uppercase letter and one digit
    return passwordRegex.test(passwordInput);
}

const goToLogin = async () => {
    $('[include-template]').setAttribute('include-template', '../assets/templates/init/login_template.html');
    await includeTemplates();
    LANG_load();
}

const goToSignup = async () => {
    $('[include-template]').setAttribute('include-template', '../assets/templates/init/signup_template.html');
    await includeTemplates();
    LANG_load();
}

const togglePasswordVisibility = () => {
    event.preventDefault();
    const passwordInput = $('#password input');
    const eye = $('#eye');
    passwordInput.type == 'password' ? passwordInput.type = 'text' : passwordInput.type = 'password';
    eye.src = eye.src.includes('show.png') ? '../assets/img/icons/hide.png' : '../assets/img/icons/show.png';
}

const throwErrors = (...params) => {
    params.forEach(({identifier, bool}) => $(`#${identifier}`).classList.toggle('active', bool));
}