import { STORAGE } from "/Join/js/storage.js";

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
		const data = await Promise.all($$("[include-template]")?.map((templateContainer) => templateContainer.includeTemplate()));
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
	$("#color-wheel").style.backgroundImage = `radial-gradient(white, transparent, black), conic-gradient(${clrBg.join(", ")})`;
}

/**
 * Toggles the visibility of the color picker
 * @returns {void}
 */
export function toggleColorPicker() {
	event.stopPropagation();
	$("#color-wheel").classList.toggle("d-none");
	$("label").classList.toggle("d-none");
	if (event.currentTarget.classList.contains("active") && $(".user-img-container").style.getPropertyValue("--user-clr") == false) {
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
	const lightness = 30 - Math.round(getFraction(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) * 60, width / 2));
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
