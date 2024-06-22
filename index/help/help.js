import { currentLang } from "../../js/language.js";
import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { $ } from "../../js/utilities.js";
bindInlineFunctions(getContext(), [
    '/Join/index/index/index.js',
    '/Join/js/language.js',
    '/Join/js/utilities.js'
])

export function initHelp() {
    $('nav button.active')?.classList.remove('active');
    ($('#content') ?? $('body')).includeTemplate({url: `/Join/assets/languages/help-${currentLang()}.html`, replace: false})
}