import { LANG } from "../../js/language.js";
import { STORAGE } from "../../js/storage.js";
import { notification, $ } from "../../js/utilities.js";
import "/Join/js/prototype_extensions.js";

/**
 * Initializes the application by setting up storage and checking session state.
 * @async
 * @function init
 * @returns {Promise<void>}
 */
export async function init() {
	await STORAGE.init();
	if (!STORAGE.data) return;

	isSessionExpired();
	$(".language-login").initMenus();
	$("form").addEventListener("submit", (event) => event.preventDefault());
}

/**
 * Checks if the session is expired and sets up a notification listener.
 * @function isSessionExpired
 */
export function isSessionExpired() {
	const a = new URLSearchParams(document.location.search);
	if (a.has("expired")) {
		document.addEventListener(
			"visibilitychange",
			() => {
				if (document.visibilityState == "visible") return notification("automatic-signout");
				isSessionExpired();
			},
			{ once: true }
		);
	}
}

/**
 * Validates the username input.
 * @function invalidName
 * @param {string} nameInput - The name input to validate.
 * @returns {boolean} - Returns true if the name is invalid, otherwise false.
 */
export function invalidName(nameInput) {
	return !/^(?=.{4,20}$)(?![_])(?!.*  )(?!.*[_]{2})[a-zA-Z0-9_ ]+(?<![_])$/.test(nameInput);
}

/**
 * Validates the email input.
 * @function invalidEmail
 * @param {string} emailInput - The email input to validate.
 * @returns {boolean} - Returns true if the email is invalid, otherwise false.
 */
export function invalidEmail(emailInput) {
	return !/^(?=[a-zA-Z0-9])(?!.*[^a-zA-Z0-9]{2})[a-zA-Z0-9_!#$%&'*+\/=?`{|}~^.-]{0,63}[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*\.\w{2,3}$/.test(
		emailInput
	);
}

/**
 * Validates the password input.
 * @function invalidPassword
 * @param {string} passwordInput - The password input to validate.
 * @returns {boolean} - Returns true if the password is invalid, otherwise false.
 */
export function invalidPassword(passwordInput) {
	const passwordRegex = new RegExp(/^(?=.{8,}$)(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z]).+/, "g"); // at least one lowercase and one uppercase letter and one digit
	return !passwordRegex.test(passwordInput);
}

/**
 * Validates the phone number input.
 * @function validPhone
 * @param {string} phoneInput - The phone input to validate.
 * @returns {boolean} - Returns true if the phone number is valid, otherwise false.
 */
export function validPhone(phoneInput) {
	return /^(?!00)[\+0]?\d{3}\s?(?!.*[\s])\d+/.test(phoneInput);
}

/**
 * Toggles the visibility of the password input field.
 * @function togglePasswordVisibility
 */
export function togglePasswordVisibility() {
	event.preventDefault();
	const passwordInput = event.currentTarget.previousElementSibling;
	const eye = event.currentTarget.children[0];
	passwordInput.type == "password"
		? (passwordInput.type = "text")
		: (passwordInput.type = "password");
	eye.src = eye.src.includes("show.png")
		? "/Join/assets/img/icons/hide.png"
		: "/Join/assets/img/icons/show.png";
}

/**
 * Changes the background image of the language selection box based on the selected language.
 * @function changeLanguageImage
 */
export function changeLanguageImage() {
	const selectElement = $("#language-selection");
	const selectedValue = selectElement.value;
	const selectBox = selectElement.parentElement;

	const languageImages = {
		en: "english",
		de: "german",
		es: "spanish",
		pg: "portuguese",
		fr: "french",
		it: "italian",
		tk: "turkish"
	};
	selectBox.style.backgroundImage = `url(/Join/assets/img/icons/${languageImages[selectedValue]}.png)`;
}

/**
 * Toggles the visibility of the language selection menu.
 * @function toggleLangSelection
 */
export function toggleLangSelection() {
	$(".language-login").classList.toggle("active");
}

/**
 * Checks for the "Enter" key press and submits the form if all inputs are filled.
 * @function checkKeys
 */
export function checkKeys() {
	if (!(event.key === "Enter")) return;
	event.preventDefault();
	const submitBtn = $('button[type="submit"]');

	if (!$("form input:placeholder-shown")) submitBtn.click();
}

/**
 * Changes the application language to the target language.
 * @function changeLanguage
 * @param {string} targetLanguage - The target language code.
 */
export function changeLanguage(targetLanguage) {
	LANG.change(targetLanguage);
}
