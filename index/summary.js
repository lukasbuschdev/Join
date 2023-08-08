const initSummary = async () => {
    renderBoards();
}

const renderBoards = () => {
    const selection = $('#summary-selection');
    // selection.innerHTML = '';
    // selection.renderItems(Object.values(BOARDS), boardSelectionTemplate);
}

const boardSelectionTemplate = ({name, id}) => {
    return /*html*/`<button type="option" onclick="renderBoard(${id})">${name}</button>`;
}

const renderBoard = (id) => {
    const tasks = Object.values(BOARDS[id].tasks);
    const tasksInBoard = tasks.length;
    const tasksInProgress = tasks.filter(({type})=> type == "in-progress").length;
    const tasksAwaitingFeedback = tasks.filter(({type})=> type == "awaiting-feedback").length;
    const tasksToDo = tasks.filter(({type})=> type == "to-do").length;
    const tasksDone = tasks.filter(({type})=> type == "done").length;
    const boardButtons = $$('#summary-data button');
    boardButtons[0].$('h1').innerText = tasksInBoard;
    boardButtons[1].$('h1').innerText = tasksInProgress;
    boardButtons[2].$('h1').innerText = tasksAwaitingFeedback;
    boardButtons[4].$('h1').innerText = tasksToDo;
    boardButtons[5].$('h1').innerText = tasksDone;
}

const createBoardModal = () => {
    $('#add-board').openModal();
}

const addBoardCategory = () => {
    const title = $('#add-board-categories input').value;
    const color = $('.category-color.active').style.getPropertyValue('--clr');
    const titleValidity = title.length > 10;
    throwErrors({identifier: "name-to-long", bool: titleValidity});
    if (titleValidity) return;

    $('.categories-container').innerHTML += addBoardCategoryTemplate(title, color);
    $('#add-board-categories input').value = '';
}

const addBoardCategoryTemplate = (title, color) => {
    return /*html*/`
        <div class="task-category" style="--clr: ${color};">
            <span>${title}</span>
            <button onclick="removeBoardCategory()">
                <img src="/Join/assets/img/icons/close_white.svg" alt="">
            </button>
        </div>
    `
}

const removeBoardCategory = () => {
    event.currentTarget.parentElement.remove();
}

const clearCategoryInput = () => {
    event.currentTarget.parentElement.previousElementSibling.value = ''
    const title = $('#add-board-categories input').value;
    const titleValidity = title.length > 10;
    throwErrors({identifier: "name-to-long", bool: titleValidity});
}

const createNewBoard = async () => {
    const boardName = $('#add-board-title input').value.replaceAll(' ', '-');

    let categories = {};
    $$('.task-category').for(
        category => {
            const color = category.style.getPropertyValue('--clr');
            const name = category.$('span').innerText;
            categories[name] = color;
        }
    );
    
    const boardData = {
        name: boardName,
        categories,
        collaborators: [USER.id]
    };
    const user = await getCurrentUser(true);
    const newBoard = await user.addBoard(boardData);
    notification('board-added');

    $$('.collaborator-invitation').for(
        invite => {
            const id = invite.dataset.id;
            const notification = new Notify({
                recipientId: id,
                type: "boardInvite",
                ownerName: USER.name,
                boardName: newBoard.name,
                boardId: newBoard.id
            });
            notification.send();
        }
    );
};

const toggleDrp = () => {
    const drp = $('.add-board-data .drp');
    const sortedContacts = Object.values(CONTACTS).sort((a, b) => (a.name > b.name) ? 1 : -1);
    drp.innerHTML = ''
    drp.renderItems(sortedContacts, contactDropdownTemplate);
};

const filterDrp = debounce(() => {
    
    const drp = $('.add-board-data .drp');
    const filter = $('#add-board-collaborators input').value;
    // if (!filter) return
    const sortedContacts = Object.values(CONTACTS).sort((a, b) => (a.name > b.name) ? 1 : -1);
    const filteredContacts = sortedContacts.filter(
        ({name}) => name.toLowerCase().includes(filter.toLowerCase())
    );
    drp.innerHTML = ''
    drp.renderItems(filteredContacts, contactDropdownTemplate);
});

const contactDropdownTemplate = ({name, color}) => {
    return /*html*/`
        <div class="contact row">
            <div class="user-img-container" style="--user-clr: ${color};">
                <span>${name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>${name}</div>
            <button class="grid-center">
                <img src="/Join/assets/img/icons/btn_plus.svg" alt="">
            </button>
        </div>
    `
}