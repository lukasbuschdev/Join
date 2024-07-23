import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { STORAGE } from "../../js/storage.js";
import {
	$,
	currentUserId,
	goTo,
	hashInputValue,
	notification,
	throwErrors
} from "../../js/utilities.js";
import { invalidPassword } from "../init/init.js";

bindInlineFunctions(getContext(), [
	"/Join/init/init/init.js",
	"/Join/js/language.js",
	"/Join/js/utilities.js"
]);

export const initPage = () => {
	LANG.init();
};

export const resetPassword = async () => {
	event.preventDefault();

	const newPasswordInput = $("#new-password input").value;
	const confirmPasswordInput = $("#confirm-password input").value;

	const paswordValidity = invalidPassword(newPasswordInput);
	const passwordsMatching = newPasswordInput == confirmPasswordInput;

	throwErrors({ identifier: "invalid-password", bool: paswordValidity });
	if (paswordValidity) return;

	throwErrors({ identifier: "different-passwords", bool: !passwordsMatching });
	if (!passwordsMatching) return;

	initiatePasswordChange(newPasswordInput);
};

export const initiatePasswordChange = async (newPasswordInput) => {
	const user = STORAGE.currentUser;
	await user.resetPassword(await hashInputValue(newPasswordInput));
	await notification("password-reset");
	goTo("index/summary/summary", { reroute: true, search: `?uid=${user.id}` });
};
