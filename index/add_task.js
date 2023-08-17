async function initAddTask() {
    await getBoards();
    renderBoardIds();
}

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
    // log(selectedBoard);
    
    SELECTED_BOARD = selectedBoard;

    renderSelectedBoard(selectedBoard);
    renderCategories(selectedBoard);
    renderAssignToContacts(selectedBoard);
}

function renderSelectedBoard(selectedBoard) {
    const selectedBoardField = $('#selected-board');
    const selectedBoardName = selectedBoard.name;

    selectedBoardField.innerText = selectedBoardName;
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

function renderAssignToContacts(selectedBoard) {
    const drpContainer = $('#drp-collab-container');
    const assignToUser = document.createElement('div');
    assignToUser.innerHTML = /*html*/`
        <div class="drp-option" onclick="selectCollaborator(${USER.id})">
            <div class="user-img-container grid-center" style="--user-clr: ${USER.color}"><span>${USER.name.slice(0, 2).toUpperCase()}</span><img src="${USER.img}"></div>
            <span data-lang="assigned-you"></span>
        </div>
    `;

    drpContainer.innerHTML = '';
    assignToUser.LANG_load();
    drpContainer.append(assignToUser.children[0]);

    selectedBoard.collaborators.forEach(collaboratorId => {
        const collaborator = CONTACTS[collaboratorId];
        if (collaborator == USER.id) return;
        if (!collaborator) return;

        const collaboratorOption = document.createElement('div');
        collaboratorOption.innerHTML = /*html*/ `
            <div class="drp-option" onclick="selectCollaborator(${collaborator.id})">
                <div class="user-img-container grid-center" style="--user-clr: ${collaborator.color}"><span>${collaborator.name.slice(0, 2).toUpperCase()}</span><img src="${collaborator.img}"></div>
                <span>${collaborator.name}</span>
            </div>
        `;

        drpContainer.append(collaboratorOption.children[0]);
    });
}

let selectedCollaborators = [];

function selectCollaborator(collaboratorId) {
    const index = selectedCollaborators.indexOf(collaboratorId.toString());

    if (index === -1) {
        selectedCollaborators.push(collaboratorId.toString());
    } else {
        selectedCollaborators.splice(index, 1);
    }

    renderSelectedCollaborators();
}

function renderSelectedCollaborators() {
    const selectedCollabsContainer = $('#selected-collaborators');
    selectedCollabsContainer.innerHTML = '';

    selectedCollaborators.for((collaboratorId) => {
        const users = ALL_USERS[collaboratorId];

        selectedCollabsContainer.innerHTML += /*html*/ `
            <div class="user-img-container grid-center" style="--user-clr: ${users.color}">
                <span>${(users.name).slice(0, 2).toUpperCase()}</span>
                <img src="${users.img}">
            </div>
        `;
    });
}

function getTitle() {
    const title = $('#title');
    
    if(title.value == '') {
        error('No title entered.');
    } else {
        return title.value;
    }
    // console.log(title.value);
}

function getDescription() {
    const description = $('#description');
    
    if(description.value == '') {
        error('No description entered.');
    } else {
        return description.value;
    }
    // console.log(description.value);
}

function renderSelectedCategory(category) {
    const selected = $('#select-task-category');
    event.currentTarget.toggleDropDown();
    return selected.innerHTML = category;
    // log(category);
}

function getSelectedCategory() {
    const category = $('#select-task-category');

    if(category.innerHTML == '') {
        error('No category selected.');
    } else {
        return category.innerText;
    }
}

function getDueDate() {
    const date = $('#date');

    if(date.value == '') {
        error('No due date entered.');
    } else {
        return date.value;
    }
    // log(date.value);
}

function checkPriority() {
    const activeButton = $('.btn-priority button.active');
    
    if (activeButton) {
        return activeButton.$('.priority').textContent.toLowerCase();
    } else {
        return error("No active button found.");
    }
}

function addTask() {
    const title = getTitle();
    const description = getDescription();
    const category = getSelectedCategory();
    const dueDate = getDueDate();
    const priority = checkPriority();
    // const subtask = getSubtask();

    createNewTask(SELECTED_BOARD, title, description, category, selectedCollaborators, dueDate, priority);
}

function createNewTask(SELECTED_BOARD, title, 
    description, category, selectedCollaborators, 
    dueDate, priority) {

        const newTask = {
            title: title,
            description: description,
            category: category,
            assignedTo: selectedCollaborators,
            dueDate: dueDate,
            priority: priority
        }

        SELECTED_BOARD.addTask(newTask);
        // console.log(newTask);
}

function clearSubtaskInput() {
    const subtaskInputContainer = $('.subtasks input');
    subtaskInputContainer.value = '';
}

const subtasks = [];

function addSubtask() {
    const subtaskValue = $('.subtasks input').value;

    const index = subtasks.indexOf(subtaskValue);

    if (index === -1) {
        subtasks.push(subtaskValue);
    } else {
        subtasks.splice(index, 1);
    }

    renderSubtasks();
    // log(subtasks);
}

function renderSubtasks() {
    const subtaskContainer = $('#subtask-container');
    subtaskContainer.innerHTML = '';

    for(let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];

        subtaskContainer.innerHTML += /*html*/ `
            <div class="row single-subtask">
                <li>${subtask}</li>

                <div class="row gap-10 subtask-edit-delete-btns" id="subtask-edit-delete-btns${i}">
                    <button class="grid-center" onclick="deleteSubtask(${i})">
                        <img src="/Join/assets/img/icons/trash.svg" width="20">
                    </button>
                </div>
            </div>
        `;
    }
}

function deleteSubtask(i) {
    subtasks.splice(i, 1);
    renderSubtasks();
}