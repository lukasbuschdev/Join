import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { STORAGE } from "../../js/storage.js";
bindInlineFunctions(getContext(), [
	"/Join/init/init/init.js",
	"/Join/js/utilities.js",
	"/Join/js/language.js"
]);
import { $, notification, throwErrors, goTo } from "../../js/utilities.js";
import { invalidEmail } from "../init/init.js";

/**
 * Handles the forgot password functionality by validating the email input, initiating password reset, and notifying the user.
 * @async
 * @function forgotPassword
 * @param {Event} event - The event object from the form submission.
 * @returns {Promise<void>}
 */
export async function forgotPassword() {
	const email = $("input").value;

	const user = STORAGE.getUserByInput(email);
	const emailValidity = invalidEmail(email);

	throwErrors({ identifier: "invalid-email", bool: emailValidity });
	if (emailValidity) return;

	throwErrors({ identifier: "email-not-found", bool: !user });
	if (!user) return;
	initWebsocket();

	await user.initPasswordReset();
	await notification("email-sent");
	goTo("init/login/login");
}
