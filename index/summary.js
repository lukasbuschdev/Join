const initSummary = () => {
    renderBoards();
}

const renderBoards = async () => {
    const { boards } = await getCurrentUserData();
    if (boards == false) return;

    const activeBoardIndex = SESSION_getData('activeBoardIndex') ?? 0;
    $('#summary-data .content').classList.remove('d-none');
    $('#summary-data #add-board').classList.add('d-none');

    $('.summary-selection-boards').innerHTML = '';
    $('.summary-selection-boards').renderItems(boards, summarySelectionTemplate);

    setTimeout(()=>$$('.summary-selection-boards button')[activeBoardIndex].click(), 0);
}

const summarySelectionTemplate = (board) => {
    return /*html*/`
    <button class="" name="${board}" type="option" onclick="selectBoardSummary()">${board.replaceAll('-',' ')}</button>
    `
}

const loadBoardSummary = async (boardId) => {
    const tasks = await REMOTE_getData(`boards/${boardId}/tasks`);

    const tasksInBoard = Object.values(tasks).join(',').replaceAll(',,', ',').split(',').length;
    const tasksInProgress = tasks["in-progress"].length;
    const tasksAwaitingFeeback = tasks["awaiting-feedback"].length;
    const tasksToDo = tasks["to-do"].length;
    const tasksDone = tasks["done"].length;

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

const selectBoardSummary = () => {
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
    loadBoardSummary(button.name);
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