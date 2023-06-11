$$('[type = menu]').for(menu => {
    menu.querySelectorAll('button').for(
        button => button.addEventListener('click', () => menu.querySelectorAll('button').for(
            button => button.classList.toggle('active', button == event.currentTarget)
        ))
    )
});

$$('div[include-template]').for(container => {
    container.includeTemplate();
});

LANG_load();