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
    event.currentTarget.toggleDropDown();
    
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
    console.log(title.value);
}

function getDescription() {
    const description = $('#description');
    console.log(description.value);
}

function getSelectedCategory(category) {
    const selected = $('#select-task-category');
    selected.innerHTML = category;
    log(category);
}

function getDueDate() {
    const date = $('#date');
    log(date.value);
}

function checkPriority(clickedButton) {
    const buttonText = clickedButton.querySelector('span').innerText;
    console.log(buttonText.toLowerCase());
}