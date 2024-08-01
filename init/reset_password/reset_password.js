import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { STORAGE } from "../../js/storage.js";
import { $, goTo, hashInputValue, notification, throwErrors } from "../../js/utilities.js";
import { invalidPassword } from "../init/init.js";

bindInlineFunctions(getContext(), [
	"/Join/init/init/init.js",
	"/Join/js/language.js",
	"/Join/js/utilities.js"
]);

/**
 * Initializes the page by setting up the language.
 * @function initPage
 */
export function initPage() {
	LANG.init();
}

/**
 * Handles the password reset process by validating and matching passwords, and initiating the password change.
 * @async
 * @function resetPassword
 * @param {Event} event - The event object from the form submission.
 * @returns {Promise<void>}
 */
export async function resetPassword(event) {
	event.preventDefault();

	const newPasswordInput = $("#new-password input").value;
	const confirmPasswordInput = $("#confirm-password input").value;

	const passwordValidity = invalidPassword(newPasswordInput);
	const passwordsMatching = newPasswordInput == confirmPasswordInput;

	throwErrors({ identifier: "invalid-password", bool: passwordValidity });
	if (passwordValidity) return;

	throwErrors({ identifier: "different-passwords", bool: !passwordsMatching });
	if (!passwordsMatching) return;

	initiatePasswordChange(newPasswordInput);
}

/**
 * Initiates the password change process by hashing the new password and updating the user record.
 * @async
 * @function initiatePasswordChange
 * @param {string} newPasswordInput - The new password input by the user.
 * @returns {Promise<void>}
 */
export async function initiatePasswordChange(newPasswordInput) {
	const user = STORAGE.currentUser;
	await user.resetPassword(await hashInputValue(newPasswordInput));
	await notification("password-reset");
	goTo("index/summary/summary", { reroute: true, search: `?uid=${user.id}` });
}
