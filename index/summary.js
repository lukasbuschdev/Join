const initSummary = async () => {
    renderBoards();
}

const renderBoards = async () => {
    const activeBoardIndex = SESSION_getData('activeBoardIndex') ?? 0;
    $('#summary-data .content').classList.remove('d-none');

    $('.summary-selection-boards').innerHTML = '';
    $('.summary-selection-boards').renderItems(Object.values(BOARDS), summarySelectionTemplate);

    setTimeout(()=>$$('.summary-selection-boards button')[activeBoardIndex].click(), 0);
}

const summarySelectionTemplate = (board) => {
    const {name, id} = board;
    return /*html*/`
    <button class="" name="${name}" type="option" onclick="selectBoardSummary('${id}')">${name.replaceAll('-',' ')}</button>
    `
}

const loadBoardSummary = (boardId) => {
    const board = BOARDS[boardId];
    const {tasks} = board;
    const tasksInBoard = Object.values(tasks).length;
    const tasksInProgress = Object.values(tasks).filter(({type}) => type == "in-progress").length;
    const tasksAwaitingFeeback = Object.values(tasks).filter(({type}) => type == "awaiting-feedback").length;
    const tasksToDo = Object.values(tasks).filter(({type}) => type == "to-do").length;
    const tasksDone = Object.values(tasks).filter(({type}) => type == "done").length;

    $('#tasks-in-board h1').innerText = tasksInBoard;
    $('#tasks-in-progress h1').innerText = tasksInProgress;
    $('#tasks-awaiting-feedback h1').innerText = tasksAwaitingFeeback;
    $('#tasks-to-do h1').innerText = tasksToDo;
    $('#tasks-done h1').innerText = tasksDone;
}

const incrementBoard = (direction) => {
    if (direction == 1 && $('.summary-selection-boards button.centered').nextElementSibling == null) return
    else if (direction == -1 && $('.summary-selection-boards button.centered').previousElementSibling == null) return
    scrollSummarySelection(direction);
}

const scrollSummarySelection = (direction) => {
    const centeredBtn = $('.summary-selection-boards button.centered');
    if (direction == 1) {
        centeredBtn.nextElementSibling.classList.add('centered');
        centeredBtn.classList.remove('centered');
    } else if (direction == -1) {
        centeredBtn.previousElementSibling.classList.add('centered');
        centeredBtn.classList.remove('centered');
    }

    $('.summary-selection-boards button.centered').style.scrollSnapAlign = 'unset';
    $('.summary-selection-boards').scrollBy(175 * direction, 0)
    setTimeout(() => {
        $('.summary-selection-boards button.centered').style.scrollSnapAlign = '';
    }, 200);

    setArrowVisibility([...centeredBtn.parentElement.$$('button')].indexOf(centeredBtn), $$('.summary-selection-boards button').length);
}

const scrollSummaryContent = (direction) => {
    const content = $('.summary-content');
    content.classList.remove('scroll-snap');
    const startingX = content.scrollLeft;
    const deltaP = (direction > 0) ? 0 : content.scrollWidth - content.offsetWidth;
    content.style.scrollBehavior = "auto";
    content.scrollLeft = deltaP;

    content.style.scrollBehavior = "smooth";
    content.scrollLeft = startingX;
    setTimeout(()=>{
        content.classList.add('scroll-snap');
    }, 500)
}

const selectBoardSummary = (id) => {
    const button = event.currentTarget;
    let buttonIndex;
    let centeredBtnIndex;
    let activeBtnIndex;

    if (!(button.parentElement.$('button.centered'))) button.classList.toggle('centered');
    const buttons = button.parentElement.$$('button');
    buttons.for((btn, i) => {
        if (btn == button) buttonIndex = i;
        if (btn.classList.contains('centered')) centeredBtnIndex = i;
        if (btn.classList.contains('active')) activeBtnIndex = i;
    });

    if (buttonIndex == activeBtnIndex) return;
    SESSION_setData('activeBoardIndex', buttonIndex);
    
    let direction;
    if (buttonIndex > activeBtnIndex) direction = 1;
    else if (buttonIndex < activeBtnIndex) direction = -1;

    if (direction !== undefined) {
        if (!(buttonIndex == centeredBtnIndex)) {
            scrollSummarySelection(direction)
        }
        scrollSummaryContent(direction);
    }
    loadBoardSummary(id);
}

const setArrowVisibility = (buttonIndex, boardsLength) => {
    log(buttonIndex, boardsLength)
    const [leftArrow, rightArrow] = $$('.summary-selection-arrows');
    // const [leftGrid, rightGrid] = $$('.summary-grid:not(#summary-data)');

    [leftArrow, rightArrow].for(container => container.show());

    if (buttonIndex == 0) {
        leftArrow.hide()
    } else if (buttonIndex == boardsLength - 1) {
        rightArrow.hide();
    }
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
    
    // const 
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
    
    // const boardData = {
        //     name: boardName,
        //     categories
        // };
        // const user = await getCurrentUser(true);
        // const newBoard = await user.addBoard(boardData);

        $$('.collaborator-invitation').for(
            invite => {
                const id = invite.dataset.id;
                const notification = new Notify({
                    recipient: id,
                    boardInvite: {
                        ownerName: USER.name,
                        boardName: boardName,
                        boardId: '1234567'
                    }
                });
                notification.send();
            }
        )
}

const toggleDrp = () => {
    const drp = $('.add-board-data .drp');
    const sortedContacts = Object.values(CONTACTS).sort((a, b) => (a.name > b.name) ? 1 : -1);
    drp.innerHTML = ''
    drp.renderItems(sortedContacts, contactDropdownTemplate);
    
}

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