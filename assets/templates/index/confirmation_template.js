import "/Join/js/prototype_extensions.js";

/**
 * gets the template for the confirmation box depending on the type
 * @param {string}
 * @returns {string}
 */

export function confirmationTemplate(type) {
	return /*html*/ `
  <div class="confirmation-dialog column gap-25">
    <span data-lang="confirmation-${type}"></span>
    <div class="btn-container gap-15">
      <div class="btn btn-secondary txt-small txt-700" data-lang="btn-cancel" onclick="this.closest('dialog').closeModal()"></div>
      <div class="btn btn-primary txt-small txt-700" data-lang="confirm-${type}"></div>
    </div>
  </div>
`;
}
