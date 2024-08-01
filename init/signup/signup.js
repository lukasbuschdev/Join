import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { STORAGE } from "../../js/storage.js";
bindInlineFunctions(getContext(), [
	"/Join/init/init/init.js",
	"/Join/js/language.js",
	"/Join/index/privacy/privacy.js"
]);
import { User } from "../../js/user.class.js";
import { $, hashInputValue, throwErrors } from "../../js/utilities.js";
import { invalidEmail, invalidName, invalidPassword } from "../init/init.js";

/**
 * Initializes the signup process by setting up the storage and privacy link.
 * @async
 * @function initSignup
 * @returns {Promise<void>}
 */
export async function initSignup() {
	window.addEventListener("langLoaded", initPrivacyLink, { once: true });
	STORAGE.init();
}

/**
 * Initializes the privacy link in the signup form.
 * @function initPrivacyLink
 */
export function initPrivacyLink() {
	const privacyContainer = $('[data-lang="register-privacy"]');
	if (!privacyContainer) return;
	privacyContainer.removeAttribute("data-lang");
	privacyContainer.innerHTML = privacyContainer.innerHTML.replace(/%(.+)%/, (match, words) => {
		return /*html*/ `
            <span class="txt-blue" style="cursor: pointer;" onclick="window.open('/Join/assets/templates/init/privacy.html', '_blank')">${words}</span>
        `;
	});
}

/**
 * Validates the signup inputs for name, email, password, and confirms the acceptance of privacy and legal notices.
 * @async
 * @function validateInputs
 * @param {Object} inputs - The input fields to validate.
 * @param {string} inputs.name - The name input to validate.
 * @param {string} inputs.email - The email input to validate.
 * @param {string} inputs.password - The password input to validate.
 * @param {string} inputs.confirmPassword - The confirmation password input to validate.
 * @returns {Promise<boolean>} - Returns true if all inputs are valid, otherwise false.
 */
export async function validateInputs({ name, email, password, confirmPassword }) {
	const nameValidity = invalidName(name);
	const nameInUse = !!STORAGE.getUserByInput(name);
	const emailValidity = invalidEmail(email);
	const emailInUse = !!STORAGE.getUserByInput(email);
	const passwordValidity = invalidPassword(password);
	const differentPasswords = password !== confirmPassword;
	const privacyAccepted = !$('[type="checkbox"]').checked;
	const legalNoticeAccepted = !$('[type="checkbox"]').checked;

	throwErrors(
		{ identifier: "invalid-name", bool: nameValidity },
		{ identifier: "name-in-use", bool: nameInUse },
		{ identifier: "invalid-email", bool: emailValidity },
		{ identifier: "email-in-use", bool: emailInUse },
		{ identifier: "invalid-password", bool: passwordValidity },
		{ identifier: "different-passwords", bool: differentPasswords },
		{ identifier: "accept-privacy", bool: privacyAccepted }
	);

	if (
		nameValidity == false &&
		nameInUse == false &&
		emailValidity == false &&
		passwordValidity == false &&
		emailInUse == false &&
		differentPasswords == false &&
		privacyAccepted == false &&
		legalNoticeAccepted == false
	) {
		return true;
	}
	return false;
}

/**
 * Handles the signup process by validating inputs, hashing the password, and initializing user verification.
 * @async
 * @function signupInit
 * @returns {Promise<void>}
 */
export async function signupInit() {
	const dataInput = {
		name: $("#name input").value,
		email: $("#email input").value,
		password: $("#password input").value,
		confirmPassword: $("#confirm-password input").value
	};

	if ((await validateInputs(dataInput)) == false) return;

	const hash = await hashInputValue(dataInput.password);
	dataInput.password = hash;
	const user = new User(dataInput);
	user.initVerification();
}
