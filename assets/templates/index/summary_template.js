export function summaryTemplate({
  tasksInBoard,
  tasksInProgress,
  tasksAwaitingFeedback,
  tasksUrgent,
  upcomingDeadline,
  tasksToDo,
  tasksDone
}) {
  return /*html*/ `
        <div id="summary-data" class="column gap-30">
            <div class="row gap-30">
                <button class="summary-btn" onclick="document.querySelector('nav #board').click()">
                    <h1>${tasksInBoard}</h1>
                    <span data-lang="tasks-in-board">Tasks in Board</span>
                </button>
                <button class="summary-btn" onclick="document.querySelector('nav #board').click()">
                    <h1>${tasksInProgress}</h1>
                    <span data-lang="tasks-in-progress">Tasks in Progress</span>
                </button>
                <button class="summary-btn" onclick="document.querySelector('nav #board').click()">
                    <h1>${tasksAwaitingFeedback}</h1>
                    <span data-lang="tasks-awaiting-feedback">Awaiting Feedback</span>
                </button>
            </div>
            <div class="row gap-30">
                <button class="summary-btn" onclick="document.querySelector('nav #board').click()">
                    <div class="urgent-tasks flex-center gap-20">
                        <div class="circle grid-center">
                            <img src="/Join/assets/img/icons/prio_urgent.svg" alt="">
                        </div>
                        <div class="column flex-center">
                            <h1>${tasksUrgent}</h1>
                            <span data-lang="urgent">Urgent</span>
                        </div>
                    </div>
                    <div class="line"></div>
                    <div class="upcoming-deadline column flex-center gap-15${
                      upcomingDeadline ? "" : " d-none"
                    }">
                        <span class="txt-normal txt-700">${upcomingDeadline}</span>
                        <span class="txt-small" data-lang="tasks-deadline">Upcoming Deadline</span>
                    </div>
                </button>
            </div>
            <div class="row gap-30">
                <button class="summary-btn flex-center gap-20" onclick="document.querySelector('nav #board').click()">
                    <div class="circle grid-center" style="--diameter: 70px;background-color:var(--clr-dark);">
                        <img src="/Join/assets/img/icons/edit_dark.svg" alt="">
                    </div>
                    <div class="column flex-center">
                        <h1>${tasksToDo}</h1>
                        <span data-lang="to-do">To-do</span>
                    </div>
                </button>
                <button class="summary-btn flex-center gap-20" onclick="document.querySelector('nav #board').click()">
                    <div class="circle grid-center" style="--diameter: 70px;background-color:var(--clr-dark);">
                        <img src="/Join/assets/img/icons/check_dark.svg" alt="">
                    </div>
                    <div class="column flex-center">
                        <h1>${tasksDone}</h1>
                        <span data-lang="tasks-done">Done</span>
                    </div>
                </button>
            </div>
        </div>
`;
}
