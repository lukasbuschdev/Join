let ALL_USERS;
let USER;
let BOARDS = {};
let SELECTED_BOARD;
let SELECTED_TASK;
let CONTACTS = {};
let SOCKET;
let notifySound = new Audio('/Join/assets/audio/mixkit-soap-bubble-sound-2925.wav');

const init = async () => {
    checkLogin();
    await getUser();
    initWebsocket();
    $(`#${currentDirectory().replace('_','-')}`)?.click();
    renderUserData();
    checkNotifications();
}

if (LOCAL_getData('rememberMe') == 'false') {
    window.addEventListener("beforeunload", () => LOCAL_setData('loggedIn', false))
}

const checkNotifications = () => {
    log('checking...')
    const notificationCount = Object.values(USER.notifications).length;
    const notificationCounters = $$('.notifications-counter');

    notificationCounters.for(counter => counter.classList.toggle('d-none', !notificationCount));
    document.title = (notificationCount) ? `(${notificationCount}) ${document.title}` : document.title.split(') ')[1] ?? document.title; 
    if (!notificationCount) return
    notificationCounters.for(counter => counter.innerText = notificationCount);
}

const initWebsocket = () => {
    SOCKET = io("wss://join-websocket.onrender.com", {
        query: {
            uid: USER.id
        }
    });

    SOCKET.io.on('error', e => {
        SOCKET.close();
        // SOCKET = null;
        SOCKET.io.on('connection', e => {
            log('reconnected!')
        })
        setTimeout(initWebsocket, 1 * 60 * 1000);
    });


    SOCKET.on('message', async () => {
        console.log(`Your received a new Notification!`);
        notifySound.play();
        await getUser();
        checkNotifications();
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
    const {id, classList} = event.currentTarget;
    if (classList.contains('active')) return error('already active!');
    const url = `/Join/assets/templates/index/${id.replace('_','-')}_template.html`;
    const content = $('#content');
    await content.includeTemplate(url);
    if (id == "summary") {
        initTextLoadAnimationOvserver();
        await initSummary();
    } else if (id == "contacts") {
        await initContacts();
    } else if (id == "board") {
        await initBoard();
    } else if (id == "add-task") {
        await initAddTask();
    }
    if (currentDirectory() !== id) goTo(id)
    LANG_load();
    content.initMenus();
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
};

const acceptBoardInvite = async (boardId, notificationId) => {
    await REMOTE_setData(`users/${currentUserId()}/boards`, boardId);
    await REMOTE_setData(`boards/${boardId}/collaborators`, USER.id);
    await getBoards();
    await removeNotification(notificationId);
    notification('board-joined');
}

const removeNotification = async (notificationId) => {
    delete USER.notifications[notificationId];
    await USER.update();
    await getUser();
    $(`.notification[data-id="${notificationId}"]`).remove();
    checkNotifications();
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