const currentDirectory = () => location.pathname.split('/').at(-1).split('.')[0];
const currentUserId = () => (searchParams().get('uid') == null) ? undefined : `${searchParams().get('uid')}`;


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

const redirect = async () => {
    const userData = await getCurrentUserData();
    if (!userData && searchParams().has('redirected') == false) {
        // goTo('../init/init.html?redirected');
    }
}

let inactivityTimer;
const addInactivityTimer = (minutes = 5) => {
    inactivityTimer = setTimeout(()=>{
        goTo('../init/init.html?expired');
    }, minutes * 60 * 1000)
}

const initInactivity = () => {
    window.addEventListener("visibilitychange", () => {
        if (document.hidden) addInactivityTimer();
        else clearTimeout(inactivityTimer);
    });
}

// redirect();
initMenus();
REMOTE_clearVerifications();
if (currentDirectory() == "index") {
    const uid = currentUserId();
    loadUserData(uid);
    // initInactivity();
}
