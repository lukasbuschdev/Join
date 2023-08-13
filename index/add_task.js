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
            <div class="drp-option row" id="category" data-color="${color}" onclick="this.toggleActive(), getSelectedCategory('${name}')">
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
            <div class="user-img-container grid-center" style="--user-clr: ${USER.color}">${USER.name.slice(0, 2).toUpperCase()}</div>
            <span data-lang="assigned-you"></span>
        </div>
    `;

    drpContainer.innerHTML = '';
    assignToUser.LANG_load();
    drpContainer.append(assignToUser.children[0]);

    selectedBoard.collaborators.for(collaboratorId => {
        const collaborator = CONTACTS[collaboratorId];
        if (collaborator == USER.id) return;
        if(!collaborator) return;
        drpContainer.innerHTML += /*html*/ `
            <div class="drp-option" onclick="selectCollaborator(${collaborator.id})">
                <div class="user-img-container grid-center" style="--user-clr: ${collaborator.color}">${collaborator.name.slice(0, 2).toUpperCase()}</div>
                <span>${collaborator.name}</span>
            </div>
        `;    
    });
}

function getTitle() {
    const title = $('#title');
    return title.value;
    // console.log(title.value);
}

function getDescription() {
    const description = $('#description');
    return description.value;
    // console.log(description.value);
}

function getSelectedCategory(category) {
    const selected = $('#select-task-category');
    selected.innerHTML = category;
    // log(category);
}

function getDueDate() {
    const date = $('#date');
    return date.value;
    // log(date.value);
}

function checkPriority(clickedButton) {
    const buttonText = clickedButton.querySelector('span');
    return buttonText.innerText.toLowerCase();
    // console.log(buttonText.toLowerCase());
}

function addTask() {
    const title = getTitle();
    const description = getDescription();
    const category = getSelectedCategory(boards);
    // const collaborator = ;
    const dueDate = getDueDate();
    const priority = checkPriority();
    // const subtask = ;

    log(SELECTED_BOARD, title, description, category, dueDate, priority);
}