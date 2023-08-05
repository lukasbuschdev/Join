let USER;
let BOARDS = {};
let CONTACTS = {};
let SOCKET;
let notifySound = new Audio('/Join/assets/audio/mixkit-soap-bubble-sound-2925.wav');

const init = async () => {

    checkLogin();
    await getUser();
    await getBoards();
    await getContacts();
    initWebsocket();
    $(`#${currentDirectory().replace('_','-')}`).click();
    renderUserData();
    // checkNotifications();
}
if (LOCAL_getData('rememberMe') == 'false') {
    window.addEventListener("beforeunload", () => LOCAL_setData('loggedIn', false))
}

const initWebsocket = () => {
    SOCKET = io("wss://join-websocket.onrender.com", {
        query: {
            uid: USER.id
        },
        // headers: {
        //     "Acces-Control-Allow-Origin": "https://tarik-uyan.developerakademie.net"
        // },
    });

    SOCKET.on('message', async () => {
        console.log(`Your received a new Notification!`);
        notifySound.play();
        await getUser();
    });
}

const sendMessage = (contactId) => {
    if (!CONTACTS[contactId]) return error(`user '${contactId}' not in contacts!`);
    SOCKET.emit('message', {recipientId: contactId});
}

const checkLogin = () => {
    if (LOCAL_getData('loggedIn') == 'false') {
        goTo('login', {search: '', reroute: true});
    }
}

window.addEventListener("popstate", (e) => {
    $(`#${currentDirectory().replace('_','-')}`)?.click();
});

const loadContent = async () => {
    const {id, classList} = event.currentTarget
    if (classList.contains('active')) return error('already active!')
    const url = `/Join/assets/templates/index/${id.replace('_','-')}_template.html`;
    await $('#content').includeTemplate(url);
    if (id == "summary") {
        initSummary();
    } else if (id == "contacts") {
        initContacts();
    } else if (id == "board") {
        initBoard();
    }
    if (currentDirectory() !== id) goTo(id)
    initTextLoadAnimationOvserver();
    resetMenus();
};

const openAccountPanel = () => {
    $('dialog#account-panel').openModal();
    $('#account-panel-options button.active')?.click();
};

const loadAccountPanelContent = async () => {
    const btn = event.currentTarget;
    const template = btn.id.slice(0, -4);
    const templatePath = `/Join/assets/templates/account/${template}.html`;
    await $('#account-panel-content').includeTemplate(templatePath);
    if (template == "notifications") loadNotifications();
};

const loadNotifications = () => {
    if (Object.values(USER.notifications).length == 0) return error('no notifications');
    const container = $('#notifications-content');
    container.innerHTML = ''
    container.renderItems(Object.values(USER.notifications), notificationTemplate);
}

const initTextLoadAnimationOvserver = () => {
    $$('#summary-data button').for(
        button => textLoadAnimationOvserver.observe(button, { characterData: true, childList: true, subtree: true })
    );
};

const textLoadAnimationOvserver = new MutationObserver(
    mutationList => {
        for (const { type, target } of mutationList) {
            if (type == "childList" || type == "characterData") target.triggerAnimation('loading');
        }
    }
);