const init = () => {
    $('nav button.active').click();
    renderUserData();
}

const loadContent = async () => {
    const id = event.currentTarget.id
    const url = `../assets/templates/index/${id}_template.html`;
    await $('#content').includeTemplate(url);
    if (id == "summary") {
        initSummary();
    } else if (id == "boards") {
        initBoards();
    } else if (id == "contacts") {
        initContacts();
    }
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