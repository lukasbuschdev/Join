import { LANG_load } from "../../js/language.js";
import { getAllUsers, getUser, getUsersById, LOCAL_getData, LOCAL_setData } from "../../js/storage.js";
import { $, $$, currentDirectory, renderUserData, searchParams, goTo } from "../../js/utilities.js";
import { initWebsocket } from "../../js/websocket.js";
import "/Join/js/prototype_extensions.js";
import { initSummary } from "../summary/summary.js";
import { initBoard } from "../board/board.js";

export function initGlobalVariables() {
  window.ALL_USERS = {};
  window.USER = {};
  window.BOARDS = {};
  window.SELECTED_BOARD = {};
  window.SELECTED_TASK = {};
  window.CONTACTS = {};
  // window.SOCKET = {};
  window.notifySound = new Audio('/Join/assets/audio/mixkit-soap-bubble-sound-2925.wav');
}

export async function init(directory) {
  initGlobalVariables();
  await Promise.all([
    checkLogin(),
    // includeTemplates(),
    getUser(),
    getAllUsers(),
  ]);
  await initFunctions[directory]();
  $("#content").classList.remove("content-loading");
  initWebsocket();
  $(`#${directory}`).classList.add("active");
  renderUserData();
  checkNotifications();
  LANG_load();
}

if (LOCAL_getData("rememberMe") == "false") {
  window.on("beforeunload", () => LOCAL_setData("loggedIn", false));
}

export const checkNotifications = async () => {
  await getUser();
  const notificationCount = Object.values(USER.notifications).length;
  const notificationCounters = $$(".notifications-counter");

  notificationCounters.forEach((counter) => counter.classList.toggle("d-none", !notificationCount));
  document.title = `${notificationCount ? `(${notificationCount}) ` : ""}${
    window.LANG[`title-${currentDirectory().replace("_", "-")}`]
  }`;
  if (!notificationCount) return;
  notificationCounters.forEach((counter) => (counter.innerText = notificationCount));
};

export const checkLogin = async () => {
  const uid = searchParams().get("uid");
  if (!uid) return;
  const isValidUser = !!(await getUsersById([uid]));
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

export async function loadContent() {
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
  editAccountContent.renderUserData(USER);
  renderColorWheel();
  if (USER.img)
    editAccountContent.$(".user-img-container").dataset.img = "true";
};

export function loadNotifications() {
  if (Object.values(USER.notifications).length == 0)
    return noNotificationsYet();
  const container = $("#notifications-content");
  container.innerHTML = "";
  container.renderItems(
    Object.values(USER.notifications),
    notificationTemplate
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
  let closeHandler
  if (el.classList.contains('active')) {
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
  SESSION_setData("activeBoard", Number(id));
  location.reload();
}