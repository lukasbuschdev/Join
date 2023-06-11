const LANG_load = async (lang = LOCAL_getItem('lang') ?? navigator.language.slice(0, 2) ?? "en-US") => {

    // const directory = location.pathname.split('/')[2]; // !!! ONLINE !!!
    const directory = location.pathname.split('/')[1]; // !!! LOCAL SERVER !!!

    // lang = "de";
    const languages = await (await fetch(`../assets/languages/${directory}/${lang}.json`)).json();
    document.title = languages[$('[data-title]')?.dataset.title];
    $$('[data-lang]').forEach(element => element.innerText = languages[element.dataset.lang]);
    $$('[data-lang-placeholder]').forEach(input => input.placeholder = languages[input.dataset.langPlaceholder])
}

const LANG_set = (lang) => {
    if (!(lang == 'de' || lang == 'en')) return;
    LOCAL_setItem('lang', lang);
}

const LANG_get = () => LOCAL_getItem('lang');

const LANG_change = (lang) => {
    LANG_set(lang);
    LANG_load();
}