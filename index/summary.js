const initSummary = async () => {
    const { boards } = await getCurrentUserData();
    const activeBoardIndex = Math.max(SESSION_getData('activeBoardIndex'), 0)
    log(SESSION_getData('activeBoardIndex'))
    $('.summary-selection-boards').renderItems(boards, summarySelectionTemplate);

    setTimeout(()=>$$('.summary-selection-boards button')[activeBoardIndex].click(), 0)
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
    if (direction == 1 && $('.summary-selection-boards button.active').nextElementSibling == null) return
    else if (direction == -1 && $('.summary-selection-boards button.active').previousElementSibling == null) return
    scrollSummarySelection(direction);
}

const scrollSummarySelection = (direction) => {
    const activeBtn = $('.summary-selection-boards button.active');
    if (direction == 1) {
        activeBtn.nextElementSibling.classList.add('active');
        activeBtn.classList.remove('active');
    } else {
        activeBtn.previousElementSibling.classList.add('active');
        activeBtn.classList.remove('active');
    }

    $('.summary-selection-boards button.active').style.scrollSnapAlign = 'unset';
    $('.summary-selection-boards').scrollBy(175 * direction, 0)
    setTimeout(() => {
        $('.summary-selection-boards button.active').style.scrollSnapAlign = '';
    }, 200);

    checkArrows(activeBtn);
}

const checkArrows = (activeBtn) => {
    const [left, right] = $$('.summary-selection-arrows');
    left.classList.toggle('d-none', $('.summary-selection-boards button:nth-of-type(2)' == activeBtn))
    right.classList.toggle('d-none', $('.summary-selection-boards button:nth-last-of-type(2)' == activeBtn))
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
    let activeButtonIndex;

    button.parentElement.$$('button').for((btn, i) => {
        if (btn == button) {
            buttonIndex = i;
        } else if (btn.classList.contains('active')) {
            activeButtonIndex = i;
        }
    });
    SESSION_setData('activeBoardIndex', activeButtonIndex)
    
    const direction = (buttonIndex > activeButtonIndex) ? 1 : -1;
    scrollSummaryContent(direction);
    loadBoardSummary(button.name);
}