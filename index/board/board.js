import { bindInlineFunctions, getContext } from "../../js/setup.js";
bindInlineFunctions(getContext(), [
    '/Join/js/dragAndDrop.js',
    '/Join/index/index/index.js',
    '/Join/assets/templates/index/confirmation_template.js',
    '/Join/js/utilities.js',
    '/Join/index/add_task/add_task.js',
    '/Join/js/storage.js',
    '/Join/js/language.js',
    '/Join/index/summary/summary.js'
])
import { getBoards, REMOTE_removeData, SESSION_getData } from "../../js/storage.js";
import { $, confirmation, debounce, notification, currentUserId, isEqual  } from "../../js/utilities.js";
import { renderBoardTitleSelection } from "../summary/summary.js";
import "../../js/prototype_extensions.js";
import { Task } from "../../js/task.class.js";
import { assignedToTemplate, progressTemplate, taskTemplate } from "../../assets/templates/index/task_template.js";
import { fullscreenTaskTemplate } from "../../assets/templates/index/fullscreen-task_template.js";
import { editTaskTemplate } from "../../assets/templates/index/edit-task_template.js";
import { renderBoardIds, renderDate } from "../add_task/add_task.js";


let initialTask;

export const initBoard = async () => {
    if (Object.values(BOARDS).length === 0) return
    renderBoardTitleSelection();
    renderTasks();
    $('#tasks').classList.remove('d-none');
}

// export function renderBoardTitleSelection() {
//     const activeBoardId = SESSION_getData('activeBoard');
//     $('#board-title-selection .options').innerHTML = Object.values(BOARDS).reduce((template, board) => {
//         return `${template}${(activeBoardId != board.id) ? boardTitleSelectionTemplate(board) : ''}`
//     }, ``);
// }

// export function boardTitleSelectionTemplate({id, name}) {
//     return/*html*/`
//         <h4 class="option" onclick="switchBoards(${id})">${name}</h4>
//     `
// }

// export function switchBoards(id) {
//     SESSION_setData('activeBoard', Number(id));
//     location.reload();
// }

export const renderTasks = async (filter) => {
    let boardId = SESSION_getData('activeBoard');
    if (!(boardId in BOARDS)) boardId = Object.keys(BOARDS)[0];
    const {tasks, name} = BOARDS[boardId];

    const boardHeader = $('#board-header h2');
    delete boardHeader.dataset.lang;
    boardHeader.innerText = name;

    if (!Object.values(tasks).length) return;
    const tasksContainer = $('#tasks');
    
    tasksContainer.$$(':scope > div > div:last-child').for(container => container.innerHTML = "");
    const filteredTasks = (filter)
    ? Object.values(tasks).filter(task => task.title.toLowerCase().includes(filter.toLowerCase()) || task.description.toLowerCase().includes(filter.toLowerCase()))
    : Object.values(tasks);
    filteredTasks.toReversed().for(task => $(`#${task.type}`).innerHTML += taskTemplate(task, filter));
    await tasksContainer.LANG_load();
}

export const searchTasks = debounce(() => {
    const searchInput = $('#search-task input').value;
    renderTasks(searchInput);
}, 200);

export const focusInput = () => {
    $('#search-task input').focus();
}

export const clearTaskSearch = () => {
    $('#search-task input').value = "";
    renderTasks();
}

export const addTaskModal = async () => {
    renderBoardIds();
    renderDate();
    const modal = $('#add-task-modal');
    modal.$('.add-task-card').classList.remove('d-none');
    modal.openModal();
}

// export function toggleBoardTitleSelection() {
//     const el = event.currentTarget
//     el.classList.toggle('active');
//     if (el.classList.contains('active')) {
//         window.addEventListener('pointerdown', closeHandler = () => {
//             if (event.target.closest('#board-title-selection')) return;
//             el.classList.remove('active');
//             window.removeEventListener('pointerdown', closeHandler);
//         })
//     }
// }

export const renderFullscreenTask = (ids) => {
    if (event.which !== 1) return;
    const modal = $('#fullscreen-task-modal');
    const [boardId, taskId] = ids.split('/');
    const taskData = BOARDS[boardId].tasks[taskId];
    SELECTED_TASK = new Task(taskData);
    initialTask = _.cloneDeep(SELECTED_TASK);
    modal.$('#fullscreen-task').innerHTML = fullscreenTaskTemplate(taskData);
    modal.LANG_load();
    modal.openModal();
    modal.addEventListener('close', saveTaskChanges, {once: true});
};

export const saveEditedTask = () => {
    const editedTaskData = {
        title: $('#fullscreen-task-modal #title').value,
        description: $('#fullscreen-task-modal #description').value,
        dueDate: $('#fullscreen-task-modal #date').value,
        priority: $('#fullscreen-task-modal .prio-btn.active span').dataset.lang,
        assignedTo: [...$$('#edit-task .drp-contacts > div.active')].map(contact => contact.dataset.id),
        subTasks: [...$$('#edit-task #subtask-container li')].map(({innerText: name}) => {
            return {
                name,
                done: SELECTED_TASK.subTasks.find(({name: subTaskName}) => subTaskName === name)?.done || false
            }
        })
    }
    Object.assign(SELECTED_TASK, editedTaskData);
    $('#fullscreen-task-modal').closeModal();
    toggleFullscreenState();
}

export const saveTaskChanges = () => {
    const updatedTask = SELECTED_TASK;

    const differences = getJsonChanges(updatedTask, initialTask);
    if (Object.values(differences).length > 0) {
        updateTaskUi(differences, initialTask);
        SELECTED_TASK.update();
    }
};

export const deleteTask = () => confirmation(`delete-task, {taskName: '${SELECTED_TASK.title}'}`, async () => {
    const {boardId, id, name} = SELECTED_TASK;
    const modal = $('#fullscreen-task-modal');
    const taskElement = $(`.task[data-id="${boardId}/${id}"]`);
    const taskContainer = taskElement.parentElement;
    await REMOTE_removeData(`boards/${boardId}/tasks/${id}`);
    modal.removeEventListener('close', saveTaskChanges, {once: true});
    modal.closeModal();
    taskElement.remove();
    taskContainer.innerHTML = taskContainer.innerHTML.trim();
    notification(`task-deleted, {taskName: '${name}'}`);
})

export const getJsonChanges = (newJson, oldJson) => {
    let differences = {};
    for (const key in newJson) {
        if (typeof newJson[key] == "function") continue;
        if (typeof newJson[key] == "object") {
            if (isEqual(newJson[key], oldJson[key]) == false) differences[key] = newJson[key];
        }
        else if (newJson[key] !== oldJson[key]) differences[key] = newJson[key];
    };
    return differences;
};

export const changeSubtaskDoneState = async (subTaskName) => {
    const subTaskCheckBox = event.currentTarget;
    const isChecked = (subTaskCheckBox.checked);

    let subTaskIndex;
    for(let i = 0; i < SELECTED_TASK.subTasks.length; i++) {
        if (SELECTED_TASK.subTasks[i].name === subTaskName) {
            subTaskIndex = i;
            break;
        };
    };
    SELECTED_TASK.subTasks[subTaskIndex].done = isChecked;
};

export const updateTaskUi = ({title = null, description = null, priority = null, assignedTo = null, subTasks = null}, initialTask) => {
    const taskContainer = $(`[data-id="${SELECTED_TASK.boardId}/${SELECTED_TASK.id}"]`);
    
    if (title) taskContainer.$('.task-title').textAnimation(title);
    if (description) taskContainer.$('.task-description').textAnimation(description);
    if (priority) taskContainer.$('.task-priority').style.setProperty('--priority', `url(../assets/img/icons/prio_${priority}.svg)`);
    if (assignedTo) taskContainer.$('.task-assigned-to').innerHTML = assignedToTemplate(assignedTo.map(id => STORAGE.users[id]));
    if (subTasks) {
        if (!SELECTED_TASK.subTasks.length) return taskContainer.$('.task-description').nextElementSibling.remove();
        if (!initialTask.subTasks.length) {
            taskContainer.$('.task-description').insertAdjacentHTML('afterend', progressTemplate(SELECTED_TASK.subTasks));
        }
        const currentSubtaskCount = SELECTED_TASK.subTasks.filter(({done}) => done == true).length;
        const totalSubtaskCount = SELECTED_TASK.subTasks.length;
        taskContainer.$('.task-progress-counter span').innerText = `${currentSubtaskCount} / ${totalSubtaskCount}`;
        taskContainer.$('.task-progress-bar').style.setProperty('--progress', `${currentSubtaskCount/totalSubtaskCount}`);
    }
};

export const editTaskInitializer = async () => {
    const editTaskContainer = $('#edit-task');
    editTaskContainer.innerHTML = editTaskTemplate(SELECTED_TASK);
    await editTaskContainer.LANG_load();
    await renderAssignedContacts();
    editTaskContainer.initMenus();
    
    toggleFullscreenState();
};

export const renderAssignedContacts = async () => {
    renderAssignToContacts();
    await $(`.drp-contacts [data-id="${currentUserId()}"]`)?.LANG_load();
    $('.drp-contacts').$$('.drp-option').for(
        contact => contact.classList.toggle('active', SELECTED_TASK.assignedTo.includes(contact.dataset.id))
    );
};

export const toggleFullscreenState = () => {
    const fullscreenModal = $('#fullscreen-task-modal');
    fullscreenModal.$$('#fullscreen-task, #edit-task').for(section => {
        section.initMenus();
        section.classList.toggle('d-none');
        if (section.id == "edit-task" && section.classList.contains('d-none')) section.innerHTML = '';
    });
    fullscreenModal.setAttribute('static', (fullscreenModal.getAttribute('static') == "true") ? "false" : "true");
};

export async function changeTaskType (taskId, newType) {
    SELECTED_BOARD.tasks[taskId].type = newType;
    await SELECTED_BOARD.update();
    return getBoards();
}