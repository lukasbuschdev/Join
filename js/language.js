import { LOCAL_getData, LOCAL_setData } from "./storage.js";
import { $$, currentDirectory, parse } from "./utilities.js";
import './prototype_extensions.js'

class Language {
    assetDir = "/Join/assets/languages";
    allLanguageStringsAbbreviated = [ "en", "de", "fr", "es", "it", "tk", "pg" ];
    
    #data;
    #currentLang

    #get(lang) {
        if(!this.#data) throw Error(`Lang not initialized! await LANG.init() to fix.`);
        return this.#data[lang];
    }

    async init() {
        this.#data = await this.#getAllData();
    }

    get currentLang() {
        return this.#currentLang ?? LOCAL_getData('lang') ?? navigator.language.slice(0, 2) ?? "en";
    }

    get currentLangData() {
        return this.#get(this.currentLang);
    }
    
    /**
     * @returns {Promise<{ "en": Record<string, string> }>}
     */
    async #getAllData() {
        return (await Promise.all(this.allLanguageStringsAbbreviated.map(async (lang) => {
                const data = (await Promise.all(["init", "index"].map(async (dir) => {
                    return (await fetch(`${this.assetDir}/${dir}/${lang}.json`)).json();
                }))).reduce((combinedData, langData) => ({ ...combinedData, ...langData }), {});
                return [lang, data];
            })
        )).reduce((allData, [key, value]) => ({ ...allData, [key]: value }), {});
    }

    render(element = document) {
        element.querySelectorAll('[data-lang], [data-lang-placeholder], [data-lang-empty]').forEach(this.#renderSingleElement);
        if(element !== document) return;
        this.#renderDocumentTitle();
        window.dispatchEvent(new CustomEvent('langLoaded'));
    }

    #renderDocumentTitle() {
        const titleText = this.currentLangData[`title-${currentDirectory().replaceAll('_', '-')}`];      
        document.title = titleText;
    }

    #renderSingleElement = (element) => {
        const { lang, langPlaceholder, langEmpty } = element.dataset;
        const langKey = (lang ?? langPlaceholder ?? langEmpty); 
        if(lang && lang.includes(', {')) return this.#renderWithOptions(element, lang);
        const langText = this.currentLangData[langKey];
        if(langEmpty) return element.dataset.type = this.currentLangData[langKey];
        if(langPlaceholder) return element.placeholder = langText;
        element.innerText = langText;
    }

    #renderWithOptions(element, lang) {
    
        const langString = lang.split(', {')[0];
        const langOptions = parse(lang.slice(lang.indexOf(', ') + 2));
        element.innerHTML = `<span>${this.currentLangData[langString].replaceAll(/%\w*%/g, variable => `<b>${langOptions[variable.split('%')[1]]}</b>`)}</span>`
    }

    /**
     * changes the current language and rerenders every element on the page
     * @param {"en" | "de" | "fr" | "it" | "es" | "tk" | "pg"} targetLanguage
     */
    change(targetLanguage) {
        switch(targetLanguage) {
            case "en": case "de": case "fr": case "it": case "es": case "tk": case "pg":
                this.#currentLang = targetLanguage;
                this.render();
                break;
            default: return;
        }
        LOCAL_setData('lang', targetLanguage);
        // console.log(`language changed to ${targetLanguage}`)
    }
}

export const LANG = new Language();

export const getEmailLanguage = async (type) => {
    if (!type) return;
    type = type.convert();
    const data = await (await fetch(`/Join/assets/languages/mail/${LANG.currentLang}.json`)).json();
    return Object.entries(data).reduce((total, [key, value]) => {
        if (key.includes(type)) return { ...total, [key.replace(`${type}-`, '')]: value }
        else return total;
    }, {});
}