const init = async () => {
    await includeTemplates();
    if (document.title == 'Join - Login') {
        rememberLoginDetails();
    }
}

const goToLogin = async () => {
    document.title = 'Join - Login';
    $('[include-template]').setAttribute('include-template', '../assets/templates/login_template.html');
    includeTemplates();
}

const goToSignup = () => {
    document.title = 'Join - Sign up';
    $('[include-template]').setAttribute('include-template', '../assets/templates/signup_template.html');
    includeTemplates();
}

const goToForgotPw = () => {
    document.title = 'Join - Forgot password';
    $('[include-template]').setAttribute('include-template', '../assets/templates/forgot_password_template.html');
    includeTemplates();
}

// const goToVerifyAccount = () => {
//     document.title = 'Join - Verify your Account';
//     $('[include-template]').setAttribute('include-template', '../assets/templates/verify_account_template.html');
//     includeTemplates();
//     initVerification();
// }

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