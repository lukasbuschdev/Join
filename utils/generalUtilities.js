/**
 * returns the current directory name
 * @param {string} path
 * @returns {'login' | 'signup' | 'forgot_password' | 'reset_password' | 'create_account' | 'verification' | 'summary' | 'board' | 'add_task' | 'contacts' | 'help' | 'privacy' | 'legal_notice' | 'privacy'}
 */
export function currentDirectory(path = window.location.pathname) {
	return path.split("/").at(-1).split(".")[0].replace("-", "_");
}

/**
 * returns a debounced function from an input callback function
 * @template T
 * @param {(...params: any[]) => T} cb - Callback function
 * @param {number} [delay=1000] - Idle time in milliseconds before execution (1000 default)
 * @returns {(...params: any[]) => T}
 */
export function debounce(cb, delay = 1000) {
	let timeout;
	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			cb(...args);
		}, delay);
	};
}

/**
 * returns a throttled function from an input callback function
 * @template T
 * @param {(...params: any[]) => T} cb - Callback function
 * @param {number} [delay=1000] - Cooldown time in milliseconds (1000 default)
 * @returns {(...params: any[]) => T}
 */
export function throttle(cb, delay = 1000) {
	let shouldWait = false;
	return (...args) => {
		if (shouldWait) return;
		cb(...args);
		shouldWait = true;
		setTimeout(() => (shouldWait = false), delay);
	};
}

/**
 * custom eval() implementation
 * @param {string} evalString
 * @returns {any}
 */
export function parse(evalString) {
	return Function(`'use strict'; return (${evalString}) ?? false`)();
}

/**
 * returns the current url search params
 * @returns {URLSearchParams}
 */
export function searchParams() {
	return new URLSearchParams(document.location.search);
}

/**
 * Calculates the fraction of the numerator over the denominator within a range.
 * @param {number} numerator - The numerator.
 * @param {number} denominator - The denominator.
 * @param {number} [range=1] - The range.
 * @returns {number} The calculated fraction.
 */
export function getFraction(numerator, denominator, range = 1) {
	return numerator / (denominator / range);
}

/**
 * Converts a color string to RGB format.
 * @param {string} colorString - The color string.
 * @returns {string} The RGB color.
 */
export function getRGBfromString(colorString) {
	if (!(typeof colorString == "string")) return colorString;
	const a = document.createElement("div");
	a.style.color = colorString;
	$("body").append(a);
	const rgb = getComputedStyle(a).color;
	a.remove();
	return rgb;
}

/**
 * Extracts RGBA values from a color string.
 * @param {string} color - The color string.
 * @returns {{r: number, g: number, b: number, a: number}} The RGBA values.
 */
export function getRGBA(color) {
	if (!color.includes("rgb")) {
		const rgb = getRGBfromString(color);
		if (rgb) color = rgb;
	}
	const r = Number(color.match(/(?<=\()\d+(?=,)/g)[0]);
	const g = Number(color.match(/(?<=,\s{0,1})\d+(?=,)/g)[0]);
	const b = color.includes("rgba") ? Number(color.match(/(?<=,\s{0,1})\d+(?=,)/g)[1]) : Number(color.match(/(?<=,\s{0,1})\d+(?=\))/g)[0]);
	const a = color.includes("rgba") ? Number(color.match(/(?<=,\s{0,1})[\d\.]+(?=\))/g)[0]) : 1;
	return { r, g, b, a };
}

/**
 * Calculates a range between two values based on a factor.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @param {number} factor - The factor.
 * @returns {number} The calculated range.
 */
export function getRange(min, max, factor) {
	return min + (factor * max - factor * min);
}

/**
 * tests if the input string is a letter or a number
 * @param {string} input
 * @returns {boolean}
 */
export function isLetterOrNumber(input) {
	return input.length == 1 && /([a-z]|[A-Z]|[0-9])/.test(input);
}

/**
 * if 'input' is a valid date (and the date is in the future), a new date is returned. if invalid, returns undefined
 * @param {string} input
 * @returns {Date | undefined}
 */
export function dateFormat(input) {
	if (typeof input !== "string") return;
	if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return;

	const [day, month, year] = input.split("/");
	const date = new Date(year, month - 1, day);
	if (isInvalidDate(input, date)) return;

	const now = new Date();
	const normalizedDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	if (date < normalizedDate || date.getDate() !== date.getDate()) return;
	return date;
}

/**
 * tests whether the date given as a string is a valid date for a deadline
 * @param {string} input
 * @param {Date} output
 * @returns {boolean}
 */
export function isInvalidDate(input, output) {
	const [, mI, yI] = input.split("/");
	const mO = output.getMonth() + 1;
	const yO = output.getFullYear();
	return !(Number(mI) == mO && Number(yI) == yO);
}

/**
 * gets a hashed input
 * @param {string} inputValue
 * @returns {Promise<string>}
 */
export async function hashInputValue(inputValue) {
	const encoder = new TextEncoder();
	const data = encoder.encode(inputValue);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	return hashHex;
}

/**
 * Gets the current user ID from the URL search params
 * @returns {string | undefined} The current user ID
 */
export function currentUserId() {
	return searchParams().get("uid") == null ? undefined : `${searchParams().get("uid")}`;
}

export const menuOptionInitator = new MutationObserver(([{ target }]) => target.parentElement.closest('[type = "menu"]').initMenus());

export const mutationObserverOptions = {
	childList: true,
	subTree: true
};

let inactivityTimer;

/**
 * Adds an inactivity timer that logs the user out after a specified time
 * @param {number} [minutes=5] - The inactivity time in minutes
 * @returns {void}
 */
export function addInactivityTimer(minutes = 5) {
	return (inactivityTimer = setTimeout(() => goTo("init/login/login", { search: "?expired" }), minutes * 60 * 1000));
}

/**
 * Initializes the inactivity detection
 * @returns {void}
 */
export const initInactivity = () => {
	window.addEventListener("visibilitychange", () => {
		if (document.visibilityState == "hidden") return addInactivityTimer();
		clearTimeout(inactivityTimer);
	});
};

/**
 * Deep clones the input object
 * @param {any} input - The input object to clone
 * @returns {any} The cloned object
 */
export function cloneDeep(input) {
	return JSON.parse(JSON.stringify(input));
}

/**
 * Parses the specified directory and reloads the current page to it
 * @param {string} directory - The directory to navigate to
 * @param {Object} [options] - Options for navigation
 * @returns {void}
 */
export const goTo = (directory, options) => {
	const url = `${window.location.origin}/Join/${directory}.html${options?.search ?? location.search}`;
	window.location.href = url;
};

/**
 * Compares two objects for equality up to a specified depth
 * @param {Object} obj1 - The first object
 * @param {Object} obj2 - The second object
 * @param {number} [depth=Infinity] - The depth of comparison
 * @returns {boolean} True if the objects are equal, false otherwise
 */
export function isEqual(obj1, obj2, depth = Infinity) {
	if (obj1 === obj2) return true;
	if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) return false;
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);
	if (keys1.length !== keys2.length) return false;
	if (depth > 0) {
		for (let key of keys1) {
			if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key], depth - 1)) return false;
		}
	}
	return true;
}

/**
 * Returns the initials of a name capitalized
 * @param {string} name - The name to get initials from
 * @returns {string} The initials of the name
 */
export function getInitialsOfName(name) {
	return name.slice(0, 2).toUpperCase();
}

/**
 * Converts HSL color to HEX color
 * @param {string} hslString - The HSL color string
 * @returns {string | undefined} The HEX color code
 */
export function HSLToHex(hslString) {
	if (!/^hsl\(/.test(hslString)) return;
	const hslRegExp = /\((?<h>\d+), (?<s>\d+)%, (?<l>\d+)%\)/;
	let { h, s, l } = Object.entries(hslString.match(hslRegExp).groups).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
	s /= 100;
	l /= 100;

	const k = (n) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

	const r = Math.round(f(0) * 255);
	const g = Math.round(f(8) * 255);
	const b = Math.round(f(4) * 255);

	return (
		"#" +
		[r, g, b]
			.map((x) => {
				const hex = x.toString(16);
				return hex.length === 1 ? "0" + hex : hex;
			})
			.join("")
	);
}
