function loadContent() {
    const url = `../assets/templates/index/${event.currentTarget.id}_template.html`;
    $('#content').includeTemplate(url);
}