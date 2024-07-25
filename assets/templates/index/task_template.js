import { STORAGE } from "../../../js/storage.js";
import { getInitialsOfName } from "../../../js/utilities.js";

export function taskTemplate({ id, boardId, category, title, description, subTasks, priority }, assignedAccounts, categoryString, filter) {
    return /*html*/ `
        <div class="task txt-small" onpointerdown="addDragAndDrop()" data-id="${boardId}/${id}">
            <div class="task-category" style="--clr: ${STORAGE.currentUserBoards[boardId].categories[category] ?? "#d1d1d1"};"${
            !categoryString ? 'data-lang="default"' : ""
        }>${categoryString ? categoryString : ""}</div>
            <div class="task-title txt-700">${highlight(title, filter)}</div>
            <div class="task-description">${highlight(description, filter)}</div>
            ${progressTemplate(subTasks)}
            <div class="task-footer">
                <div class="task-assigned-to">
                    ${assignedToTemplate(assignedAccounts)}
                </div>
                <div class="task-priority" data-priority="${priority}" style="--priority: url(/Join/assets/img/icons/prio_${priority}.svg)"></div>
            </div>
        </div>
    `;
}

export const highlight = (string, filter) => {
	return string.replaceAll(
		new RegExp(`${filter}`, "ig"),
		(item) => `<span class="highlight">${item}</span>`
	);
};

export const progressTemplate = (subTasks) => {
	const finishedSubtasks = subTasks.filter(({ done }) => done);
	const progress =
		finishedSubtasks == false ? 0 : Math.roundTo(finishedSubtasks.length / subTasks.length, 2);
	return !subTasks.length
		? ""
		: /*html*/ `
    <div class="column gap-5 txt-tiny">
        <span data-lang="subtasks" style="margin-left: auto;"></span>
        <div class="task-progress">
            <div class="task-progress-bar" style="--progress: ${progress}"></div>
            <div class="task-progress-counter">
                <span>${finishedSubtasks.length} / ${subTasks.length}
                </span>
            </div>
        </div>
    </div>`;
};

export const assignedToTemplate = (assignedAccounts) => {
    return assignedAccounts.reduce((_template, { color, name }, index) => {
        return /*html*/ `${_template}
            <div class="task-assigned-to">
                ${ (index < 3)
                    ? `<div style="--user-clr: ${color !== "" ? color : "#D1D1D1"};">${ getInitialsOfName(name) }</div>`
                    : `<div style="--user-clr: var(--clr-dark);">+${ assignedAccounts.length - 2 }</div>`
                }
            </div>`
    }, ``);
};

export function addBoardCategoryTemplate([title, color]) {
	return /*html*/ `
        <div class="task-category" style="--clr: ${color};">
            <span>${title}</span>
            <button onclick="removeBoardCategory()">
                <img src="/Join/assets/img/icons/close_white.svg" alt="">
            </button>
        </div>
    `;
}
