window.$ = function (selector) {
  return this.document.querySelector(selector)
};
window.$$ = function (selector) {
  return this.document.querySelectorAll(selector)
};

let LANG;

const currentLang = () => LOCAL_getData('lang') ?? navigator.language.slice(0, 2) ?? "en-US";

async function LANG_load(lang = currentLang()) {
    let langDirectory = 'index';
    const dir = currentDirectory();
    if (dir == 'signup' ||
        dir == 'login' ||
        dir == 'create_account' ||
        dir == 'forgot_password' ||
        dir == 'verify_account' ||
        dir == 'reset_password') langDirectory = 'init';
    
    LANG = await (await fetch(`/Join/assets/languages/${langDirectory}/${lang}.json`)).json();
    const notificationCount = document.title.match(/(\(\d+\) )?/)[0];
    if (this === window) {
        document.title = `${notificationCount}${LANG[`title-${dir.replace('_', '-')}`]}`;
    }
    this.$$('[data-lang]').for(element => {
        const dataLang = element.dataset.lang
        if (dataLang.includes(', {')) {
            const langString = dataLang.split(', {')[0];
            const langOptions = parse(dataLang.slice(dataLang.indexOf(', ') + 2));
            element.innerHTML = `<span>${LANG[langString].replaceAll(/%\w*%/g, variable => `<b>${langOptions[variable.split('%')[1]]}</b>`)}</span>`
        } else {
            element.innerText = LANG[element.dataset.lang];
        }
    });
    $$('[data-lang-placeholder]').for(input => input.placeholder = LANG[input.dataset.langPlaceholder]);
    $$('[data-lang-empty]').for(element => element.dataset.type = LANG[element.dataset.langEmpty]);
    
    const langLoadedEvent = new CustomEvent('langLoaded');
    window.dispatchEvent(langLoadedEvent);
}

const LANG_set = (lang) => {
    if (!(lang == 'de' || lang == 'en' || lang == 'es' || lang == 'fr' || lang == 'it' || lang == 'tk' || lang == 'pg')) {
        return error(`${lang} doesn't exist`);
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