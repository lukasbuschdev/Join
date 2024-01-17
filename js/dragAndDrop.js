let task
let taskWidth
let offset = { x: 0, y: 0 }
let scrollInterval

const scrollFrequency = 20
const throttleDelay = 10

// SETUP

function addDragAndDrop() {
    task = event.currentTarget
    const taskBBox = task.getBoundingClientRect()
    offset.x = event.pageX - taskBBox.x
    offset.y = event.pageY - taskBBox.y

    task.style.maxWidth = `${taskBBox.width}px`
    
    task.addEventListener('pointerup', fullscreenFunctionality, { once: true })
    task.addEventListener('pointermove', dragFunctionality, { once: true })
}

// FULLSCREEN FUNC

function fullscreenFunctionality() {
    task.removeEventListener('pointermove', dragFunctionality)
    fullscreenHandler()
}

function fullscreenHandler() {
    renderFullscreenTask(task.dataset.id)
}

// DRAG FUNC

function dragFunctionality() {
        // remove fullscreenListener
        task.removeEventListener('pointerup', fullscreenFunctionality, { once: true })

        // add moveListener
        window.addEventListener('pointermove', dragHandler)
        startScroll()

        window.addEventListener('pointerup', () => {
            // remove moveListener
            stopScroll()
            window.removeEventListener('pointermove', dragHandler)
            dropHandler()
        }, { once: true })
        task.classList.add('active')
}

const dragHandler = throttle(() => {
    checkDropContainers()
    const {pageX, pageY} = event
    const x = Math.round(pageX - offset.x)
    const y = Math.round(pageY - offset.y)
    moveTask(x, y)
}, throttleDelay)

function moveTask(x, y) {
    task.style.top = `${y}px`
    task.style.left = `${x}px`
}

// SCROLL FUNC

function scrollFunctionality() {
    const taskContainer = $('#tasks')
    if (checkScrollSoft(taskContainer) === false) return
    const scrollDireciton = checkScrollHard(taskContainer)
    if (scrollDireciton) customScroll(scrollDireciton)
}

function checkScrollSoft(taskContainer) {
    const canScroll = taskContainer.scrollHeight > taskContainer.clientHeight
    return canScroll
}

function checkScrollHard(taskContainer) {
    const taskBBox = task.getBoundingClientRect()
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

function customScroll(direction) {
    const taskContainer = $('#tasks')
    taskContainer.scrollBy(0, 3 * direction)
}

function startScroll() {
    scrollInterval = setInterval(scrollFunctionality, scrollFrequency)
}

function stopScroll() {
    clearInterval(scrollInterval)
}

// DROP FUNC

async function dropHandler() {
    task.classList.remove('active')
    task.style.maxWidth = ''

    const targetContainer = checkDropContainers()
    if (!targetContainer) return taskDropAnimation()

    const el = targetContainer.$('.task-container')

    const taskId = task.dataset.id.split('/')[1]
    const taskType = SELECTED_BOARD.tasks[taskId].type

    if (taskType != el.id) {
        el.append(task)
        changeTaskType(taskId, el.id)
    }
    taskDropAnimation()
    moveTask(0, 0)
    targetContainer.children[1].classList.remove('placeholder')    
}

function taskDropAnimation() {
    const {pageX, pageY} = event
    const taskBBox = task.getBoundingClientRect()

    // snap to drop start position
    const x = Math.round(pageX - taskBBox.x - offset.x)
    const y = Math.round(pageY - taskBBox.y - offset.y)
    task.style.translate = `${x}px ${y}px`

    // move to final position
    setTimeout(() => {
        task.classList.add('drop-transition')
        task.addEventListener('transitionend', () => task.classList.remove('drop-transition'), { once: true })
        task.style.translate = '0 0'
    }, 0)
}

function checkDropContainers() {
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