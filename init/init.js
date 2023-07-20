const init = async () => {
    // $$('#email input, #password input').for(
    //     input => input.addEventListener('focus', automaticLogin)
    // )
    isSessionExpired();
}

const isSessionExpired = () => {
    const a = new URLSearchParams(document.location.search);
    if (a.has('expired')){
        document.addEventListener("visibilitychange", visibilityHander = () => {
            if (document.visibilityState == 'visible') {
                notification("automatic-signout");
                document.removeEventListener("visibilitychange", visibilityHander);
            }
        });
    }
}

function loadContent(template) {
    const url = `../assets/templates/init/${template}_template.html`;
    $('#content').includeTemplate(url);
}

const validName = (nameInput) => /^(?=.{4,20}$)(?![_])(?!.*[_]{2})[a-zA-Z0-9_]+(?<![_])$/.test(nameInput);

const validEmail = (emailInput) => /^(?=[a-zA-Z0-9])(?!.*[^a-zA-Z0-9]{2})[a-zA-Z0-9_!#$%&'*+\/=?`{|}~^.-]{0,63}[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*\.\w{2,3}$/.test(emailInput);

const validPassword = (passwordInput) => {
    const passwordRegex = new RegExp(/^(?=.{8,}$)(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z]).+/, "g"); // at least one lowercase and one uppercase letter and one digit
    return passwordRegex.test(passwordInput);
}

const validPhone = (phoneInput) => /^(?!00)0?\d{3}\s?(?!.*[\s])\d+/.test(phoneInput);

const goToLogin = async () => {
    $('[include-template]').setAttribute('include-template', '../assets/templates/init/login_template.html');
    await includeTemplates();
}

const goToSignup = async () => {
    $('[include-template]').setAttribute('include-template', '../assets/templates/init/signup_template.html');
    await includeTemplates();
}

const togglePasswordVisibility = () => {
    event.preventDefault();
    const passwordInput = event.currentTarget.previousElementSibling;
    const eye = event.currentTarget.children[0];
    passwordInput.type == 'password' ? passwordInput.type = 'text' : passwordInput.type = 'password';
    eye.src = eye.src.includes('show.png') ? '../assets/img/icons/hide.png' : '../assets/img/icons/show.png';
}

const throwErrors = (...params) => {
    params.forEach(({identifier, bool}) => {
        const errorContainer = $(`#${identifier}`);
        const inputWrapper = errorContainer.closest('.inp-wrapper').$('.inp-container');

        errorContainer.classList.toggle('active', bool);
        inputWrapper.classList.toggle('active', bool);
    });
}