async function initAddTask() {
    await getBoards();
    renderBoardIds();
    $('.add-task-card').LANG_load();
    resetArrays();
}

const subtasks = [];
const selectedCollaborators = [];
const letterRegex = /^[A-Za-zäöüßÄÖÜ\-\/_' "0-9]+$/;

const newCollabArray = _.cloneDeep(selectedCollaborators);


function renderBoardIds() {
    const drpContainer = $('#drp-board-container');
    drpContainer.innerHTML = ''; 

    BOARDS.for(board => {
        drpContainer.innerHTML += /*html*/ `
            <div class="drp-option" onclick="selectBoard(${board.id})">${board.name}</div>
        `;    
    });
}

function selectBoard(boardId) {
    const selectedBoard = BOARDS[boardId];
    SELECTED_BOARD = selectedBoard;
    event.currentTarget.toggleDropDown();

    SELECTED_BOARD = selectedBoard;

    renderSelectedBoard(selectedBoard);
    renderCategories(selectedBoard);
    renderAssignToContacts();
}

function renderSelectedBoard(selectedBoard) {
    const selectedBoardField = $('#selected-board');
    const selectedBoardName = selectedBoard.name;

    selectedBoardField.innerText = selectedBoardName;
}

function checkSelectedBoard() {
    const boardInput = $('#selected-board').innerText;
    
    if(boardInput === LANG['select-board']) {
        document.getElementById('select-a-board').classList.remove('error-inactive');
        document.getElementById('drp-wrapper-board').classList.add('input-warning');
        return
    } else if(boardInput.length >= 3) {
        document.getElementById('select-a-board').classList.add('error-inactive');
        document.getElementById('drp-wrapper-board').classList.remove('input-warning'); 
    }
}

function renderCategories(selectedBoard) {
    const drpContainer = $('#drp-categories');
    drpContainer.innerHTML = '';

    Object.entries(selectedBoard.categories).for(([name, color]) => {
        drpContainer.innerHTML += /*html*/ `
            <div class="drp-option row" id="category" data-color="${color}" onclick="this.toggleActive(), renderSelectedCategory('${name}')">
                <span>${name}</span>
                <div class="category-color" style="--clr: ${color}"></div>
            </div>
        `;    
    });
}

function renderAssignToContacts() {
    const drpContainer = $('#drp-collab-container');
    const assignToUser = document.createElement('div');
    assignToUser.innerHTML = /*html*/`
        <div class="drp-option" data-id="${USER.id}" onclick="selectCollaborator()">
            <div class="user-img-container grid-center" style="--user-clr: ${USER.color}"><span>${USER.name.slice(0, 2).toUpperCase()}</span><img src="${USER.img}"></div>
            <span data-lang="assigned-you"></span>
        </div>
    `;

    drpContainer.innerHTML = '';
    assignToUser.LANG_load();
    drpContainer.append(assignToUser.children[0]);

    SELECTED_BOARD.collaborators.forEach(collaboratorId => {
        const collaborator = CONTACTS[collaboratorId];
        if (collaborator == USER.id) return;
        if (!collaborator) return;

        const collaboratorOption = document.createElement('div');
        collaboratorOption.innerHTML = /*html*/ `
            <div class="drp-option" data-id="${collaboratorId}" onclick="selectCollaborator()">
                <div class="user-img-container grid-center" style="--user-clr: ${collaborator.color}"><span>${collaborator.name.slice(0, 2).toUpperCase()}</span><img src="${collaborator.img}"></div>
                <span>${collaborator.name}</span>
            </div>
        `;

        drpContainer.append(collaboratorOption.children[0]);
    });
}

function selectCollaborator() {
    event.currentTarget.classList.toggle('active');
    const collaboratorId = event.currentTarget.dataset.id;
    const index = selectedCollaborators.indexOf(collaboratorId.toString());
    
    if (index === -1) {
        selectedCollaborators.push(collaboratorId.toString());
    } else {
        selectedCollaborators.splice(index, 1);
    }
    renderCollaboratorInput();
}

function checkSelectedCollaborator() {
    if(selectedCollaborators.length == 0) {
        document.getElementById('select-a-collaborator').classList.remove('error-inactive');
        document.getElementById('drp-wrapper-collaborator').classList.add('input-warning');
        return
    } else if(selectedCollaborators.length >= 1) {
        document.getElementById('select-a-collaborator').classList.add('error-inactive');
        document.getElementById('drp-wrapper-collaborator').classList.remove('input-warning');
    }
}

function renderCollaboratorInput() {
    const inputContainerCollaborator = $('#selected-collaborator-input');
    inputContainerCollaborator.innerHTML = '';

    selectedCollaborators.for((collaboratorId) => {
        const users = ALL_USERS[collaboratorId];

        inputContainerCollaborator.innerHTML += /*html*/ `
            <div class="input-collaborator user-img-container grid-center" style="--user-clr: ${users.color}">
                <span>${(users.name).slice(0, 2).toUpperCase()}</span>
                <img src="${users.img}">
            </div>
        `;
    });
}

function getTitle() {
    const title = $('#title').value;
  
    if (title === '') {
        titleEmpty();
    } else if (!letterRegex.test(title)) {
        titleInvalid();
    } else if(title.length > 15) {
        titleTooLong();
    } else {
        titleValid();
        return title
    }
}

function titleEmpty() {
    document.getElementById('enter-a-title').classList.remove('error-inactive');
    document.getElementById('title').classList.add('input-warning');
    document.getElementById('title-too-long').classList.add('error-inactive');
    return
}

function titleInvalid() {
    document.getElementById('enter-a-title').classList.add('error-inactive');
    document.getElementById('title-letters-only').classList.remove('error-inactive');
    document.getElementById('title').classList.add('input-warning');
    document.getElementById('title-too-long').classList.add('error-inactive');
    return
}

function titleTooLong() {
    document.getElementById('title').classList.add('input-warning');
    document.getElementById('title-letters-only').classList.add('error-inactive');
    document.getElementById('enter-a-title').classList.add('error-inactive');
    document.getElementById('title').classList.add('input-warning');
    document.getElementById('title-too-long').classList.remove('error-inactive');
}

function titleValid() {
    document.getElementById('title-letters-only').classList.add('error-inactive');
    document.getElementById('title-too-long').classList.add('error-inactive');
    document.getElementById('title').classList.remove('input-warning');
}

function getDescription() {
    const description = $('#description').value;
    const letterRegexDiscription = /^[A-Za-zäöüßÄÖÜ\-\/_'., "0-9]{3,150}$/;
  
    if (description === '') {
        descriptionEmpty();
    } else if (!letterRegexDiscription.test(description)) {
        descriptionInvalid();
    } else {
        descriptionValid();
        return description;
    }
}

function descriptionEmpty() {
    document.getElementById('enter-a-description').classList.remove('error-inactive');
    document.getElementById('description').classList.add('input-warning');
    return;
}

function descriptionInvalid() {
    document.getElementById('enter-a-description').classList.add('error-inactive');
    document.getElementById('description').classList.add('input-warning');
    document.getElementById('description-letters-only').classList.remove('error-inactive');
    return;
}

function descriptionValid() {
    document.getElementById('description-letters-only').classList.add('error-inactive');
    document.getElementById('enter-a-description').classList.add('error-inactive');
    document.getElementById('description').classList.remove('input-warning');
}

function renderSelectedCategory(category) {
    const selected = $('#select-task-category');
    event.currentTarget.toggleDropDown();
    return selected.innerHTML = category;
}

function getSelectedCategory() {
    const category = $('#select-task-category').innerText;
    
    if(category === LANG['select-task-category']) {
        return noCategorySelected();
    }
    categorySelected();
    return category; 
}

function noCategorySelected() {
    document.getElementById('select-a-category').classList.remove('error-inactive');
    document.getElementById('category-drp-wrapper').classList.add('input-warning');
    return
}

function categorySelected() {
    document.getElementById('select-a-category').classList.add('error-inactive');
    document.getElementById('category-drp-wrapper').classList.remove('input-warning');
}

function getDueDate() {
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

function dateEmpty() {
    document.getElementById('enter-a-dueDate').classList.remove('error-inactive');
    document.getElementById('date').classList.add('input-warning');     
    return
}

function dateWrongFormat() {
    document.getElementById('enter-a-dueDate').classList.add('error-inactive');
    document.getElementById('date').classList.add('input-warning');     
    document.getElementById('wrong-date-format').classList.remove('error-inactive');
    return
}

function dateValid() {
    document.getElementById('enter-a-dueDate').classList.add('error-inactive');
    document.getElementById('date').classList.remove('input-warning');
    document.getElementById('wrong-date-format').classList.add('error-inactive');
}

function checkPriority() {
    const activeButton = $('.btn-priority button.active');
    
    if (activeButton) {
        document.getElementById('select-a-priority').classList.add('error-inactive')
        return activeButton.$('.priority').dataset.lang;
    } else {
        return document.getElementById('select-a-priority').classList.remove('error-inactive');
    }
}

function getSubtasks() {
    return subtasks.map((subtaskName) => {
        return {name: subtaskName, done: false}
    });
}

async function addTask() {
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

    if (checkAddTaskInputs(addTaskData)) {
        log(addTaskData)
        return;
    } else {
        await createNewTask(SELECTED_BOARD, title, description, category, selectedCollaborators, dueDate, priority, subtasks);
        $('#content').includeTemplate(`/Join/assets/templates/index/${currentDirectory()}_template.html`);
        notification('task-created');
        resetArrays();
    }
}

function checkAddTaskInputs(addTaskData) {
    return addTaskData.some(singleInputField => singleInputField === undefined);
}

async function createNewTask(SELECTED_BOARD, title, 
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

function clearSubtaskInput() {
    const subtaskInputContainer = $('.subtasks input');
    subtaskInputContainer.value = '';
}

function checkSubtaskInput() {
    const inputField = $('.subtasks input').value;
    const inputButtons = document.querySelector('.subtasks .inp-buttons');

    if(inputField.length >= 1) {
        inputButtons.classList.remove('d-none');
    } else if(inputField.length == 0) {
        inputButtons.classList.add('d-none');
    }
}

function addSubtask() {
    const subtaskValue = $('.subtasks input');
    const inputButtons = document.querySelector('.subtasks .inp-buttons');

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

function subtaskInvalid() {
    document.getElementById('error-container').classList.remove('d-none');
    document.getElementById('subtask-letters-only').classList.remove('error-inactive');
    document.getElementById('add-subtask').classList.add('input-warning');
    return
}

function subtaskTooLong() {
    document.getElementById('error-container').classList.remove('d-none');
    document.getElementById('add-subtask').classList.add('input-warning');
    document.getElementById('subtask-letters-only').classList.add('error-inactive');
    document.getElementById('subtask-too-long').classList.remove('error-inactive');
    return 
}

function subtaskValid() {
    document.getElementById('subtask-letters-only').classList.add('error-inactive');
    document.getElementById('subtask-too-long').classList.add('error-inactive');
    document.getElementById('add-subtask').classList.remove('input-warning');
    document.getElementById('error-container').classList.add('d-none');
}

function renderSubtasks() {
    const subtaskContainer = $('#subtask-container');
    subtaskContainer.innerHTML = '';

    for(let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        subtaskContainer.innerHTML += renderSubtaskTemplate(subtask, i);
    }
}

function editSubtask(i) {
    const subtaskInput = event.currentTarget.parentElement.previousElementSibling;
    const range = document.createRange();
    const selection = window.getSelection();
    subtaskInput.focus();
    subtaskInput.setAttribute('contenteditable', 'true')

    document.querySelector('#single-subtask'+ i).classList.toggle('edit-btn-active');
    document.querySelector('.subtask-edit-btn'+ i).classList.toggle('d-none');
    document.querySelector('.save-edited-subtask-btn'+ i).classList.toggle('d-none');
    
    range.selectNodeContents(subtaskInput);
    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);
}

function saveEditedSubtask(i) {
    const subtaskInput = event.currentTarget.parentElement.previousElementSibling;
    subtasks[i] = subtaskInput.innerText;
    subtaskInput.setAttribute('contenteditable', 'false')

    const allSaveButtons = $$('.save-edited-subtask-btn');

    allSaveButtons.for((button) => {
        button.classList.toggle('d-none');
    });

    document.querySelector('#single-subtask'+ i).classList.toggle('edit-btn-active');
    document.querySelector('.subtask-edit-btn'+ i).classList.toggle('d-none');
    document.querySelector('.save-edited-subtask-btn'+ i).classList.toggle('d-none');
}


function renderSubtaskTemplate(subtask, i) {
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

function deleteSubtask(i) {
    subtasks.splice(i, 1);
    renderSubtasks();
}

function resetArrays() {
    selectedCollaborators.length = 0;
    subtasks.length = 0;
}

function resetPriorityButton() {
    const buttons = $$('.btn-priority button');
    buttons.for((button) => button.classList.remove('active'));
}