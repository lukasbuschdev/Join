import { LOCAL_getData, LOCAL_setData, SESSION_setData, STORAGE } from "../../js/storage.js";
import { $, $$, currentDirectory, renderUserData, searchParams, goTo, confirmation, currentUserId, throttle, isMobile, isStandalone } from "../../js/utilities.js";
import "/Join/js/prototype_extensions.js";
import { initSummary } from "../summary/summary.js";
import { initBoard } from "../board/board.js";
import { initLegalNotice } from "../legal_notice/legal_notice.js";
import { initHelp } from "../help/help.js";
import { initAddTask } from "../add_task/add_task.js";
import { initContacts } from "../contacts/contacts.js";
import { initPrivacy } from "../privacy/privacy.js";
import { notificationTemplate } from "../../assets/templates/index/notification_template.js";
import { Board } from "../../js/board.class.js";

/**
 * Initializes the application for the specified directory.
 * @param {string} directory - The directory to initialize.
 * @returns {Promise<void>}
 */
export async function init(directory) {
	await STORAGE.init();
	await LANG.init();

	await initFunctions[directory]();
	$("#content").classList.remove("content-loading");
	$(`#${directory}`).classList.add("active");
	renderUserData();
	checkNotifications();
}

/**
 * Sets a handler to clear the logged-in status before the window unloads if "rememberMe" is false.
 */
if (LOCAL_getData("rememberMe") === "false") {
	window.on("beforeunload", () => LOCAL_setData("loggedIn", false));
}

/**
 * Checks and updates the notification counters and the document title based on the number of notifications.
 */
export function checkNotifications() {
	const notificationCount = Object.values(STORAGE.currentUser.notifications).length;
	const notificationCounters = $$(".notifications-counter");

	notificationCounters.forEach((counter) => {
		counter.innerText = notificationCount;
		counter.classList.toggle("d-none", !notificationCount);
	});

	if (notificationCount) document.title = `(${notificationCount}) ${document.title}`;
}

/**
 * Checks the login status of the user based on the URL parameter "uid".
 * If the user is not valid, redirects to the login page.
 */
export const checkLogin = () => {
	const uid = searchParams().get("uid");
	if (!uid) return;
	const isValidUser = !!STORAGE.getUsersById([uid]);
	if (!isValidUser) goTo("init/login/login", { search: "" });
};

/**
 * An object containing initialization functions for different directories.
 */
export const initFunctions = {
	summary: () => initSummary(),
	contacts: () => initContacts(),
	board: () => initBoard(),
	add_task: () => initAddTask(),
	help: () => initHelp(),
	legal_notice: () => initLegalNotice(),
	privacy: () => initPrivacy()
};

/**
 * Loads content for the current directory based on the event target's id.
 */
export function loadContent() {
	const btn = event.currentTarget ?? undefined;
	if (!btn) location.href = location.href;
	if (currentDirectory() === btn.id) return;
	goTo(`index/${btn.id}/${btn.id}`);
}

/**
 * Opens the account panel and initializes its options.
 */
export function openAccountPanel() {
	$("dialog#account-panel").openModal();
	$("#account-panel-options button.active")?.click();
	$("#account-panel-options #notifications-btn")?.click();
}

/**
 * Loads content for the account panel based on the event target's id.
 * @returns {Promise<void>}
 */
export async function loadAccountPanelContent() {
	const btn = event.currentTarget;
	const template = btn.id.slice(0, -4);
	const url = `/Join/assets/templates/account/${template}.html`;
	const accountPanelContent = $("#account-panel-content");

	await accountPanelContent.includeTemplate({ url, replace: false });
	if (template == "notifications") loadNotifications();
	if (template == "edit-account") initEditAccount();
	accountPanelContent.LANG_load();
	accountPanelContent.initMenus();
}

/**
 * Initializes the edit account section with the current user's data.
 */
export function initEditAccount() {
	const editAccountContent = $("#edit-account-content");
	editAccountContent.renderUserData(STORAGE.currentUser);
	renderColorWheel();
	if (STORAGE.currentUser.img) editAccountContent.$(".user-img-container").dataset.img = "true";
}

/**
 * Loads and displays the current user's notifications.
 */
export function loadNotifications() {
	const notifications = Object.values(STORAGE.currentUser.notifications);
	if (notifications.length === 0) return noNotificationsYet();
	const container = $("#notifications-content");
	container.innerHTML = "";
	notifications.forEach((notification) => (container.innerHTML += notificationTemplate(notification)));
}

/**
 * Displays a message indicating that there are no notifications.
 */
export function noNotificationsYet() {
	const notificaitionsContent = $("#notifications-content");
	notificaitionsContent.style.alignItems = "center";
	notificaitionsContent.style.justifyContent = "center";
	notificaitionsContent.innerHTML = /*html*/ `
    <h3 class="no-notifications txt-center" data-lang="no-notifications">You have no notifications!</h3>
`;
}

/**
 * Deletes the current user's account with multiple confirmations.
 */
export function deleteAccount() {
	confirmation("delete-account1", () => {
		confirmation("delete-account2", () => {
			confirmation("delete-account3", () => {
				if (STORAGE.currentUser.name !== "Guest") STORAGE.currentUser.deleteAccount();
				else
					confirmation("delete-account4", () => {
						const modal = $("dialog:has( .confirmation-dialog)");
						if (modal) modal.close();
					});
			});
		});
	});
}

/**
 * Toggles the active state of the board title selection element.
 */
export function toggleBoardTitleSelection() {
	const el = event.currentTarget;
	el.classList.toggle("active");
	if (el.classList.contains("active")) {
		let closeHandler;
		window.addEventListener(
			"pointerdown",
			(closeHandler = () => {
				if (event.target.closest("#board-title-selection")) return;
				el.classList.remove("active");
				window.removeEventListener("pointerdown", closeHandler);
			})
		);
	}
}

/**
 * Generates the HTML template for a board title selection option.
 * @param {Board} params - The Board to render.
 * @returns {string} - The HTML template for the board title selection option.
 */
export function boardTitleSelectionTemplate({ id, name }) {
	return /*html*/ `<h4 class="option" onclick="switchBoards(${id})">${name}</h4>`;
}

/**
 * Switches the active board and reloads the page.
 * @param {string} id - The id of the board to switch to.
 */
export function switchBoards(id) {
	SESSION_setData("activeBoard", id);
	location.reload();
}

/**
 * Logs out the current user with confirmation.
 * @returns {Promise<void>}
 */
export function initLogout() {
	return confirmation("logout", () => STORAGE.currentUser.logOut());
}

/**
 * Changes the application's language to the target language.
 * @param {string} targetLanguage - The target language to change to.
 */
export function changeLanguage(targetLanguage) {
	LANG.change(targetLanguage);
}

/**
 * Resets the user's password with confirmation.
 */
export function resetPassword() {
	confirmation("reset-password", () =>
		goTo("init/reset_password/reset_password", {
			reroute: true,
			search: "?uid=" + currentUserId()
		})
	);
}

/**
 * Workaround for Webapp. Fixes Window height.
 */
try {
	const e = new TouchEvent();
	document.addEventListener("DOMContentLoaded", () => {
		const setBodyHeight = throttle(function () {
			document.body.style.height = window.innerHeight + "px";
		});
		setBodyHeight();
		window.addEventListener("resize", setBodyHeight);
	});
} catch (e) {}
