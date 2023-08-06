let LANG;

const currentLang = () => LOCAL_getData('lang') ?? navigator.language.slice(0, 2) ?? "en-US"

const LANG_load = async (lang = currentLang()) => {
    let langDirectory = 'index';
    const dir = currentDirectory();
    if (dir == 'signup' ||
        dir == 'login' ||
        dir == 'create_account' ||
        dir == 'forgot_password' ||
        dir == 'reset_password') langDirectory = 'init';
    // lang = "de";
    LANG = await (await fetch(`/Join/assets/languages/${langDirectory}/${lang}.json`)).json();
    document.title = document.title.replace(/(?<=\) ).*/g, LANG[`title-${dir}`]);
    $$('[data-lang]').for(element => element.innerText = LANG[element.dataset.lang]);
    $$('[data-lang-placeholder]').for(input => input.placeholder = LANG[input.dataset.langPlaceholder]);
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