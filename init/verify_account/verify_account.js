import { LANG } from "../../js/language.js";
import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { STORAGE } from "../../js/storage.js";
import { User } from "../../js/user.class.js";
import { $, $$, goTo, isLetterOrNumber } from "../../js/utilities.js";
bindInlineFunctions(getContext());

export async function initVerifyAccount() {
	LANG.init();
	await STORAGE.init();
	initTimer();
	checkEmailVerification();
}

export async function checkEmailVerification() {
	const uid = STORAGE.currentUserId();
	const verificaiton = STORAGE.get(`verification/${uid}`);
	if (verificaiton === undefined) return;
	const {
		verifyCode: { code }
	} = verificaiton;
	if (new URLSearchParams(location.search).get("token") !== code) return;
	fillCodeInputs(code);
}

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
 * @returns {Promise<void>}
 */
export async function processVerification() {
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
 */
export function sendNewCode() {
	const { userData } = STORAGE.get(`verification/${STORAGE.currentUserId()}`);
	const user = new User(userData);
	user.initVerification();
}

export function incrementCodeInputField() {
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

export function fillCodeInputs(code) {
	$$("input").forEach((input, i) => setTimeout(() => (input.value = code[i]), 200 * i));
}

export function pasteCode() {
	event.preventDefault();
	const code = event.clipboardData.getData("text");
	fillCodeInputs(code);
}
