const initSummary = async () => {
    await getBoards();
    renderBoards();
}

const renderBoards = () => {
    const selection = $('#summary-selection');
    if (USER.boards.length == 0) return $('#summary-content').classList.toggle('d-none');
    selection.innerHTML = '';
    selection.renderItems(Object.values(BOARDS)
        .sort((a, b) => a.dateOfLastEdit - b.dateOfLastEdit), boardSelectionTemplate);
    if (!SESSION_getData('activeBoard')) SESSION_setData('activeBoard', Number(Object.keys(BOARDS)[0]));
    const activeBoard = SESSION_getData('activeBoard');
    const activeBoardButton = $(`#summary-selection [data-id="${activeBoard}"]`);
    activeBoardButton?.click();
    activeBoardButton?.classList.add('active');
}

const boardSelectionTemplate = ({name, id, owner}) => {
    return /*html*/`
        <button class="row" type="option" data-id="${id}" onclick="renderBoard()">
            <span>${name.replaceAll('-',' ')}</span>
            ${(owner == USER.id)
            ? /*html*/`<div class="circle grid-center" onclick="initEditBoard(${id})">
                <img src="/Join/assets/img/icons/edit.svg" alt="">
            </div>`
            : ''}
        </button>`;
}

const renderBoard = () => {
    const id = event.currentTarget.dataset.id;
    SELECTED_BOARD = BOARDS[id];
    const tasks = Object.values(BOARDS[id].tasks);
    const tasksInBoard = tasks.length;
    const tasksInProgress = tasks.filter(({type}) => type == "in-progress").length;
    const tasksAwaitingFeedback = tasks.filter(({type}) => type == "awaiting-feedback").length;
    const tasksToDo = tasks.filter(({type}) => type == "to-do").length;
    const tasksDone = tasks.filter(({type}) => type == "done").length;
    const tasksUrgent = tasks.filter(({priority}) => priority == "urgent").length;
    
    const now = new Date();
    const upcomingDeadline = (tasksInBoard) ? tasks
        .map(({dueDate}) => {
            const [day, month, year] = dueDate.split('/');
            return new Date(year, Number(month) - 1, day);
        })
        .filter(date => date > now)
        .sort()
        .at(0)
        ?.toLocaleDateString(currentLang(), {year: 'numeric', month: 'long', day: 'numeric'}) || undefined : undefined;
    const boardButtons = $$('#summary-data button');
    boardButtons[0].$('h1').innerText = tasksInBoard;
    boardButtons[1].$('h1').innerText = tasksInProgress;
    boardButtons[2].$('h1').innerText = tasksAwaitingFeedback;
    boardButtons[3].$('.urgent-tasks h1').innerText = tasksUrgent;
    if (upcomingDeadline) boardButtons[3].$('.upcoming-deadline span:first-of-type').innerText = upcomingDeadline;
    boardButtons[3].$$(':is(.line, .upcoming-deadline)').for(container => container.classList.toggle('d-none', !upcomingDeadline));
    boardButtons[4].$('h1').innerText = tasksToDo;
    boardButtons[5].$('h1').innerText = tasksDone;
    boardButtons.for(button => button.onclick = () => $('nav #board').click());
    $('#summary-selection').classList.remove('active');
    SESSION_setData('activeBoard', Number(id));
    
    const summaryHeader = $('.summary-header h2');
    delete summaryHeader.dataset.lang;
    summaryHeader.innerText = SELECTED_BOARD.name;
}

const createBoardModal = async () => {
    await $('#add-board .add-board-data').includeTemplate('/Join/assets/templates/index/add-board.html');
    $('#add-board').openModal();
}

const addBoardCategory = () => {
    const title = $('#add-board-categories input').value;
    const color = $('.category-color.active').style.getPropertyValue('--clr');
    const titleValidity = title.length > 10;
    throwErrors({identifier: "name-too-long", bool: titleValidity});
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
    throwErrors({identifier: "name-too-long", bool: titleValidity});
}

const isValidTitle = (titleInput) => /^[a-zA-Z0-9_-]+$/.test(titleInput);

const createNewBoard = async () => {
    const boardName = $('#add-board-title input').value.replaceAll(' ', '-');
    const titleIsValid = isValidTitle(boardName);
    if (!titleIsValid) return throwErrors({identifier: 'title', bool: titleIsValid});

    const collaborators = [...$$('.collaborator')].reduce((total, collaborator) => {
        total.push(collaborator.dataset.id);
        return total;
    }, []);

    const categories = [...$$('.task-category')].reduce((total, category) => {
        const color = category.style.getPropertyValue('--clr');
        const name = category.$('span').innerText;
        total[name] = color;
        return total;
    }, {});
    
    const boardData = {
        name: boardName,
        categories,
        collaborators: [USER.id]
    };
    const newBoard = await USER.addBoard(boardData);
    $('#add-board').closeModal();
    notification('board-added');
    createBoardNotification(newBoard, collaborators);
    loadContent();
};

const createBoardNotification = ({name, id}, collaborators) => {
    const notification = new Notify({
        recipients: collaborators,
        type: "boardInvite",
        ownerName: USER.name,
        boardName: name,
        boardId: id
    });
    notification.send();

};

const toggleDrp = () => {
    event.currentTarget.toggleDropDown();
    const drp = $('.add-board-data #drp-collaborators');
    const sortedContacts = Object.values(CONTACTS).sort((a, b) => (a.name > b.name) ? 1 : -1);
    drp.innerHTML = ''
    drp.renderItems(sortedContacts, contactDropdownTemplate);
};

const filterDrp = debounce(() => {
    
    const drp = $('.add-board-data .drp');
    const filter = $('#add-board-collaborators input').value;
    const sortedContacts = Object.values(CONTACTS).sort((a, b) => (a.name > b.name) ? 1 : -1);
    const filteredContacts = sortedContacts.filter(
        ({name}) => name.toLowerCase().includes(filter.toLowerCase())
    );
    drp.innerHTML = ''
    drp.renderItems(filteredContacts, contactDropdownTemplate);
});

const contactDropdownTemplate = ({name, color, id}) => {
    return /*html*/`
        <div class="contact row gap-15 drp-option" onclick="addCollaborator(${id})">
            <div class="user-img-container" style="--user-clr: ${color};">
                <span>${name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>${name}</div>
        </div>
    `
}

const addCollaborator = (id) => {
    const {name, color} = CONTACTS[id];
    if ($(`.collaborator[data-id="${id}"]`)) return;
    this.classList.add('active')
    $('.collaborators-container').innerHTML += /*html*/`
        <button class="collaborator" data-id="1689153951244">
            <div class="user-img-container" style="--user-clr: ${color}">
                <span>${name.slice(0, 2).toUpperCase()}</span>
            </div>
        </button>
    `;
}

const initEditBoard = (boardId) => {
    const editBoardModal = $('#edit-board-modal');
    editBoardModal.openModal();
}

const deleteBoard = () => confirmation(`delete-board, {boardName: '${SELECTED_BOARD.name}'}`, async () => {
    SELECTED_BOARD.collaborators.forAwait(async collaboratorId => {
        await REMOTE_removeData(`users/${collaboratorId}/boards/${SELECTED_BOARD.id}`);
    });
    SESSION_removeData('activeBoard');
    await SELECTED_BOARD.delete();
    SELECTED_BOARD = Object.values(BOARDS)[0] || undefined;
    notification('board-deleted');
    $('#edit-board-modal').closeModal();
    loadContent();
})

const toggleBoardSelection = () => {
    $('#summary-selection').classList.toggle('active');
}