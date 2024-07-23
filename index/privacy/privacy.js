import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { $ } from "../../js/utilities.js";
bindInlineFunctions(getContext(), [
	"/Join/index/index/index.js",
	"/Join/js/language.js",
	"/Join/js/utilities.js"
]);

export const initPrivacy = () => {
	($("#content") ?? $("body")).includeTemplate({
		url: `/Join/assets/languages/privacy-${LANG.currentLang}.html`,
		replace: false
	});
};
