let ALL_USERS;
let USER;
let BOARDS = {};
let SELECTED_BOARD;
let SELECTED_TASK;
let CONTACTS = {};
let SOCKET;
let notifySound = new Audio('/Join/assets/audio/mixkit-soap-bubble-sound-2925.wav');

async function init(directory) {
  await Promise.all([
    checkLogin(),
    // includeTemplates(),
    getUser(),
    getAllUsers(),
  ]);
  await initFunctions[directory]();
  $("#content").classList.remove("content-loading");
  initWebsocket(USER.id);
  $(`#${directory}`).classList.add("active");
  renderUserData();
  checkNotifications();
  LANG_load();
}

if (LOCAL_getData("rememberMe") == "false") {
  window.on("beforeunload", () => LOCAL_setData("loggedIn", false));
}

const checkNotifications = async () => {
  await getUser();
  const notificationCount = Object.values(USER.notifications).length;
  const notificationCounters = $$(".notifications-counter");

  notificationCounters.for((counter) => counter.classList.toggle("d-none", !notificationCount));
  document.title = `${notificationCount ? `(${notificationCount}) ` : ""}${
    LANG[`title-${currentDirectory().replace("_", "-")}`]
  }`;
  if (!notificationCount) return;
  notificationCounters.forEach((counter) => (counter.innerText = notificationCount));
};

const checkLogin = async () => {
  const uid = searchParams().get("uid");
  if (!uid) return;
  const isValidUser = !!(await getUsersById([uid]));
  if (!isValidUser) goTo("init/login/login", { search: "" });
};

const initFunctions = {
  summary: () => initSummary(),
  contacts: () => initContacts(),
  board: () => initBoard(),
  add_task: () => initAddTask(),
  help: () => initHelp(),
  legal_notice: () => initLegalNotice(),
  privacy: () => initPrivacy(),
};

async function loadContent() {
  const btn = event.currentTarget ?? undefined;
  if (!btn) location.href = location.href;
  if (currentDirectory() === btn.id) return;
  goTo(`index/${btn.id}/${btn.id}`);
}

const openAccountPanel = async () => {
  $("dialog#account-panel").openModal();
  $("#account-panel-options button.active")?.click();
  $("#account-panel-options #notifications-btn")?.click();
};

const loadAccountPanelContent = async () => {
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

const initEditAccount = () => {
  const editAccountContent = $("#edit-account-content");
  editAccountContent.renderUserData();
  renderColorWheel();
  if (USER.img)
    editAccountContent.$(".user-img-container").dataset.img = "true";
};

const loadNotifications = async () => {
  if (Object.values(USER.notifications).length == 0)
    return noNotificationsYet();
  const container = $("#notifications-content");
  container.innerHTML = "";
  container.renderItems(
    Object.values(USER.notifications),
    notificationTemplate
  );
};

function noNotificationsYet() {
  const notificaitionsContent = $("#notifications-content");
  notificaitionsContent.style.alignItems = "center";
  notificaitionsContent.style.justifyContent = "center";
  notificaitionsContent.innerHTML = /*html*/ `
    <h3 class="no-notifications txt-center" data-lang="no-notifications">You have no notifications!</h3>
`;
}

function toggleBoardTitleSelection() {
const el = event.currentTarget
el.classList.toggle('active');
if (el.classList.contains('active')) {
    window.addEventListener('pointerdown', closeHandler = () => {
        if (event.target.closest('#board-title-selection')) return;
        el.classList.remove('active');
        window.removeEventListener('pointerdown', closeHandler);
    })
}
}

function renderBoardTitleSelection() {
  const activeBoardId = SESSION_getData("activeBoard");
  $("#board-title-selection .options").innerHTML = Object.values(BOARDS).reduce(
    (template, board) => `${template}${ activeBoardId != board.id ? boardTitleSelectionTemplate(board) : "" }`, ``
  );
}

function boardTitleSelectionTemplate({ id, name }) {
  return /*html*/ `<h4 class="option" onclick="switchBoards(${id})">${name}</h4>`;
}

function switchBoards(id) {
  SESSION_setData("activeBoard", Number(id));
  location.reload();
}