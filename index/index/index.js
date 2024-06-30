import { LOCAL_getData, LOCAL_setData, SESSION_setData, STORAGE } from "../../js/storage.js";
import { $, $$, currentDirectory, renderUserData, searchParams, goTo, confirmation, popUpNotificationTemplate } from "../../js/utilities.js";
import { SOCKET } from "../../js/websocket.js";
import "/Join/js/prototype_extensions.js";
import { initSummary } from "../summary/summary.js";
import { initBoard } from "../board/board.js";
import { initLegalNotice } from "../legal_notice/legal_notice.js";
import { initHelp } from "../help/help.js";
import { initAddTask } from "../add_task/add_task.js";
import { initContacts } from "../contacts/contacts.js";
import { initPrivacy } from "../privacy/privacy.js";

export let SELECTED_BOARD;

export async function init(directory) {
  await STORAGE.init();
  SOCKET.init();
  await initFunctions[directory]();
  $("#content").classList.remove("content-loading");
  $(`#${directory}`).classList.add("active");
  renderUserData();
  // checkNotifications(); TO DO
  LANG.init();
}

if (LOCAL_getData("rememberMe") == "false") {
  window.on("beforeunload", () => LOCAL_setData("loggedIn", false));
}

export const checkNotifications = () => {
  const notificationCount = Object.values(STORAGE.currentUser.notifications).length;
  const notificationCounters = $$(".notifications-counter");

  notificationCounters.forEach((counter) => counter.classList.toggle("d-none", !notificationCount));
  document.title = `${notificationCount ? `(${notificationCount}) ` : ""}${
    window.LANG[`title-${currentDirectory().replace("_", "-")}`]
  }`;
  if (!notificationCount) return;
  notificationCounters.forEach((counter) => (counter.innerText = notificationCount));
};

export const checkLogin = () => {
  const uid = searchParams().get("uid");
  if (!uid) return;
  const isValidUser = !!STORAGE.getUsersById([uid]);
  if (!isValidUser) goTo("init/login/login", { search: "" });
};

export const initFunctions = {
  summary: () => initSummary(),
  contacts: () => initContacts(),
  board: () => initBoard(),
  add_task: () => initAddTask(),
  help: () => initHelp(),
  legal_notice: () => initLegalNotice(),
  privacy: () => initPrivacy(),
};

export function loadContent() {
  const btn = event.currentTarget ?? undefined;
  if (!btn) location.href = location.href;
  if (currentDirectory() === btn.id) return;
  goTo(`index/${btn.id}/${btn.id}`);
}

export function openAccountPanel() {
$("dialog#account-panel").openModal();
  $("#account-panel-options button.active")?.click();
  $("#account-panel-options #notifications-btn")?.click();
};

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
};

export function initEditAccount() {
  const editAccountContent = $("#edit-account-content");
  editAccountContent.renderUserData(STORAGE.currentUser);
  renderColorWheel();
  if (STORAGE.currentUser.img)
    editAccountContent.$(".user-img-container").dataset.img = "true";
};

export function loadNotifications() {
  if (Object.values(STORAGE.currentUser.notifications).length == 0)
    return noNotificationsYet();
  const container = $("#notifications-content");
  container.innerHTML = "";
  container.renderItems(
    Object.values(STORAGE.currentUser.notifications),
    popUpNotificationTemplate
  );
};

export function noNotificationsYet() {
  const notificaitionsContent = $("#notifications-content");
  notificaitionsContent.style.alignItems = "center";
  notificaitionsContent.style.justifyContent = "center";
  notificaitionsContent.innerHTML = /*html*/ `
    <h3 class="no-notifications txt-center" data-lang="no-notifications">You have no notifications!</h3>
`;
}

export function toggleBoardTitleSelection() {
  const el = event.currentTarget
  el.classList.toggle('active');
  if (el.classList.contains('active')) {
    let closeHandler
    window.addEventListener('pointerdown', closeHandler = () => {
        if (event.target.closest('#board-title-selection')) return;
        el.classList.remove('active');
        window.removeEventListener('pointerdown', closeHandler);
    })
  }
}

export function boardTitleSelectionTemplate({ id, name }) {
  return /*html*/ `<h4 class="option" onclick="switchBoards(${id})">${name}</h4>`;
}

export function switchBoards(id) {
  SESSION_setData("activeBoard", id);
  location.reload();
}

export function initLogout() {
  return confirmation('logout', () => STORAGE.currentUser.logOut())
}

export function changeLanguage(targetLanguage) {
    LANG.change(targetLanguage);
}