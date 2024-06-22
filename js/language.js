import { LOCAL_getData, LOCAL_setData } from "./storage.js";
import { $$, currentDirectory } from "./utilities.js";
import './prototype_extensions.js'

export function currentLang() {
    return LOCAL_getData('lang') ?? navigator.language.slice(0, 2) ?? "en-US";
}
export async function LANG_load(lang = currentLang()) {
    const allLangData = (await Promise.all([
        (await fetch(`/Join/assets/languages/init/${lang}.json`)).json(),
        (await fetch(`/Join/assets/languages/index/${lang}.json`)).json(),
    ])).reduce((all, dt) => ({...all, ...dt}), {})
    window.window.LANG = allLangData

    const notificationCount = document.title.match(/(\(\d+\) )?/)[0];
    if (this === window) {
        document.title = `${notificationCount}${window.LANG[`title-${currentDirectory().replace('_', '-')}`]}`;
    };
    const context = this ?? document.documentElement;
    context.$$('[data-lang]').for(element => {
        const dataLang = element.dataset.lang
        if (dataLang.includes(', {')) {
            const langString = dataLang.split(', {')[0];
            const langOptions = parse(dataLang.slice(dataLang.indexOf(', ') + 2));
            element.innerHTML = `<span>${window.LANG[langString].replaceAll(/%\w*%/g, variable => `<b>${langOptions[variable.split('%')[1]]}</b>`)}</span>`
        } else {
            element.innerText = window.LANG[element.dataset.lang];
        }
    });
    $$('[data-lang-placeholder]').for(input => input.placeholder = window.LANG[input.dataset.langPlaceholder]);
    $$('[data-lang-empty]').for(element => element.dataset.type = window.LANG[element.dataset.langEmpty]);
    
    const langLoadedEvent = new CustomEvent('langLoaded');
    window.dispatchEvent(langLoadedEvent);
}

export const LANG_set = (lang) => {
    if (!(lang == 'de' || lang == 'en' || lang == 'es' || lang == 'fr' || lang == 'it' || lang == 'tk' || lang == 'pg')) {
        return error(`${lang} doesn't exist`);
    }

    LOCAL_setData('lang', lang);
}

export const LANG_get = () => LOCAL_getData('lang');

export const LANG_change = (lang) => {
    LANG_set(lang);
    LANG_load();
}

export const getEmailLanguage = async (type) => {
    if (!type) return;
    type = type.convert();
    const data = await (await fetch(`/Join/assets/languages/mail/${currentLang()}.json`)).json();
    return Object.entries(data).reduce((total, [key, value]) => {
        if (key.includes(type)) return { ...total, [key.replace(`${type}-`, '')]: value }
        else return total;
    }, {});
}