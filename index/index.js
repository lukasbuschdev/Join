const init = () => {
    $('nav button.active').click();
}

const loadContent = async () => {
    const url = `../assets/templates/index/${event.currentTarget.id}_template.html`;
    await $('#content').includeTemplate(url);
    initMenus();
}