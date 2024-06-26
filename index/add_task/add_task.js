import { renderEditSubtasks } from "../../assets/templates/index/edit-task_template.js";
import { bindInlineFunctions, getContext } from "../../js/setup.js";
bindInlineFunctions(getContext(), [
    '/Join/index/index/index.js',
    '/Join/js/utilities.js',
    '/Join/js/language.js',
    '/Join/index/summary/summary.js'
])

import { STORAGE } from "../../js/storage.js";
import { $, cloneDeep, currentDirectory, dateFormat, notification } from "../../js/utilities.js";
import "/Join/js/prototype_extensions.js"

export function initAddTask() {
    if(!Object.values(STORAGE.currentUserBoards).length) return;
    renderBoardIds();
    renderDate();
    $('.add-task-card').LANG_load();
    // $('#add-task-modal #content').classList.remove('loading');
    resetArrays();
    $('.add-task-card').classList.remove('d-none');
}

export const subtasks = [];
export const selectedCollaborators = [];
export const letterRegex = /^[A-Za-zäöüßÄÖÜ\-\/_' "0-9]+$/;

export const newCollabArray = cloneDeep(selectedCollaborators);

export function renderBoardIds() {
    const drpContainer = $('#drp-board-container');
    drpContainer.innerHTML = ''; 

    Object.values(STORAGE.currentUserBoards).forEach(board => {
        drpContainer.innerHTML += /*html*/ `
            <div class="drp-option" onclick="selectBoard(${board.id})">${board.name}</div>
        `;    
    });
}

export function selectBoard(boardId) {
    const selectedBoard = STORAGE.currentUserBoards[boardId];
    SELECTED_BOARD = selectedBoard;
    event.currentTarget.toggleDropDown();

    SELECTED_BOARD = selectedBoard;

    renderSelectedBoard(selectedBoard);
    renderCategories(selectedBoard);
    renderAssignToContacts();
}

export function renderSelectedBoard(selectedBoard) {
    const selectedBoardField = $('#selected-board');
    const selectedBoardName = selectedBoard.name;

    selectedBoardField.innerText = selectedBoardName;
}

export function checkSelectedBoard() {
    const boardInput = $('#selected-board').innerText;
    
    if(boardInput === LANG['select-board']) {
        $('#select-a-board').classList.remove('error-inactive');
        $('#drp-wrapper-board').classList.add('input-warning');
        return
    } else if(boardInput.length >= 3) {
        $('#select-a-board').classList.add('error-inactive');
        $('#drp-wrapper-board').classList.remove('input-warning'); 
    }
}

export function renderCategories(selectedBoard) {
    const drpContainer = $('#drp-categories');
    drpContainer.innerHTML = '';

    Object.entries(selectedBoard.categories).forEach(([name, color]) => {
        drpContainer.innerHTML += /*html*/ `
            <div class="drp-option row" id="category" data-color="${color}" onclick="this.toggleActive(), renderSelectedCategory('${name}')">
                <span>${name}</span>
                <div class="category-color" style="--clr: ${color}"></div>
            </div>
        `;    
    });
}

export function renderAssignToContacts() {
    const drpContainer = $('#drp-collab-container');
    const assignToUser = document.createElement('div');
    assignToUser.innerHTML = renderSelfToAssign();

    drpContainer.innerHTML = '';
    assignToUser.LANG_load();
    drpContainer.append(assignToUser.children[0]);

    SELECTED_BOARD.collaborators.forEach(collaboratorId => {
        const collaborator = STORAGE.currentUserContacts[collaboratorId];
        if(collaborator == STORAGE.currentUser.id) return;
        if(!collaborator) return;

        const collaboratorOption = document.createElement('div');
        collaboratorOption.innerHTML = renderCollaboratorsToAssign(collaborator);

        drpContainer.append(collaboratorOption.children[0]);
    });
    drpContainer.LANG_load();
}

export function renderSelfToAssign() {
    return /*html*/`
        <div class="drp-option" data-id="${STORAGE.currentUser.id}" onclick="selectCollaborator()">
            <div class="user-img-container grid-center" style="--user-clr: ${STORAGE.currentUser.color}">
                <span>${STORAGE.currentUser.name.slice(0, 2).toUpperCase()}</span>
                <img src="${STORAGE.currentUser.img}">
            </div>
            <span data-lang="assigned-you"></span>
        </div>
    `;
}

export function renderCollaboratorsToAssign(collaborator) {
    return /*html*/ `
        <div class="drp-option" data-id="${collaborator.id}" onclick="selectCollaborator()">
            <div class="user-img-container grid-center" style="--user-clr: ${collaborator.color}">
                <span>${collaborator.name.slice(0, 2).toUpperCase()}</span>
                <img src="${collaborator.img}">
            </div>
            <span>${collaborator.name}</span>
        </div>
    `;
}

export function selectCollaborator() {
    event.currentTarget.classList.toggle('active');
    const collaboratorId = event.currentTarget.dataset.id;
    const index = selectedCollaborators.indexOf(collaboratorId.toString());
    
    if(index === -1) {
        selectedCollaborators.push(collaboratorId.toString());
    } else {
        selectedCollaborators.splice(index, 1);
    }
    renderCollaboratorInput();
}

export function checkSelectedCollaborator() {
    if(selectedCollaborators.length == 0) {
        $('#select-a-collaborator').classList.remove('error-inactive');
        $('#drp-wrapper-collaborator').classList.add('input-warning');
        return
    } else if(selectedCollaborators.length >= 1) {
        $('#select-a-collaborator').classList.add('error-inactive');
        $('#drp-wrapper-collaborator').classList.remove('input-warning');
    }
}

export function renderCollaboratorInput() {
    const inputContainerCollaborator = $('#selected-collaborator-input');
    inputContainerCollaborator.innerHTML = '';

    selectedCollaborators.forEach((collaboratorId) => {
        const users = ALL_USERS[collaboratorId];

        inputContainerCollaborator.innerHTML += /*html*/ `
            <div class="input-collaborator user-img-container grid-center" style="--user-clr: ${users.color}">
                <span>${(users.name).slice(0, 2).toUpperCase()}</span>
                <img src="${users.img}">
            </div>
        `;
    });
}

export function getTitle() {
    const title = $('#title').value;
  
    if(title === '') {
        titleEmpty();
    } else if(!letterRegex.test(title)) {
        titleInvalid();
    } else if(title.length > 15) {
        titleTooLong();
    } else {
        titleValid();
        return title
    }
}

export function titleEmpty() {
    $('#enter-a-title').classList.remove('error-inactive');
    $('#title').classList.add('input-warning');
    $('#title-too-long').classList.add('error-inactive');
    return
}

export function titleInvalid() {
    $('#enter-a-title').classList.add('error-inactive');
    $('#title-letters-only').classList.remove('error-inactive');
    $('#title').classList.add('input-warning');
    $('#title-too-long').classList.add('error-inactive');
    return
}

export function titleTooLong() {
    $('#title').classList.add('input-warning');
    $('#title-letters-only').classList.add('error-inactive');
    $('#enter-a-title').classList.add('error-inactive');
    $('#title').classList.add('input-warning');
    $('#title-too-long').classList.remove('error-inactive');
}

export function titleValid() {
    $('#title-letters-only').classList.add('error-inactive');
    $('#title-too-long').classList.add('error-inactive');
    $('#title').classList.remove('input-warning');
}

export function getDescription() {
    const description = $('#description').value;
    const letterRegexDiscription = /^[A-Za-zäöüßÄÖÜ\-\/_'., "0-9]{3,150}$/;
  
    if(description === '') {
        descriptionEmpty();
    } else if(!letterRegexDiscription.test(description)) {
        descriptionInvalid();
    } else {
        descriptionValid();
        return description;
    }
}

export function descriptionEmpty() {
    $('#enter-a-description').classList.remove('error-inactive');
    $('#description').classList.add('input-warning');
    return;
}

export function descriptionInvalid() {
    $('#enter-a-description').classList.add('error-inactive');
    $('#description').classList.add('input-warning');
    $('#description-letters-only').classList.remove('error-inactive');
    return;
}

export function descriptionValid() {
    $('#description-letters-only').classList.add('error-inactive');
    $('#enter-a-description').classList.add('error-inactive');
    $('#description').classList.remove('input-warning');
}

export function renderSelectedCategory(category) {
    const selected = $('#select-task-category');
    event.currentTarget.toggleDropDown();
    return selected.innerHTML = category;
}

export function getSelectedCategory() {
    const category = $('#select-task-category').innerText;
    
    if(category === LANG['select-task-category']) {
        return noCategorySelected();
    }
    categorySelected();
    return category; 
}

export function noCategorySelected() {
    $('#select-a-category').classList.remove('error-inactive');
    $('#category-drp-wrapper').classList.add('input-warning');
    return
}

export function categorySelected() {
    $('#select-a-category').classList.add('error-inactive');
    $('#category-drp-wrapper').classList.remove('input-warning');
}

export function getFormattedDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
  
    return `${day}/${month}/${year}`;
}

export function renderDate() {
    $('#date').value = getFormattedDate();
}

export function getDueDate() {
    const date = $('#date');

    if(date.value == '') {
        dateEmpty();
    } else if(!dateFormat(date.value)) {
        dateWrongFormat();
    } else if(dateFormat(date.value)) {
        dateValid();
        return date.value;
    }
}

export function dateEmpty() {
    $('#enter-a-dueDate').classList.remove('error-inactive');
    $('#date').classList.add('input-warning');     
    return
}

export function dateWrongFormat() {
    $('#enter-a-dueDate').classList.add('error-inactive');
    $('#date').classList.add('input-warning');     
    $('#wrong-date-format').classList.remove('error-inactive');
    return
}

export function dateValid() {
    $('#enter-a-dueDate').classList.add('error-inactive');
    $('#date').classList.remove('input-warning');
    $('#wrong-date-format').classList.add('error-inactive');
}

export function checkPriority() {
    const activeButton = $('.btn-priority button.active');
    
    if(activeButton) {
        $('#select-a-priority').classList.add('error-inactive');
        return activeButton.$('.priority').dataset.lang;
    } else {
        return $('#select-a-priority').classList.remove('error-inactive');
    }
}

export function getSubtasks() {
    return subtasks.map((subtaskName) => {
        return {name: subtaskName, done: false}
    });
}

export async function addTask() {
    const dir = currentDirectory();
    checkSelectedBoard();
    checkSelectedCollaborator();

    const title = getTitle();
    const description = getDescription();
    const category = getSelectedCategory();
    const collaborators = selectedCollaborators;
    const dueDate = getDueDate();
    const priority = checkPriority();
    const subtasks = getSubtasks();
    const addTaskData = [title, description, category ,collaborators, dueDate, priority, subtasks]; 

    if(checkAddTaskInputs(addTaskData)) return;
    await createNewTask(SELECTED_BOARD, title, description, category, selectedCollaborators, dueDate, priority, subtasks);
    notification('task-created');
    resetArrays();
    if(dir === "board") location.reload();
    else $('#board').click();
}

export function checkAddTaskInputs(addTaskData) {
    return addTaskData.some(singleInputField => singleInputField === undefined);
}

export async function createNewTask(SELECTED_BOARD, title, 
    description, category, selectedCollaborators, 
    dueDate, priority, subtasks) {

    const newTask = {
        title: title,
        description: description,
        category: category,
        assignedTo: selectedCollaborators,
        dueDate: dueDate,
        priority: priority,
        subTasks: subtasks
    }

    await SELECTED_BOARD.addTask(newTask);
}

export function clearSubtaskInput() {
    const subtaskInputContainer = $('.subtasks input');
    subtaskInputContainer.value = '';
}

export function checkSubtaskInput() {
    const inputField = $('.subtasks input').value;
    const inputButtons = $('.subtasks .inp-buttons');

    if(inputField.length >= 1) {
        inputButtons.classList.remove('d-none');
    } else if(inputField.length == 0) {
        inputButtons.classList.add('d-none');
    }
}

export function addSubtask() {
    const subtaskValue = $('.subtasks input');
    const inputButtons = $('.subtasks .inp-buttons');

    if(!letterRegex.test(subtaskValue.value)) {
        subtaskInvalid();
    } else if(subtaskValue.value.length > 30) {
        subtaskTooLong();
    } else {
        subtaskValid();
        subtasks.push(subtaskValue.value);
        subtaskValue.value = '';
    }
    inputButtons.classList.add('d-none');   
    renderSubtasks();
}

export function subtaskInvalid() {
    $('#error-container').classList.remove('d-none');
    $('#subtask-letters-only').classList.remove('error-inactive');
    $('#add-subtask').classList.add('input-warning');
    return
}

export function subtaskTooLong() {
    $('#error-container').classList.remove('d-none');
    $('#add-subtask').classList.add('input-warning');
    $('#subtask-letters-only').classList.add('error-inactive');
    $('#subtask-too-long').classList.remove('error-inactive');
    return 
}

export function subtaskValid() {
    $('#subtask-letters-only').classList.add('error-inactive');
    $('#subtask-too-long').classList.add('error-inactive');
    $('#add-subtask').classList.remove('input-warning');
    $('#error-container').classList.add('d-none');
}

export function renderSubtasks() {
    const subtaskContainer = $('#subtask-container');
    subtaskContainer.innerHTML = '';

    for(let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        subtaskContainer.innerHTML += renderSubtaskTemplate(subtask, i);
    }
}

export function editSubtask(i) {
    const subtaskInput = event.currentTarget.parentElement.previousElementSibling;
    const range = document.createRange();
    const selection = window.getSelection();
    subtaskInput.focus();
    subtaskInput.setAttribute('contenteditable', 'true')

    $('#single-subtask'+ i).classList.toggle('edit-btn-active');
    $('.subtask-edit-btn'+ i).classList.toggle('d-none');
    $('.save-edited-subtask-btn'+ i).classList.toggle('d-none');
    
    range.selectNodeContents(subtaskInput);
    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);
}

export function saveEditedSubtask(i) {
    const subtaskInput = event.currentTarget.parentElement.previousElementSibling;
    subtasks[i] = subtaskInput.innerText;
    subtaskInput.setAttribute('contenteditable', 'false')

    const allSaveButtons = $$('.save-edited-subtask-btn');

    allSaveButtons.forEach((button) => {
        button.classList.toggle('d-none');
    });

    $('#single-subtask'+ i).classList.toggle('edit-btn-active');
    $('.subtask-edit-btn'+ i).classList.toggle('d-none');
    $('.save-edited-subtask-btn'+ i).classList.toggle('d-none');
}


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

export function deleteSubtask(i) {
    if(event.currentTarget.closest('#edit-task')) {
        SELECTED_TASK.subTasks.splice(i, 1);
        renderEditSubtasks();
        return;
    };
    subtasks.splice(i, 1);
    renderSubtasks();
}

export function resetArrays() {
    selectedCollaborators.length = 0;
    subtasks.length = 0;
}

export function resetPriorityButton() {
    const buttons = $$('.btn-priority button');
    buttons.forEach((button) => button.classList.remove('active'));
}