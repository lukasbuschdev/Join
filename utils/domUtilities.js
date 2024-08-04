import { confirmationTemplate } from "../assets/templates/index/confirmation_template.js";
import { LANG } from "../js/language.js";
import { STORAGE } from "../js/storage.js";

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
 * Resets the menus
 * @returns {void}
 */
export const resetMenus = function () {
	menuOptionInitator.disconnect();
	this.$$('[type = "menu"]').for((menu) => menuOptionInitator.observe(menu, mutationObserverOptions));
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
