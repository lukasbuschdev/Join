import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { $ } from "../../js/utilities.js";
bindInlineFunctions(getContext(), [
	"/Join/index/index/index.js",
	"/Join/js/language.js",
	"/Join/js/utilities.js"
]);

/**
 * Initializes the help section by loading the appropriate language-specific help template.
 * @returns {void}
 */
export function initHelp() {
	$("nav button.active")?.classList.remove("active");
	($("#content") ?? $("body")).includeTemplate({
		url: `/Join/assets/languages/help-${LANG.currentLang}.html`,
		replace: false
	});
}