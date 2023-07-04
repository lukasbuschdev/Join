const currentDirectory = window.location.pathname.match(/(?<=\/)\b\w+\b(?=\/)/)[0];
const currentUserId = new URLSearchParams(document.location.search).get('id') ?? "";


$$('div[include-template]').for(container => {
    container.includeTemplate();
    LANG_load();
});

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

if (currentDirectory !== "Init") {
    loadUserData(currentUserId);
}