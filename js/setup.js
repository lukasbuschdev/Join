const currentDirectory = () => window.location.pathname.match(/(?<=\/)\b\w+\b(?=\.)/g)[0];
const currentUserId = () => new URLSearchParams(document.location.search).get('uid') ?? "";


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

initMenus();
if (currentDirectory() !== "init") {
    const id = currentUserId();
    loadUserData(id);
}