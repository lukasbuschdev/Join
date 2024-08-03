import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { $ } from "../../js/utilities.js";
bindInlineFunctions(getContext(), ["/Join/index/index/index.js", "/Join/js/language.js", "/Join/js/utilities.js"]);

/**
 * Initializes the privacy section by loading the appropriate language-specific privacy template.
 * @returns {void}
 */
export function initPrivacy() {
	($("#content") ?? $("body")).includeTemplate({
		url: `/Join/assets/languages/privacy-${LANG.currentLang}.html`,
		replace: false
	});
}
