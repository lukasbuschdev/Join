const initHelp = () => {
    $('nav button.active')?.classList.remove('active');
    $('#content').includeTemplate({url: `/Join/assets/languages/help-${currentLang()}.html`, replace: false})
}