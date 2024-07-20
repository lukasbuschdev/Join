import "/Join/js/prototype_extensions.js";

/**
 * gets the template for the confirmation box depending on the type
 * @param {"delete-contact" | "delete-category" | "delete-board", | "delete-task" | "confirmation-delete-account1": "Do you really want to delete your account?",
	"confirm-delete-account1": "I do", 
	"confirmation-delete-account2": "Are you sure?",
	"confirm-delete-account2": "I am",
	"confirmation-delete-account3": "Really?",
	"confirm-delete-account3": "REALLY!",  
	"confirmation-delete-account4": "This account cannot be deleted!",

	"reset-password" | "save-edited-task" | "save-edited-board" | "logout"} type
	"delete-account": "Delete Account",
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
