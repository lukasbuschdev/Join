let ALL_USERS;
let USER;
let BOARDS = {};
let SELECTED_BOARD;
let SELECTED_TASK;
let CONTACTS = {};
let SOCKET;
let notifySound = new Audio('/Join/assets/audio/mixkit-soap-bubble-sound-2925.wav');

async function init(directory) {
    await includeTemplates();
    await getUser();
    checkLogin();
    await getAllUsers();
    initFunctions[directory]();
    initWebsocket(USER.id);
    $(`#${directory}`).classList.add("active");
    renderUserData();
    checkNotifications();
}

if (LOCAL_getData('rememberMe') == 'false') {
    window.on("beforeunload", () => LOCAL_setData('loggedIn', false))
}

const checkNotifications = async () => {
    await getUser();
    const notificationCount = Object.values(USER.notifications).length;
    const notificationCounters = $$('.notifications-counter');

    notificationCounters.for(counter => counter.classList.toggle('d-none', !notificationCount));
    document.title = `${(notificationCount)?`(${notificationCount}) ` :""}${LANG[`title-${currentDirectory().replace('_', '-')}`]}`; 
    if (!notificationCount) return
    notificationCounters.for(counter => counter.innerText = notificationCount);
}

const checkLogin = () => {
    if (USER.loggedIn == 'false') {
        goTo('init/login/login', {search: ''});
    }
}

window.addEventListener("popstate", (e) => {
    $(`#${currentDirectory()}`)?.click();
});

const initFunctions = {
    "summary": () => initSummary(),
    "contacts": () => initContacts(),
    "board": () => initBoard(),
    "add_task": () => initAddTask(),
    "help": () => initHelp(),
    "privacy": () => initPrivacy()
}

async function loadContent () {
    const btn = event.currentTarget ?? undefined;
    if(!btn) location.href = location.href;
    if (currentDirectory() === btn.id) return;
    goTo(`index/${btn.id}/${btn.id}`);
};

const openAccountPanel = async () => {
    $('dialog#account-panel').openModal();
    $('#account-panel-options button.active')?.click();
    $('#account-panel-options #notifications-btn')?.click();
};

const loadAccountPanelContent = async () => {
    const btn = event.currentTarget;
    const template = btn.id.slice(0, -4);
    const url = `/Join/assets/templates/account/${template}.html`;
    const accountPanelContent = $('#account-panel-content');

    await accountPanelContent.includeTemplate({url, replace: false});
    if (template == "notifications") loadNotifications();
    if (template == "edit-account") initEditAccount();
    accountPanelContent.LANG_load();
    accountPanelContent.initMenus();
};

const initEditAccount = () => {
    const editAccountContent = $('#edit-account-content');
    editAccountContent.renderUserData();
    renderColorWheel();
    if (editAccountContent.$('img').src) editAccountContent.$('.user-img-container').dataset.img = "true";
}

const loadNotifications = async () => {
    if (Object.values(USER.notifications).length == 0) return noNotificationsYet();
    const container = $('#notifications-content');
    container.innerHTML = '';
    container.renderItems(Object.values(USER.notifications), notificationTemplate);
};

function noNotificationsYet() {
    const notificaitionsContent = $('#notifications-content');
    notificaitionsContent.style.alignItems = 'center';
    notificaitionsContent.style.justifyContent = 'center';
    notificaitionsContent.innerHTML = /*html*/ `
        <h3 class="no-notifications txt-center" data-lang="no-notifications">You have no notifications!</h3>
    `;
}