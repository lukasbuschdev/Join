const logIn = () => {
    event.preventDefault();
}

const init = () => {
    includeTemplates();
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