import { LANG } from "../../js/language.js";
import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { STORAGE } from "../../js/storage.js";
import { User } from "../../js/user.class.js";
import { $, $$, goTo, isLetterOrNumber } from "../../js/utilities.js";
bindInlineFunctions(getContext());

/**
 * Initializes the account verification process by setting up language, storage, timer, and checking email verification.
 * @async
 * @function initVerifyAccount
 * @returns {Promise<void>}
 */
export async function initVerifyAccount() {
	LANG.init();
	await STORAGE.init();
	initTimer();
	checkEmailVerification();
}

/**
 * Checks the email verification code from the URL and matches it with the stored verification code.
 * @async
 * @function checkEmailVerification
 * @returns {Promise<void>}
 */
export async function checkEmailVerification() {
	const uid = STORAGE.currentUserId();
	const verification = STORAGE.get(`verification/${uid}`);
	if (verification === undefined) return;
	const {
		verifyCode: { code }
	} = verification;
	if (new URLSearchParams(location.search).get("token") !== code) return;
	fillCodeInputs(code);
}

/**
 * Initializes a countdown timer for the verification code expiration.
 * @async
 * @function initTimer
 * @returns {Promise<void>}
 */
export async function initTimer() {
	const uid = STORAGE.currentUserId();
	const {
		verifyCode: { expires }
	} = STORAGE.get(`verification/${uid}`);
	if (expires == undefined) return;
	const timer = setInterval(() => {
		const now = Date.now();
		if (expires <= now) {
			clearInterval(timer);
			$("#timer").classList.toggle("d-none");
			$('[data-lang="expires-in"]').classList.toggle("d-none");
			$('[data-lang="code-expired"]').classList.toggle("d-none");
			return;
		}
		const minutes = Math.floor((expires - now + 1000) / 60 / 1000);
		const seconds = Math.round((expires - now) / 1000) % 60;
		$("#timer").innerText = `0${minutes}:${(seconds / 100).toFixed(2).toString().slice(-2)}`;
	}, 1000);
}

/**
 * Processes the verification code entered by the user and verifies the account if valid.
 * @async
 * @function processVerification
 * @param {Event} event - The event object from the form submission.
 * @returns {Promise<void>}
 */
export async function processVerification(event) {
	event.preventDefault();

	const uid = STORAGE.currentUserId();
	const {
		verifyCode: { code, expires },
		userData
	} = STORAGE.get(`verification/${uid}`);

	const inputCode = [...$$("input")].map((input) => input.value).join("");

	if (code !== inputCode) {
		$$(".error")[0].classList.add("active");
		return;
	}
	if (expires < Date.now()) {
		$$(".error")[1].classList.add("active");
		return;
	}
	const newUser = new User(userData);
	await newUser.verify();
	goTo("init/create_account/create_account", { search: `?uid=${userData.id}` });
}

/**
 * Sends a new verification code to the user.
 * @function sendNewCode
 * @param {Event} event - The event object from the form submission.
 */
export function sendNewCode(event) {
	event.preventDefault();
	const { userData } = STORAGE.get(`verification/${STORAGE.currentUserId()}`);
	const user = new User(userData);
	user.initVerification();
}

/**
 * Moves the focus between input fields for the verification code and handles input.
 * @function incrementCodeInputField
 * @param {Event} event - The keyboard event from the input field.
 */
export function incrementCodeInputField(event) {
	const input = event.currentTarget;
	if (input.value.length !== 1) return;
	if (event.key == "Backspace") {
		input.value = "";
		input.previousElementSibling?.focus();
	} else if (isLetterOrNumber(event.key)) {
		input.nextElementSibling?.focus();
		try {
			input.nextElementSibling.value = event.key;
		} catch (e) {}
	}
	event.preventDefault();
}

/**
 * Fills the input fields with the verification code.
 * @function fillCodeInputs
 * @param {string} code - The verification code to fill in the input fields.
 */
export function fillCodeInputs(code) {
	$$("input").forEach((input, i) => setTimeout(() => (input.value = code[i]), 200 * i));
}

/**
 * Handles pasting of the verification code into the input fields.
 * @function pasteCode
 * @param {Event} event - The clipboard event.
 */
export function pasteCode(event) {
	event.preventDefault();
	const code = event.clipboardData.getData("text");
	fillCodeInputs(code);
}
