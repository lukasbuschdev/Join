function initAddTask() {
    renderBoardIds();
}

function renderBoardIds() {
    const drpContainer = $('#drp-board-container');
    drpContainer.innerHTML = ''; 

    BOARDS.for(board => {
        drpContainer.innerHTML += /*html*/ `
            <div class="drp-option" onclick="selectBoard(${board.id})">${board.name}</div>
            `;    
    })
}

function selectBoard(boardId) {
    const selectedBoard = BOARDS[boardId];
    event.currentTarget.toggleDropDown();
    
    renderCategories(selectedBoard);
    renderAssignToContacts(selectedBoard);
}

function renderCategories(selectedBoard) {
    const drpContainer = $('#drp-categories');
    drpContainer.innerHTML = '';

    Object.entries(selectedBoard.categories).for(([name, color]) => {
        drpContainer.innerHTML += /*html*/ `
            <div class="drp-option row" data-color="${color}" onclick="this.toggleActive()">
                <span>${name}</span>

            </div>
        `;    
    })
}

function renderAssignToContacts(selectedBoard) {
    const drpContainer = $('#drp-collab-container');
    drpContainer.innerHTML = '';

    console.log(selectedBoard);

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
    })
}






// function addTask() {
//     const boardId = $('').;
//     const = $('').;
//     const = $('').;
//     const = $('').;
//     const = $('').;
//     const = $('').;
//     const = $('').;
//     const = $('').;
//     const = $('').;
//     const = $('').;
// }