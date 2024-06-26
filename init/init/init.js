import { STORAGE } from "../../js/storage.js";
import { notification } from "../../js/utilities.js";
import { $ } from "/Join/js/utilities.js";
import "/join/js/prototype_extensions.js"

export const init = async () => {

    await STORAGE.init()
    if(!STORAGE.data) return

    isSessionExpired();
    $('.language-login').initMenus();
}

export function isSessionExpired() {
    const a = new URLSearchParams(document.location.search);
    if (a.has('expired')){
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState == 'visible') return notification("automatic-signout");
            isSessionExpired();
        }, { once: true });
    }
}

export const invalidName = (nameInput) => !(/^(?=.{4,20}$)(?![_])(?!.*  )(?!.*[_]{2})[a-zA-Z0-9_ ]+(?<![_])$/.test(nameInput));

export const invalidEmail = (emailInput) => !(/^(?=[a-zA-Z0-9])(?!.*[^a-zA-Z0-9]{2})[a-zA-Z0-9_!#$%&'*+\/=?`{|}~^.-]{0,63}[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*\.\w{2,3}$/.test(emailInput));

export const invalidPassword = (passwordInput) => {
    const passwordRegex = new RegExp(/^(?=.{8,}$)(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z]).+/, "g"); // at least one lowercase and one uppercase letter and one digit
    return !(passwordRegex.test(passwordInput));
}

export const validPhone = (phoneInput) => /^(?!00)0?\d{3}\s?(?!.*[\s])\d+/.test(phoneInput);

export const togglePasswordVisibility = () => {
    event.preventDefault();
    const passwordInput = event.currentTarget.previousElementSibling;
    const eye = event.currentTarget.children[0];
    passwordInput.type == 'password' ? passwordInput.type = 'text' : passwordInput.type = 'password';
    eye.src = eye.src.includes('show.png') ? '/Join/assets/img/icons/hide.png' : '/Join/assets/img/icons/show.png';
}

export function changeLanguageImage() {
    const selectElement = $('#language-selection');
    const selectedValue = selectElement.value;
    const selectBox = selectElement.parentElement;

    const languageImages = {
        en: 'english',
        de: 'german',
        es: 'spanish',
        pg: 'portuguese',
        fr: 'french',
        it: 'italian',
        tk: 'turkish',
    };
    selectBox.style.backgroundImage = `url(/Join/assets/img/icons/${languageImages[selectedValue]}.png)`;
}


export function toggleLangSelection() {
    $('.language-login').classList.toggle('active');
}

export function checkKeys () {
    if (!(event.key === "Enter")) return;
    event.preventDefault();
    const submitBtn = $('button[type="submit"]');

    if (!$('form input:placeholder-shown')) submitBtn.click();
}