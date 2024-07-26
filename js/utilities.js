import { confirmationTemplate } from "../assets/templates/index/confirmation_template.js";
import { LANG } from "./language.js";
import { STORAGE } from "./storage.js";

export const log = console.log;
export const error = console.error;

/**
 * shortcut of document.querySelector
 * @param {string} selectors
 * @returns {HTMLElement | null}
 */
export function $(selectors) {
	return document.querySelector(selectors);
}

/**
 * shortcut of document.querySelectorAll()
 * @param {string} selector
 * @returns {Element[]}
 */
export function $$(selector) {
	return [...document.querySelectorAll(selector)];
}

/**
 * returns the current directory name
 * @param {string} path
 * @returns {'login' | 'signup' | 'forgot_password' | 'reset_password' | 'create_account' | 'verification' | 'summary' | 'board' | 'add_task' | 'contacts' | 'help' | 'privacy' | 'legal_notice' | 'privacy'}
 */
export function currentDirectory(path = window.location.pathname) {
	return path.split("/").at(-1).split(".")[0].replace("-", "_");
}

/**
 * callback to toggle the 'active' class on a set of buttons. Only use as EventListener!!!
 * @param {NodeListOf<HTMLButtonElement> | HTMLButtonElement[]} buttons
 * @returns {Promise<void>}
 */
export async function toggleActiveBtn(buttons) {
	buttons.forEach((button) => button.classList.toggle("active", button === event.currentTarget));
}

/**
 * adds the toggleActiveBtn() callback to all nav buttons
 * @returns {void}
 */
export function addNavToggleBtns() {
	$$("nav button").forEach((btn, i, buttons) => btn.addEventListener("click", toggleActiveBtn.bind(btn, buttons)));
}

/**
 * toggles the 'active' class on the provided error containers
 * @param {...{identifier: string, bool: boolean}} errors
 * @returns {void}
 */
export function throwErrors(...errors) {
	errors.for(({ identifier, bool }) => {
		const errorContainer = $(`#${identifier}`);
		if (!errorContainer) console.log(identifier);
		const inputContainer = errorContainer.closest(".inp-wrapper")?.$(".inp-container");
		errorContainer.classList.toggle("active", bool);
		inputContainer?.classList.toggle("active", bool);
	});
}

/**
 * adds a notification popup to the screen which fades out
 * @param {string} languageKey
 * @returns {Promise<void>}
 */
export const notification = (languageKey) => {
	return new Promise((resolve) => {
		const el = document.createElement("dialog");
		el.type = "modal";
		el.classList.value = "dlg-notification";
		$("body").append(el);
		el.innerHTML = popUpNotificationTemplate(languageKey);
		el.LANG_load();
		el.openModal();
		el.addEventListener("close", () => {
			el.remove();
			resolve();
		});
	});
};

/**
 * template for popup
 * @param {string} languageKey - Key of LANG
 * @returns {string}
 */
export function popUpNotificationTemplate(languageKey) {
	return /*html*/ `
  <div class="notification grid-center">
      <span data-lang="${languageKey}"></span>
  </div>`;
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
 * renders into elements with the 'include-template' attribute
 * @returns {Promise<void[]>}
 */
export function includeTemplates() {
	return new Promise(async (resolve) => {
		const data = await Promise.all(
			$$("[include-template]")?.map((templateContainer) =>
				templateContainer.includeTemplate()
			)
		);
		window.dispatchEvent(new CustomEvent("templatesIncluded"));
		resolve(data);
	});
}

/**
 * returns the content of a template as text
 * @param {string} url - Path of the template
 * @returns {Promise<string>}
 */
export async function getTemplate(url) {
	return (await fetch(url)).text();
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
 * @returns {Promise<void>}
 */
export const submitUpload = async () => {
	const img = $('[type="file"]').files[0];
	if (!img) return;
	if (isInvalidImg(img)) return;

	const reader = new FileReader();
	reader.onload = (e) => {
		const arrayBuffer = e.target.result;
		STORAGE.webSocket.socket.emit("uploadImg", arrayBuffer);
	};
	reader.readAsArrayBuffer(img);
	$(".loading").classList.add("active");
	const imgURL = await getImgUrl();
	renderUserData();
	renderUploadedImg(imgURL);
};

/**
 * checks if file size is bigger than 1MB and throws errors accordingly
 * @param {File} file
 * @returns {boolean}
 */
export function isInvalidImg(file) {
	const maxSize = 1024 * 1024;
	const fileTooLarge = file.size > maxSize;
	throwErrors({ identifier: "img-too-large", bool: fileTooLarge });
	return fileTooLarge;
}

/**
 * creates a promise which resolves to the url of the user image when the websocket emits the 'imgURL' event
 * @returns {Promise<string>}
 */
export function getImgUrl() {
	return new Promise((resolve) => {
		STORAGE.webSocket.socket.on("imgURL", async (imgURL) => {
			const user = STORAGE.currentUser;
			user.img = imgURL;
			await user.update();
			resolve(imgURL);
		});
	});
}

/**
 * TO DO
 * @param {string} imgURL
 * @returns {void}
 */
export function renderUploadedImg(imgURL) {
	const imgContainers = $$(".user-img");
	imgContainers.forEach((container) => (container.src = imgURL));
	imgContainers[0].onload = () => {
		$(".account .loading").classList.remove("active");
		$('[type="file"]').value = "";
		$(".account.user-img-container").dataset.img = "true";
	};
}

/**
 * Removes the uploaded image
 * @returns {Promise<void>}
 */
export const removeUpload = async () => {
	if (event.target.tagName == "LABEL" || event.target.tagName == "INPUT") return;
	const container = event.currentTarget;
	if (!$("#color-wheel").classList.contains("d-none")) return;
	const img = container.$("img");
	if (container.dataset.img === "false") return;

	$('[type="file"]').value = "";
	container.dataset.img = "false";
	img.src = "";
	STORAGE.webSocket.socket.emit("deleteImg");
	const user = STORAGE.currentUser;
	if (user) {
		user.img = "";
		await user.update();
		renderUserData();
	}
};

/**
 * Renders the color wheel for color picking
 * @returns {void}
 */
export function renderColorWheel() {
	let clrBg = [];
	const factor = 12;
	for (let i = 0; i < 361; i += 360 / factor) {
		clrBg.push(`hsl(${i}, 100%, 50%)`);
	}
	$(
		"#color-wheel"
	).style.backgroundImage = `radial-gradient(white, transparent, black), conic-gradient(${clrBg.join(
		", "
	)})`;
}

/**
 * Toggles the visibility of the color picker
 * @returns {void}
 */
export function toggleColorPicker() {
	event.stopPropagation();
	$("#color-wheel").classList.toggle("d-none");
	$("label").classList.toggle("d-none");
	if (
		event.currentTarget.classList.contains("active") &&
		$(".user-img-container").style.getPropertyValue("--user-clr") == false
	) {
		$("#color-cursor").classList.add("d-none");
		$("#accept-user-color").classList.remove("active");
	}
	$("#user-color").classList.toggle("active");
}

/**
 * Handles color picking from the```javascript
 * Handles color picking from the color wheel
 * @returns {void}
 */
export function pickColor() {
	const width = event.currentTarget.offsetWidth;
	const height = event.currentTarget.offsetHeight;
	const { offsetX, offsetY } = event;
	const x = offsetX - width / 2;
	const y = offsetY - height / 2;

	const hue = Math.round(Math.atan2(y, x) * (180 / Math.PI) + 450) % 360;
	const lightness =
		30 - Math.round(getFraction(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) * 60, width / 2));
	const userColor = `hsl(${hue}, 100%, ${50 + lightness}%)`;

	moveColorCursor(offsetX, offsetY, userColor);
	addAcceptColor(userColor);
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
 * Moves the color cursor to the specified position and sets its background color.
 * @param {number} offsetX - The X offset.
 * @param {number} offsetY - The Y offset.
 * @param {string} userColor - The selected color.
 * @returns {void}
 */
export function moveColorCursor(offsetX, offsetY, userColor) {
	const colorCursor = $("#color-cursor");
	colorCursor.classList.remove("d-none");
	colorCursor.style.setProperty("--x", offsetX);
	colorCursor.style.setProperty("--y", offsetY);
	colorCursor.style.backgroundColor = userColor;
}

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
function colorPicker(event, userColor) {
	event.stopPropagation();
	$$(".user-img-container.account").for((button) =>
		button.style.setProperty("--user-clr", userColor)
	);
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
	const b = color.includes("rgba")
		? Number(color.match(/(?<=,\s{0,1})\d+(?=,)/g)[1])
		: Number(color.match(/(?<=,\s{0,1})\d+(?=\))/g)[0]);
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

export const menuOptionInitator = new MutationObserver(([{ target }]) =>
	target.parentElement.closest('[type = "menu"]').initMenus()
);

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
	this.$$('[type = "menu"]').for((menu) =>
		menuOptionInitator.observe(menu, mutationObserverOptions)
	);
};

let inactivityTimer;

/**
 * Adds an inactivity timer that logs the user out after a specified time
 * @param {number} [minutes=5] - The inactivity time in minutes
 * @returns {void}
 */
export function addInactivityTimer(minutes = 5) {
	return (inactivityTimer = setTimeout(
		() => goTo("init/login/login", { search: "?expired" }),
		minutes * 60 * 1000
	));
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
	const url = `${window.location.origin}/Join/${directory}.html${
		options?.search ?? location.search
	}`;
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
	if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null)
		return false;
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
	let [h, s, l] = hslString.match(/\d+/g).map((digit) => Number(digit));
	s /= 100;
	l /= 100;

	const k = (n) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

	const r = Math.round(f(0) * 255);
	const g = Math.round(f(8) * 255);
	const b = Math.round(f(4) * 255);

	return '#' + [r, g, b].map((x) => {
		const hex = x.toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	}).join('');
}
