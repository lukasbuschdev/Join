import { LOCAL_getData, LOCAL_setData } from "./storage.js";
import { $$, currentDirectory, parse } from "./utilities.js";
import "./prototype_extensions.js";

/**
 * @typedef {Object.<string, string>} LangData
 */

/**
 * @typedef {"en"|"de"|"fr"|"es"|"it"|"tk"|"pg"} LanguageString
 */

/**
 * Class representing language management.
 */
class Language {
	assetDir = "/Join/assets/languages";
	allLanguageStringsAbbreviated = ["en", "de", "fr", "es", "it", "tk", "pg"];

	#data;
	#currentLang;

	/**
	 * Get the language data for a specific language.
	 * @param {LanguageString} lang - The language abbreviation.
	 * @returns {LangData} The language data.
	 * @throws Will throw an error if the language data is not initialized.
	 */
	#get(lang) {
		if (!this.#data) throw Error(`Lang not initialized! await LANG.init() to fix.`);
		return this.#data[lang];
	}

	/**
	 * Initialize the language data.
	 * @returns {Promise<void>}
	 */
	async init() {
		this.#data = await this.#getAllData();
	}

	/**
	 * Get the current language abbreviation.
	 * @returns {LanguageString} The current language abbreviation.
	 */
	get currentLang() {
		return this.#currentLang ?? LOCAL_getData("lang") ?? navigator.language.slice(0, 2) ?? "en";
	}

	/**
	 * Get the data for the current language.
	 * @returns {LangData} The data for the current language.
	 */
	get currentLangData() {
		return this.#get(this.currentLang);
	}

	/**
	 * Fetch and combine all language data.
	 * @returns {Promise<LangData>} The combined language data.
	 * @private
	 */
	async #getAllData() {
		return (
			await Promise.all(
				this.allLanguageStringsAbbreviated.map(async (lang) => {
					const data = (
						await Promise.all(
							["init", "index"].map(async (dir) => {
								return (await fetch(`${this.assetDir}/${dir}/${lang}.json`)).json();
							})
						)
					).reduce((combinedData, langData) => ({ ...combinedData, ...langData }), {});
					return [lang, data];
				})
			)
		).reduce((allData, [key, value]) => ({ ...allData, [key]: value }), {});
	}

	/**
	 * Render language-specific elements in the given element or document.
	 * @param {HTMLElement} [element=document] - The element to render language-specific content in.
	 */
	render(element = document) {
		element
			.querySelectorAll("[data-lang], [data-lang-placeholder], [data-lang-empty]")
			.forEach(this.#renderSingleElement);
		if (element !== document) return;
		this.#renderDocumentTitle();
		window.dispatchEvent(new CustomEvent("langLoaded"));
	}

	/**
	 * Render the document title based on the current language data.
	 * @private
	 */
	#renderDocumentTitle() {
		const titleText = this.currentLangData[`title-${currentDirectory().replaceAll("_", "-")}`];
		document.title = titleText;
	}

	/**
	 * Render a single element with language-specific content.
	 * @param {HTMLElement} element - The element to render.
	 * @private
	 */
	#renderSingleElement = (element) => {
		const { lang, langPlaceholder, langEmpty } = element.dataset;
		const langKey = lang ?? langPlaceholder ?? langEmpty;
		if (lang && lang.includes(", {")) return this.#renderWithOptions(element, lang);
		const langText = this.currentLangData[langKey];
		if (langEmpty) return (element.dataset.type = this.currentLangData[langKey]);
		if (langPlaceholder) return (element.placeholder = langText);
		element.innerText = langText;
	};

	/**
	 * Render an element with language-specific content and options.
	 * @param {HTMLElement} element - The element to render.
	 * @param {keyof LangData} lang - The language key with options.
	 * @private
	 */
	#renderWithOptions(element, lang) {
		const langString = lang.split(", {")[0];
		const langOptions = parse(lang.slice(lang.indexOf(", ") + 2));
		element.innerHTML = `<span>${this.currentLangData[langString].replaceAll(
			/%\w*%/g,
			(variable) => `<b>${langOptions[variable.split("%")[1]]}</b>`
		)}</span>`;
	}

	/**
	 * Change the current language and render the content.
	 * @param {LanguageString} targetLanguage - The target language to switch to.
	 */
	change(targetLanguage) {
		switch (targetLanguage) {
			case "en":
			case "de":
			case "fr":
			case "it":
			case "es":
			case "tk":
			case "pg":
				this.#currentLang = targetLanguage;
				this.render();
				break;
			default:
				return;
		}
		LOCAL_setData("lang", targetLanguage);
	}
}

export const LANG = new Language();

/**
 * Get the language-specific content for an email type.
 * @param {import("./email.class.js").EmailType} type - The type of email.
 * @returns {Promise<Object>} The language-specific content for the email.
 */
export const getEmailLanguage = async (type) => {
	if (!type) return;
	type = type.convert();
	const data = await (await fetch(`/Join/assets/languages/mail/${LANG.currentLang}.json`)).json();
	return Object.entries(data).reduce((total, [key, value]) => {
		if (key.includes(type)) return { ...total, [key.replace(`${type}-`, "")]: value };
		else return total;
	}, {});
};
