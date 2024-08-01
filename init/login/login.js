import { bindInlineFunctions, getContext } from "../../js/setup.js";

bindInlineFunctions(getContext(), [
	"/Join/init/init/init.js",
	"/Join/js/utilities.js",
	"/Join/index/legal_notice/legal_notice.js"
]);
import { LOCAL_getData, LOCAL_removeData, LOCAL_setData, STORAGE } from "../../js/storage.js";
import { User } from "../../js/user.class.js";
import { $, hashInputValue, throwErrors } from "../../js/utilities.js";

/**
 * Initializes the login process by setting up storage and remembering login details.
 * @async
 * @function initLogin
 * @returns {Promise<void>}
 */
export async function initLogin() {
	await STORAGE.init();
	rememberLoginDetails();
	initAutomaticLogin();
}

/**
 * Sets up automatic login by listening for focus events on input fields.
 * @function initAutomaticLogin
 */
export function initAutomaticLogin() {
	$("form").addEventListener(
		"focusin",
		() => {
			const target = event.target;
			if (target.tagName !== "INPUT" || target.type === "checkbox")
				return initAutomaticLogin();
			automaticLogin();
		},
		{ once: true }
	);
}

/**
 * Handles user login by validating credentials and remembering the user if required.
 * @async
 * @function logIn
 * @param {Event} event - The event object from the form submission.
 * @returns {Promise<void>}
 */
export async function logIn() {
	const emailOrUsername = $("#email input").value;
	const password = $("#password input").value;
	const hash = await hashInputValue(password);

	const user = STORAGE.getUserByInput(emailOrUsername);
	const passwordValidity = user?.password == hash || undefined;
	throwErrors(
		{ identifier: "invalid-email-or-username", bool: user == undefined },
		{ identifier: "wrong-password", bool: !passwordValidity || false }
	);
	if (!user || !passwordValidity) return;

	rememberMe(user, password);
	user.logIn();
}

/**
 * Handles guest login by logging in as a guest user.
 * @async
 * @function guestLogin
 * @returns {Promise<void>}
 */
export async function guestLogin() {
	const guestUser = STORAGE.getUserByInput("Guest");
	guestUser.logIn();
}

/**
 * Remembers the user's login details if the "remember me" option is selected.
 * @function rememberMe
 * @param {User} user - The user object.
 * @param {string} password - The user's password.
 */
export function rememberMe(user, password) {
	const shouldRemember = $("#remember-me").checked;
	if (!shouldRemember) return LOCAL_removeData("rememberMe");

	const tempUser = new User(user);
	tempUser.password = password;
	LOCAL_setData("rememberMe", JSON.stringify(tempUser));
	if ("PasswordCredential" in window) user.setCredentials(tempUser.password);
}

/**
 * Recalls login details from local storage and populates the login form.
 * @async
 * @function rememberLoginDetails
 * @returns {Promise<void>}
 */
export async function rememberLoginDetails() {
	const rememberedData = LOCAL_getData("rememberMe");
	if (!rememberedData) return;
	const { name, password } = rememberedData;
	if (name === "Guest") return;
	const user = STORAGE.getUserByInput(name);
	if (!user || (await hashInputValue(password)) !== user.password) return;
	$("#email input").value = name;
	$("#password input").value = password;
	$("#remember-me").setAttribute("checked", "true");
}

/**
 * Automatically logs in the user if credentials are stored in the browser.
 * @async
 * @function automaticLogin
 * @returns {Promise<void>}
 */
export async function automaticLogin() {
	if (!("PasswordCredential" in window)) return;
	navigator.credentials.preventSilentAccess();
	const cred = await navigator.credentials.get({ password: true });
	if (!cred) return;
	const user = await getUserByInput(cred.id);
	user.logIn();
}
