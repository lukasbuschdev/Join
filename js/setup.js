const currentDirectory = () => location.pathname.split('/').at(-2);
const currentUserId = () => `${new URLSearchParams(document.location.search).get('uid')}` ?? "";


$$('div[include-template]').for(container => {
    container.includeTemplate();
    LANG_load();
});

const menuOptionInitator = new MutationObserver(
    mutation => {
        initMenus();
    }
)

const observerOptions = {
    childList: true,
};

const resetMenus = () => {
    menuOptionInitator.disconnect();
    $$('[type = "menu"]').for(menu => {
            menuOptionInitator.observe(menu, observerOptions)
        }
    )
}

const initMenus = () => {
    $$('[type = "menu"]').for(menu => {
        menu.$$('[type = "option"]').for(
            button => button.addEventListener('click', () => menu.$$('[type = "option"]').for(
                button => button.classList.toggle('active', button == event.currentTarget)
            ))
        )
    });
}

let inactivityTimer;
const addInactivityTimer = (minutes = 1/12) => {
    inactivityTimer = setTimeout(()=>goTo('../init/init.html?expired'), minutes * 60 * 1000)
}

initMenus();
if (currentDirectory() !== "init") {
    const uid = currentUserId();
    loadUserData(uid);
    // window.addEventListener("visibilitychange", () => {
    //     if (document.hidden) addInactivityTimer();
    //     else clearTimeout(inactivityTimer);
    // });
}
