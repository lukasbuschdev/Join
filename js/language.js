const currentLang = () => LOCAL_getData('lang') ?? navigator.language.slice(0, 2) ?? "en-US"

const LANG_load = async (lang = currentLang()) => {
    let langDirectory = 'index';
    if (currentDirectory() == 'signup' ||
        currentDirectory() == 'login' ||
        currentDirectory() == 'create_account' ||
        currentDirectory() == 'forgot_password' ||
        currentDirectory() == 'reset_password') langDirectory = 'init';
    // lang = "de";
    const languages = await (await fetch(`/Join/assets/languages/${langDirectory}/${lang}.json`)).json();
    document.title = languages[`title-${currentDirectory()}`];
    $$('[data-lang]').forEach(element => element.innerText = languages[element.dataset.lang]);
    $$('[data-lang-placeholder]').forEach(input => input.placeholder = languages[input.dataset.langPlaceholder])
}

const LANG_set = (lang) => {
    if (!(lang == 'de' || lang == 'en' || lang == 'es')) {
        return log(error(`${lang} doesn't exist`));
    }

    LOCAL_setData('lang', lang);
}

const LANG_get = () => LOCAL_getData('lang');

const LANG_change = (lang) => {
    LANG_set(lang);
    LANG_load();
}

const getEmailLanguage = async (type) => {
    if (!type) return;
    type = type.convert();
    const data = await (await fetch(`/Join/assets/languages/mail/${currentLang()}.json`)).json();
    return Object.entries(data).reduce((total, [key, value]) => {
        if (key.includes(type)) return { ...total, [key.replace(`${type}-`, '')]: value }
        else return total;
    }, {});
}