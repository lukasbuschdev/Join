import { STORAGE } from "../../../js/storage.js";
import { $, getInitialsOfName } from "../../../js/utilities.js";

export function categoryTemplate([name, color]) {
  return /*html*/ `
        <div class="drp-option row" id="category" data-color="${color}" onclick="this.toggleActive(), renderSelectedCategory('${name}')">
            <span>${name}</span>
            <div class="category-color" style="--clr: ${color}"></div>
        </div>
    `;
}

/**
 * Renders the current user as an option to assign themselves to a task.
 * @returns {string} - The HTML string representing the current user option.
 */
export function renderSelfToAssign() {
  return /*html*/ `
        <div class="drp-option" data-id="${
          STORAGE.currentUser.id
        }" onclick="selectCollaborator()">
            <div class="user-img-container grid-center" style="--user-clr: ${
              STORAGE.currentUser.color
            }">
                <span>${STORAGE.currentUser.name
                  .slice(0, 2)
                  .toUpperCase()}</span>
                <img src="${STORAGE.currentUser.img}">
            </div>
            <span data-lang="assigned-you"></span>
        </div>
    `;
}

/**
 * Renders a collaborator as an option to assign them to a task.
 * @param {User} collaborator - The collaborator object containing id, name, color, and img.
 * @returns {string} - The HTML string representing the collaborator option.
 */
export function renderCollaboratorsToAssign(collaborator) {
  return /*html*/ `
        <div class="drp-option" data-id="${
          collaborator.id
        }" onclick="selectCollaborator()">
            <div class="user-img-container grid-center" style="--user-clr: ${
              collaborator.color
            }">
                <span>${getInitialsOfName(collaborator.name)}</span>
                <img src="${collaborator.img}">
            </div>
            <span>${collaborator.name}</span>
        </div>
    `;
}

/**
 * Renders the selected collaborators in the input container.
 * @param {Array<string>} collaboratorIds
 */
export function renderCollaboratorInput(collaboratorIds) {
  const inputContainerCollaborator =
    $("#fullscreen-task-modal[open] #selected-collaborator-input") ??
    $("#selected-collaborator-input");
  inputContainerCollaborator.innerHTML = "";

  collaboratorIds.forEach((collaboratorId) => {
    const users = STORAGE.data.users[collaboratorId];
    inputContainerCollaborator.innerHTML += /*html*/ `
          <div class="input-collaborator user-img-container grid-center" style="--user-clr: ${
            users.color
          }">
            <span>${getInitialsOfName(users.name)}</span>
            <img src="${users.img}">
          </div>
        `;
  });
}

/**
 * Renders a subtask template.
 * @param {string} subtask - The subtask name.
 * @param {number} i - The index of the subtask.
 * @returns {string} - The HTML string representing the subtask template.
 */
export function renderSubtaskTemplate(subtask, i) {
  return /*html*/ `
        <div class="row single-subtask" id="single-subtask${i}">
            <li>${subtask}</li>
            <div class="row gap-10 subtask-edit-delete-btns" id="subtask-edit-delete-btns${i}">
                <button class="grid-center subtask-edit-btn${i}" onclick="editSubtask(${i})">
                    <img src="/Join/assets/img/icons/edit_dark.svg" width="20">
                </button>
                <button class="grid-center d-none save-edited-subtask-btn${i}" onclick="saveEditedSubtask(${i})">
                    <img src="/Join/assets/img/icons/check_dark.svg" width="20">
                </button>
                <div class="vertical-line"></div>
                <button class="grid-center" onclick="deleteSubtask(${i})">
                    <img src="/Join/assets/img/icons/trash.svg" width="20">
                </button>
            </div>
        </div>
    `;
}
