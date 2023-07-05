const init = () => {
    $('nav button.active').click();
}

const loadContent = async () => {
    const id = event.currentTarget.id
    const url = `../assets/templates/index/${id}_template.html`;
    await $('#content').includeTemplate(url);
    if (id == "summary") {
        initSummary();
    } else if (id == "boards") {
        initBoards();
    }
    resetMenus();
}