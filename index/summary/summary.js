import { currentLang } from "../../js/language.js";
import { getContacts, REMOTE_removeData, SESSION_getData, SESSION_removeData, SESSION_setData, STORAGE } from "../../js/storage.js";
import { $, $$, debounce, notification, throwErrors } from "../../js/utilities.js";
import { Notify } from "../../js/notify.class.js";
import { bindInlineFunctions, getContext } from "../../js/setup.js";
import { boardTitleSelectionTemplate } from "../index/index.js";
import { summaryTemplate } from "../../assets/templates/index/summary_template.js";
bindInlineFunctions(getContext(), [
    '/Join/index/index/index.js',
    '/Join/js/utilities.js',
    '/Join/js/language.js'
])

let newBoardCollaborators;
export async function initSummary() {
    if(!STORAGE.currentUser.boards.length) return
    
    const boardId = SESSION_getData('activeBoard') || STORAGE.currentUser.boards[0];
    renderBoard(boardId);
    renderBoardTitleSelection();
    $('#summary-content').classList.remove('d-none')
}

export function renderBoardEditButton(boardId) {
    $('#summary-data').innerHTML += /*html*/ `
        <button class="circle grid-center edit-btn" onclick="initEditBoard(${boardId})">
            <img src="/Join/assets/img/icons/edit.svg" alt="">
        </button>
    `;
}

export function boardSelectionTemplate({name, id}) {
    return /*html*/`
        <button class="row" type="option" data-id="${id}" onclick="renderBoard()">
            <span>${name.replaceAll('-',' ')}</span>
        </button>`;
}

export function getTaskStats(tasksObj) {
    const tasks = Object.values(tasksObj);
    const now = new Date();
    
    

    return {
        tasksInBoard: tasks.length,
        tasksInProgress: tasks.filter(({type}) => type == "in-progress").length,
        tasksAwaitingFeedback: tasks.filter(({type}) => type == "awaiting-feedback").length,
        tasksToDo: tasks.filter(({type}) => type == "to-do").length,
        tasksDone: tasks.filter(({type}) => type == "done").length,
        tasksUrgent: tasks.filter(({priority}) => priority == "urgent").length,
        upcomingDeadline: (tasks.length) ? tasks
            .map(({dueDate}) => {
                const [day, month, year] = dueDate.split('/');
                return new Date(year, Number(month) - 1, day);
            })
            .filter(date => date > now)
            .sort()
            .at(0)
            ?.toLocaleDateString(currentLang(), {year: 'numeric', month: 'long', day: 'numeric'}) || undefined : undefined
    }
}

export function setBoardButtons({tasksInBoard, tasksInProgress, tasksAwaitingFeedback, tasksUrgent, upcomingDeadline, tasksToDo, tasksDone}) {
    const boardButtons = $$('#summary-data button:not(.edit-btn)');
    
    boardButtons[0].$('h1').innerText = tasksInBoard;
    boardButtons[1].$('h1').innerText = tasksInProgress;
    boardButtons[2].$('h1').innerText = tasksAwaitingFeedback;
    boardButtons[3].$('.urgent-tasks h1').innerText = tasksUrgent;
    if (upcomingDeadline) boardButtons[3].$('.upcoming-deadline span:first-of-type').innerText = upcomingDeadline;
    boardButtons[3].$$(':is(.line, .upcoming-deadline)').for(container => container.classList.toggle('d-none', !upcomingDeadline));
    boardButtons[4].$('h1').innerText = tasksToDo;
    boardButtons[5].$('h1').innerText = tasksDone;
    boardButtons.forEach(button => button.onclick = () => {
        $('nav #board').click()
    });
}


export function renderBoard(boardId) {
    const { id, name, tasks: tasksObj, owner } = STORAGE.currentUserBoards[boardId];
    
    const taskStats = getTaskStats(tasksObj)  ;  
    SESSION_setData('activeBoard', Number(id));
    $('#summary-content').innerHTML = summaryTemplate(taskStats)
    if (owner == STORAGE.currentUser.id) renderBoardEditButton(id);
    else $('#board-title .circle')?.remove();

    // setBoardButtons(taskStats);

    const summaryHeader = $('.summary-header h2');
    delete summaryHeader.dataset.lang;
    summaryHeader.innerText = name;
}

export function renderBoardTitleSelection() {
  const activeBoardId = SESSION_getData("activeBoard");
  $("#board-title-selection .options").innerHTML = Object.values(STORAGE.currentUserBoards).reduce(
    (template, board) => `${template}${ activeBoardId != board.id ? boardTitleSelectionTemplate(board) : "" }`, ``
  );
}

export async function createBoardModal() {
    await $('#add-board .add-board-data').includeTemplate({url: '/Join/assets/templates/index/add-board.html', replace: false});
    newBoardCollaborators = [];
    $('#add-board').openModal();
}

export function addBoardCategory() {
    const title = $('#add-board-categories input').value;
    const color = $('.category-color.active').style.getPropertyValue('--clr');
    const titleValidity = title.length > 20;
    throwErrors({identifier: "name-too-long", bool: titleValidity});
    if (titleValidity) return;
    $('.categories-container').innerHTML += addBoardCategoryTemplate([title, color]);
    $('#add-board-categories input').value = '';
}

export function addBoardCategoryTemplate([title, color]) {
    return /*html*/`
        <div class="task-category" style="--clr: ${color};">
            <span>${title}</span>
            <button onclick="removeBoardCategory()">
                <img src="/Join/assets/img/icons/close_white.svg" alt="">
            </button>
        </div>
    `
}

export function removeBoardCategory() {
    event.currentTarget.parentElement.remove();
}

export function clearCategoryInput() {
    event.currentTarget.parentElement.previousElementSibling.value = ''
    const title = $('#add-board-categories input').value;
    const titleValidity = title.length > 10;
    throwErrors({identifier: "name-too-long", bool: titleValidity});
}

export function isValidTitle(titleInput) {
    return /^[a-zA-Z0-9_-]+$/.test(titleInput);
}

export function getCollaborators() {
    return [...$$('.collaborator')].reduce((total, collaborator) => {
        total.push(collaborator.dataset.id);
        return total;
    }, [])
}

export const getTaskCategories = () => [...$$('.task-category')].reduce((total, category) => {
    const color = category.style.getPropertyValue('--clr');
    const name = category.$('span').innerText;
    total[name] = color;
    return total;
}, {});

export async function createNewBoard() {
    const boardName = $('#add-board-title input').value.replaceAll(' ', '-');
    const titleIsValid = isValidTitle(boardName);
    if (!titleIsValid) return throwErrors({identifier: 'title', bool: titleIsValid});

    const collaborators = getCollaborators();
    const categories = getTaskCategories();
    
    const boardData = { name: boardName, categories, collaborators: [USER.id] };
    const newBoard = await USER.addBoard(boardData);
    return log(newBoard)
    $('#add-board').closeModal();
    SESSION_setData('activeBoard', newBoard.id);
    await Promise.all([createBoardNotification(newBoard, collaborators), notification('board-added')]);
    location.reload();    
};

export function createBoardNotification({name, id}, collaborators) {
    if (!collaborators.length) return;
    const notification = new Notify({
        recipients: collaborators,
        type: "boardInvite",
        ownerName: USER.name,
        boardName: name,
        boardId: id
    });
    return notification.send();
};

export function toggleDrp() {
    event.currentTarget.toggleDropDown();
    const drp = $(':is(.add-board-data, .edit-board-data) #drp-collaborators');
    const filteredContacts = !!(event.currentTarget.closest('.edit-board-data')) ? Object.values(CONTACTS).filter(({id}) => !(SELECTED_BOARD.collaborators.includes(id))) : Object.values(CONTACTS);
    const sortedContacts = filteredContacts.sort((a, b) => (a.name > b.name) ? 1 : -1);
    drp.innerHTML = ''
    drp.renderItems(sortedContacts, contactDropdownTemplate);
};

export const filterDrp = debounce(() => {
    
    const drp = $('.add-board-data .drp');
    const filter = $('#add-board-collaborators input').value;
    const sortedContacts = Object.values(CONTACTS).sort((a, b) => (a.name > b.name) ? 1 : -1);
    const filteredContacts = sortedContacts.filter(
        ({name}) => name.toLowerCase().includes(filter.toLowerCase())
    );
    drp.innerHTML = ''
    drp.renderItems(filteredContacts, contactDropdownTemplate);
});

export function contactDropdownTemplate({name, color, id, img}) {
    return /*html*/`
        <div class="contact row gap-15 drp-option ${newBoardCollaborators.includes(id) ? 'active' : ''}" onclick="addCollaborator(${id})">
            <div class="user-img-container" style="--user-clr: ${color};">
                <span>${name.slice(0, 2).toUpperCase()}</span>
                <img src="${img}">
            </div>
            <div>${name}</div>
        </div>
    `
}

export function addCollaborator(id) {
    event.currentTarget.classList.toggle('active');
    if (newBoardCollaborators.includes(`${id}`)) newBoardCollaborators.remove(`${id}`); 
    else newBoardCollaborators.push(`${id}`);
    const collabContainer = $('.collaborators-container');
    collabContainer.innerHTML = '';
    collabContainer.renderItems(Object.values(CONTACTS).filter(contact => newBoardCollaborators.includes(contact.id)), newBoardCollaboratorTemplate);
}

export function newBoardCollaboratorTemplate({img, name, color, id}) {
    return /*html*/`
    <button class="collaborator ${!SELECTED_BOARD.collaborators.includes(id) ? 'invitation' : ''}" data-id="${id}">
        <div class="user-img-container" style="--user-clr: ${color}">
            <span>${name.slice(0, 2).toUpperCase()}</span>
            <img src="${img}" alt="">
        </div>
    </button>
`
}

export function renderEditBoard() {
    const {name, collaborators, categories} = SELECTED_BOARD;
    const editBoardContainer = $('.edit-board-data');
    editBoardContainer.$(':scope > h3').innerText = name;
    editBoardContainer.$('.categories-container').renderItems(Object.entries(categories), addBoardCategoryTemplate);

    newBoardCollaborators = [...collaborators];
    editBoardContainer.$('.collaborators-container').renderItems(Object.values(CONTACTS).filter(contact => collaborators.includes(contact.id)), newBoardCollaboratorTemplate);
}

export async function saveEditedBoard() {
    const collaborators = getCollaborators();
    const categories = getTaskCategories();
    
    const notifyPromise = createBoardNotification(SELECTED_BOARD, collaborators.filter(collabId => !SELECTED_BOARD.collaborators.includes(collabId)));
    const categoryPromise = updateBoardCategories(categories);
    await Promise.all([notifyPromise, categoryPromise]);
    await notification(`board-updated, {boardName: '${SELECTED_BOARD.name}'}`);
    $('#edit-board').closeModal();
    location.reload();
}

export function updateBoardCategories(categories) {
    if (_.isEqual(categories, SELECTED_BOARD.categories)) return;
    SELECTED_BOARD.categories = {};
    Object.entries(categories).for(([name, color]) => SELECTED_BOARD.categories[name] = color);
    return SELECTED_BOARD.update();
}

export async function initEditBoard() {
    event.stopPropagation();
    newBoardCollaborators = [];
    const editBoardModal = $('#edit-board');
    await editBoardModal.$('.edit-board-data').includeTemplate({url: '/Join/assets/templates/index/edit-board.html', replace: false});
    await getContacts();
    renderEditBoard();
    editBoardModal.openModal();
}

export const deleteBoard = () => confirmation(`delete-board, {boardName: '${SELECTED_BOARD.name}'}`, async () => {
    SELECTED_BOARD.collaborators.forAwait(async collaboratorId => {
        await REMOTE_removeData(`users/${collaboratorId}/boards/${SELECTED_BOARD.id}`);
    });
    SESSION_removeData('activeBoard');
    await SELECTED_BOARD.delete();
    SELECTED_BOARD = Object.values(BOARDS)[0] || undefined;
    await notification('board-deleted');
    $('#edit-board').closeModal();
    location.reload();
})

export function toggleBoardSelection() {
    console.log(this)
    $('#summary-selection').classList.toggle('active');
}