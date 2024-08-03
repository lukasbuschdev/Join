import { confirmationTemplate } from "../assets/templates/index/confirmation_template.js";
import { LANG } from "../js/language.js";
import { STORAGE } from "../js/storage.js";

/**
 * Adds the selected color to the accept button.
 * @param {string} userColor - The selected color.
 * @returns {void}
 */
export function addAcceptColor(userColor) {
	$("#accept-user-color").classList.add("active");
	$("label").classList.remove("border");

	$("#accept-user-color").onclick = (event) => colorPicker(event, userColor);
}

/**
 * Sets the selected color to the user image container and updates the user data.
 * @param {Event} event - The event object.
 * @param {string} userColor - The selected color.
 * @returns {void}
 */
export function colorPicker(event, userColor) {
	event.stopPropagation();
	$$(".user-img-container.account").for((button) => button.style.setProperty("--user-clr", userColor));
	if (STORAGE.currentUser) {
		STORAGE.currentUser.setColor(userColor);
		renderUserData();
	}
	toggleColorPicker();
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
 * @param {string} type
 * @param {() => any} cb - Callback function
 * @param {HTMLButtonElement} confirmBtn - The button to confirm the action
 * @returns {Promise<void>}
 */
export async function confirmation(type, cb, confirmBtn) {
	const dataLang = type.includes(",") ? type.slice(0, type.indexOf(",")) : type;
	if (!LANG.currentLangData[`confirmation-${dataLang}`]) return error("message unknown!");
	const confirmationContainer = document.createElement("dialog");
	confirmationContainer.type = "modal";
	confirmationContainer.innerHTML = confirmationTemplate(type);
	confirmationContainer.LANG_load();
	confirmationContainer.$(".btn-primary").addEventListener(
		"click",
		() => {
			cb();
			confirmationContainer.closeModal();
			confirmationContainer.remove();
		},
		{ once: true }
	);

	$("body").append(confirmationContainer);
	confirmationContainer.openModal();
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
 * Renders user data into elements with the 'data-user-data' attribute
 * @returns {void}
 */
export function renderUserData() {
	const { name, img, color } = STORAGE.currentUser;
	(this ?? document.documentElement).$$("[data-user-data]").forEach((userField) => {
		const dataType = userField.dataset.userData;
		switch (dataType) {
			case "img":
				return renderImage(userField, img);
			case "name":
				return renderName(userField, name);
			case "initials":
				return renderInitials(userField, name);
			case "color":
				return renderColor(userField, color);
			default:
				return;
		}
	});
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

/**
 * Resets the menus
 * @returns {void}
 */
export const resetMenus = function () {
	menuOptionInitator.disconnect();
	this.$$('[type = "menu"]').for((menu) => menuOptionInitator.observe(menu, mutationObserverOptions));
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
 * Renders the user's name into the specified field
 * @param {HTMLElement} userField - The HTML element to render the name into
 * @param {string} name - The user's name
 * @returns {void}
 */
export const renderName = (userField, name) => {
	userField.innerText = name;
};

/**
 * Renders the user's image into the specified field
 * @param {HTMLElement} userField - The HTML element to render the image into
 * @param {string} img - The URL of the user's image
 * @returns {void}
 */
export const renderImage = (userField, img) => {
	userField.src = img;
};

/**
 * Renders the user's initials into the specified field
 * @param {HTMLElement} userField - The HTML element to render the initials into
 * @param {string} name - The user's name
 * @returns {void}
 */
export const renderInitials = (userField, name) => {
	userField.innerText = getInitialsOfName(name);
};

/**
 * Renders the user's color into the specified field
 * @param {HTMLElement} userField - The HTML element to render the color into
 * @param {string} color - The user's color
 * @returns {void}
 */
export const renderColor = (userField, color) => {
	userField.style.setProperty("--user-clr", color);
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

export function isMobile() {
	return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
