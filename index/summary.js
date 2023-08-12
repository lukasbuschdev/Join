const initSummary = async () => {
    await getBoards();
    renderBoards();
}

const renderBoards = () => {
    const selection = $('#summary-selection');
    selection.innerHTML = '';
    selection.renderItems(Object.values(BOARDS), boardSelectionTemplate);
    initMenus();
    const activeBoard = SESSION_getData('activeBoard') ?? Object.keys(BOARDS)[0];
    const activeBoardButton = $(`#summary-selection [data-id="${activeBoard}"]`);
    activeBoardButton.click();
    activeBoardButton.classList.add('active');
}

const boardSelectionTemplate = ({name, id}) => {
    return /*html*/`<button type="option" data-id="${id}" onclick="renderBoard()">${name.replaceAll('-',' ')}</button>`;
}

const renderBoard = () => {
    const id = event.currentTarget.dataset.id;
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
        .sort()[0]
        .toLocaleDateString(currentLang(), {year: 'numeric', month: 'long', day: 'numeric'}) : undefined;
    const boardButtons = $$('#summary-data button');
    boardButtons[0].$('h1').innerText = tasksInBoard;
    boardButtons[1].$('h1').innerText = tasksInProgress;
    boardButtons[2].$('h1').innerText = tasksAwaitingFeedback;
    boardButtons[3].$('.urgent-tasks h1').innerText = tasksUrgent;
    if (upcomingDeadline) boardButtons[3].$('.upcoming-deadline span:first-of-type').innerText = upcomingDeadline;
    boardButtons[3].$$(':is(.line, .upcoming-deadline)').for(container => container.classList.toggle('d-none', !upcomingDeadline));
    boardButtons[4].$('h1').innerText = tasksToDo;
    boardButtons[5].$('h1').innerText = tasksDone;
    SESSION_setData('activeBoard', Number(id));
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
    $('#add-board').closeModal();
    notification('board-added');

    $$('.collaborators-container .collaborator').for(
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
    event.currentTarget.toggleDropDown();
    const drp = $('.add-board-data #drp-collaborators');
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

const contactDropdownTemplate = ({name, color, id}) => {
    return /*html*/`
        <div class="contact row gap-15">
            <div class="user-img-container" style="--user-clr: ${color};">
                <span>${name.slice(0, 2).toUpperCase()}</span>
            </div>
            <div>${name}</div>
            <button class="grid-center" onclick="addCollaborator(${id})">
                <img src="/Join/assets/img/icons/btn_plus.svg" alt="">
            </button>
        </div>
    `
}

const addCollaborator = (id) => {
    const {name, color} = CONTACTS[id];
    if ($(`.collaborator[data-id="${id}"]`)) return;
    $('.collaborators-container').innerHTML += /*html*/`
        <button class="collaborator" data-id="1689153951244">
            <div class="user-img-container" style="--user-clr: ${color}">
                <span>${name.slice(0, 2).toUpperCase()}</span>
            </div>
        </button>
    `;
}