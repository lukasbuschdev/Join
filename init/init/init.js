import { LANG } from "../../js/language.js";
import { STORAGE } from "../../js/storage.js";
import { notification, $ } from "../../js/utilities.js";
import "/Join/js/prototype_extensions.js";

/**
 * Initializes the storage, checks session expiration, and sets up event listeners.
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
 * Checks if the session is expired based on URL parameters and visibility change events.
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
 * Validates a username based on specified criteria.
 * @param {string} nameInput - The username to validate.
 * @returns {boolean} - Returns true if the username is invalid.
 */
export const invalidName = (nameInput) => !/^(?=.{4,20}$)(?![_])(?!.*  )(?!.*[_]{2})[a-zA-Z0-9_ ]+(?<![_])$/.test(nameInput);

/**
 * Validates an email address based on specified criteria.
 * @param {string} emailInput - The email address to validate.
 * @returns {boolean} - Returns true if the email address is invalid.
 */
export const invalidEmail = (emailInput) => !/^(?=[a-zA-Z0-9])(?!.*[^a-zA-Z0-9]{2})[a-zA-Z0-9_!#$%&'*+\/=?`{|}~^.-]{0,63}[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*\.\w{2,3}$/.test(emailInput);

/**
 * Validates a password based on specified criteria.
 * @param {string} passwordInput - The password to validate.
 * @returns {boolean} - Returns true if the password is invalid.
 */
export const invalidPassword = (passwordInput) => {
	const passwordRegex = new RegExp(/^(?=.{8,}$)(?=.*?[0-9])(?=.*?[a-z])(?=.*?[A-Z]).+/, "g"); // at least one lowercase and one uppercase letter and one digit
	return !passwordRegex.test(passwordInput);
};

/**
 * Validates a phone number based on specified criteria.
 * @param {string} phoneInput - The phone number to validate.
 * @returns {boolean} - Returns true if the phone number is valid.
 */
export const validPhone = (phoneInput) => /^(?!00)[\+0]?\d{3}\s?(?!.*[\s])\d+/.test(phoneInput);

/**
 * Toggles the visibility of the password input field.
 */
export const togglePasswordVisibility = () => {
	event.preventDefault();
	const passwordInput = event.currentTarget.previousElementSibling;
	const eye = event.currentTarget.children[0];
	passwordInput.type == "password" ? (passwordInput.type = "text") : (passwordInput.type = "password");
	eye.src = eye.src.includes("show.png") ? "/Join/assets/img/icons/hide.png" : "/Join/assets/img/icons/show.png";
};

/**
 * Changes the language selection image based on the selected language.
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
 */
export function toggleLangSelection() {
	$(".language-login").classList.toggle("active");
}

/**
 * Checks for the Enter key press and submits the form if all input fields are filled.
 */
export function checkKeys() {
	if (!(event.key === "Enter")) return;
	event.preventDefault();
	const submitBtn = $('button[type="submit"]');

	if (!$("form input:placeholder-shown")) submitBtn.click();
}

/**
 * Changes the current language of the application.
 * @param {string} targetLanguage - The target language to change to.
 */
export function changeLanguage(targetLanguage) {
	LANG.change(targetLanguage);
}
