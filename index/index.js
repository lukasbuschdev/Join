const init = () => {
    checkLogin();
    $(`#${currentDirectory().replace('_','-')}`).click();
    renderUserData();
}
if (LOCAL_getData('rememberMe') == 'false') {
    window.addEventListener("beforeunload", () => LOCAL_setData('loggedIn', false))
}

const checkLogin = () => {
    // log(LOCAL_getData('loggedIn'), true, 'true')
    if (LOCAL_getData('loggedIn') == 'false') {
        goTo('login', {search: '', reroute: true});
    }
}


window.addEventListener("popstate", (e) => {
    $(`#${currentDirectory().replace('_','-')}`)?.click();
})

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
}

const initTextLoadAnimationOvserver = () => {
    $$('#summary-data button').for(
        button => textLoadAnimationOvserver.observe(button, { characterData: true, childList: true, subtree: true })
    );
}

const textLoadAnimationOvserver = new MutationObserver(
    mutationList => {
        for (const { type, target } of mutationList) {
            if (type == "childList" || type == "characterData") target.triggerAnimation('loading');
        }
    }
);