import { STATE } from "./state.js";
import { STORAGE } from "./storage.js";
import { Task } from "./task.class.js";
import { throttle } from "./utilities.js";

let TASK_ELEMENT
let taskWidth
let offset = { x: 0, y: 0 }
let scrollInterval

export const scrollFrequency = 20
export const throttleDelay = 10

// SETUP

export function addDragAndDrop() {
    TASK_ELEMENT = event.currentTarget
    const taskBBox = TASK_ELEMENT.getBoundingClientRect()
    offset.x = event.pageX - taskBBox.x
    offset.y = event.pageY - taskBBox.y

    TASK_ELEMENT.style.maxWidth = `${taskBBox.width}px`
    
    TASK_ELEMENT.addEventListener('pointerup', fullscreenFunctionality, { once: true })
    TASK_ELEMENT.addEventListener('pointermove', dragFunctionality, { once: true })
}

// FULLSCREEN FUNC

export function fullscreenFunctionality() {
    TASK_ELEMENT.removeEventListener('pointermove', dragFunctionality)
    fullscreenHandler()
}

export function fullscreenHandler() {
    const [boardId, taskId] = TASK_ELEMENT.dataset.id.split('/');
    console.log(STATE.selectedBoard.tasks[taskId], taskId)
    STATE.selectedTask = new Task(STATE.selectedBoard.tasks[taskId]);
    renderFullscreenTask(STATE.selectedTask);
}

// DRAG FUNC

export function dragFunctionality() {
        // remove fullscreenListener
        TASK_ELEMENT.removeEventListener('pointerup', fullscreenFunctionality, { once: true })

        // add moveListener
        window.addEventListener('pointermove', dragHandler)
        startScroll()

        const placeholderElement = '<div class="element-placeholder"></div>'
        TASK_ELEMENT.insertAdjacentHTML('beforebegin', placeholderElement)

        window.addEventListener('pointerup', () => {
            // remove moveListener
            stopScroll()
            window.removeEventListener('pointermove', dragHandler)
            dropHandler()
        }, { once: true })
        TASK_ELEMENT.classList.add('active')
}

export const dragHandler = throttle(() => {
    checkDropContainers()
    const {pageX, pageY} = event
    const x = Math.round(pageX - offset.x)
    const y = Math.round(pageY - offset.y)
    moveTask(x, y)
}, throttleDelay)

export function moveTask(x, y) {
    TASK_ELEMENT.style.top = `${y}px`
    TASK_ELEMENT.style.left = `${x}px`
}

// SCROLL FUNC

export function scrollFunctionality() {
    const taskContainer = $('#tasks')
    if (checkScrollSoft(taskContainer) === false) return
    const scrollDireciton = checkScrollHard(taskContainer)
    if (scrollDireciton) customScroll(scrollDireciton)
}

export function checkScrollSoft(taskContainer) {
    const canScroll = taskContainer.scrollHeight > taskContainer.clientHeight
    return canScroll
}

export function checkScrollHard(taskContainer) {
    const taskBBox = TASK_ELEMENT.getBoundingClientRect()
    const taskContainerBBox = taskContainer.getBoundingClientRect()
    const yOffset = 50

    const canScrollDown = taskContainer.scrollTop < (taskContainer.scrollHeight - taskContainer.clientHeight -1 )
    const canScrollUp = taskContainer.scrollTop > 0
    const shouldScrollDown = taskBBox.bottom > taskContainerBBox.bottom + yOffset
    const shouldScrollUp = taskBBox.y < taskContainerBBox.y - yOffset

    if (canScrollDown && shouldScrollDown) return 1
    if (canScrollUp && shouldScrollUp) return -1
    return 0
}

export function customScroll(direction) {
    const taskContainer = $('#tasks')
    taskContainer.scrollBy(0, 3 * direction)
}

export function startScroll() {
    scrollInterval = setInterval(scrollFunctionality, scrollFrequency)
}

export function stopScroll() {
    clearInterval(scrollInterval)
}

// DROP FUNC

export async function dropHandler() {
    TASK_ELEMENT.classList.remove('active')
    TASK_ELEMENT.style.maxWidth = ''

    const targetContainer = checkDropContainers()
    $('.element-placeholder')?.remove()
    if (!targetContainer) return taskDropAnimation()

    const el = targetContainer.$('.task-container')
    const [boardId, taskId] = TASK_ELEMENT.dataset.id.split('/');
    
    const activeBoard = STORAGE.currentUserBoards[boardId];
    const activeTask = activeBoard.tasks[taskId];

    const newType = el.id;
    const taskType = activeTask.type

    if (taskType !== newType) {
        el.append(TASK_ELEMENT)
        changeTaskType(activeBoard, activeTask, newType)
    }
    taskDropAnimation()
    moveTask(0, 0)
    targetContainer.children[1].classList.remove('placeholder')    
}

export function taskDropAnimation() {
    const {pageX, pageY} = event
    const taskBBox = TASK_ELEMENT.getBoundingClientRect()

    // snap to drop start position
    const x = Math.round(pageX - taskBBox.x - offset.x)
    const y = Math.round(pageY - taskBBox.y - offset.y)
    TASK_ELEMENT.style.translate = `${x}px ${y}px`

    // move to final position
    setTimeout(() => {
        TASK_ELEMENT.classList.add('drop-transition')
        TASK_ELEMENT.addEventListener('transitionend', () => TASK_ELEMENT.classList.remove('drop-transition'), { once: true })
        TASK_ELEMENT.style.translate = '0 0'
    }, 0)
}

export function checkDropContainers() {
    const { pageX, pageY } = event
    const taskContainer = $('#tasks')
    for (const container of [...taskContainer.children]) {
        const containerBBox = container.getBoundingClientRect()
        const mouseXInside = pageX > containerBBox.x && pageX < containerBBox.right
        const mouseYInside = pageY > containerBBox.y && pageY < containerBBox.bottom
        const mouseInside = mouseXInside && mouseYInside
        container.children[1].classList.toggle('placeholder', mouseInside)
        if (!mouseInside) continue
        return container
    }
}

export async function changeTaskType (board, task, newType) {
    task.type = newType;
    return board.update();
}