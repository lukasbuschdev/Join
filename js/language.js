let LANG;

const currentLang = () => LOCAL_getData('lang') ?? navigator.language.slice(0, 2) ?? "en-US";

async function LANG_load (lang = currentLang()){
    let langDirectory = 'index';
    const dir = currentDirectory();
    if (dir == 'signup' ||
        dir == 'login' ||
        dir == 'create-account' ||
        dir == 'forgot-password' ||
        dir == 'reset-password') langDirectory = 'init';
    
    LANG = await (await fetch(`/Join/assets/languages/${langDirectory}/${lang}.json`)).json();
    const notificationCount = document.title.match(/(\(\d+\) )?/)[0];
    document.title = `${notificationCount}${LANG[`title-${dir}`]}`;
    this.$$('[data-lang]').for(element => {
        const dataLang = element.dataset.lang
        if (dataLang.includes(', {')) {
            log(dataLang)
            const langString = dataLang.split(', {')[0];
            const langOptions = parse(dataLang.slice(dataLang.indexOf(', ') + 2));
            log(`<span>${LANG[langString].replaceAll(/%\w*%/g, variable => `<b>${langOptions[variable.split('%')[1]]}</b>`)}</span>`)
            element.innerHTML = `<span>${LANG[langString].replaceAll(/%\w*%/g, variable => `<b>${langOptions[variable.split('%')[1]]}</b>`)}</span>`
        } else {
            element.innerText = LANG[element.dataset.lang];
        }
    });
    $$('[data-lang-placeholder]').for(input => input.placeholder = LANG[input.dataset.langPlaceholder]);
    $$('[data-lang-empty]').for(element => element.dataset.type = LANG[element.dataset.langEmpty]);
    return;
}

const LANG_set = (lang) => {
    if (!(lang == 'de' || lang == 'en' || lang == 'es' || lang == 'fr' || lang == 'it' || lang == 'tk')) {
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