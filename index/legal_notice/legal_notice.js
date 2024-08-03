import { bindInlineFunctions, getContext } from "/Join/js/setup.js";
bindInlineFunctions(getContext(), ["/Join/index/index/index.js", "/Join/js/language.js", "/Join/js/utilities.js"]);

import { $ } from "../../js/utilities.js";

/**
 * Initializes the legal notice section by loading the legal notice template.
 * @returns {void}
 */
export async function initLegalNotice() {
	await ($("#content") ?? $("body")).includeTemplate({
		url: `/Join/assets/templates/init/legal-notice-content.html`,
		replace: false
	});
	$("#content")?.LANG_load();
}
