let ALL_USERS;
let USER;
let BOARDS = {};
let SELECTED_BOARD;
let SELECTED_TASK;
let CONTACTS = {};
let SOCKET;
let notifySound = new Audio('/Join/assets/audio/mixkit-soap-bubble-sound-2925.wav');

const init = async () => {
    await getUser();
    checkLogin();
    await getAllUsers();
    initWebsocket();
    $(`#${currentDirectory().replace('_','-')}`)?.click();
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
    document.title = `${(notificationCount)?`(${notificationCount}) ` :""}${LANG[`title-${currentDirectory()}`]}`; 
    if (!notificationCount) return
    notificationCounters.for(counter => counter.innerText = notificationCount);
}

const checkLogin = () => {
    if (USER.loggedIn == 'false') {
        goTo('login', {search: '', reroute: true});
    }
}

window.addEventListener("popstate", (e) => {
    $(`#${currentDirectory()}`)?.click();
});

const initFunctions = {
    "summary": () => initSummary(),
    "contacts": () => initContacts(),
    "board": () => initBoard(),
    "add-task": () => initAddTask(),
    "help": () => initHelp()
}

const loadContent = async () => {
    const id = event ? event.currentTarget.id : currentDirectory();
    if (event && event.currentTarget.classList.contains('active')) return error('already active!');
    const url = (id === 'help') ? `/Join/assets/languages/help-${currentLang()}.html` : (id == 'privacy')? `/Join/assets/languages/privacy-${currentLang()}.html` : `/Join/assets/templates/index/${id.replace('_','-')}_template.html`;
    const content = $('#content');
    content.classList.add("loading");
    await content.includeTemplate(url);
    content.$(':scope > div').classList.add("o-none");

    if (id in initFunctions) await initFunctions[id]();
    if (currentDirectory() !== id) goTo(id);
    content.LANG_load();
    content.initMenus();
    content.$(':scope > div').classList.remove("o-none");
    setTimeout(()=>{
        content.classList.remove('loading');
    }, 100);
};

const openAccountPanel = async () => {
    $('dialog#account-panel').openModal();
    $('#account-panel-options button.active')?.click();
    $('#account-panel-options #notifications-btn')?.click();
};

const loadAccountPanelContent = async () => {
    const btn = event.currentTarget;
    const template = btn.id.slice(0, -4);
    const templatePath = `/Join/assets/templates/account/${template}.html`;
    const accountPanelContent = $('#account-panel-content');
    await accountPanelContent.includeTemplate(templatePath);
    if (template == "notifications") loadNotifications();
    if (template == "edit-account") initEditAccount();
    accountPanelContent.LANG_load();
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