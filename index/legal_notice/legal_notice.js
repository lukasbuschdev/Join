import { bindInlineFunctions, getContext } from "/Join/js/setup.js";
bindInlineFunctions(getContext(), [
  "/Join/index/index/index.js",
  "/Join/js/language.js",
  "/Join/js/utilities.js"
]);

import { $ } from "../../js/utilities.js";

export function initLegalNotice() {
  ($("#content") ?? $("body")).includeTemplate({
    url: `/Join/assets/templates/init/legal-notice-content.html`,
    replace: false
  });
}
