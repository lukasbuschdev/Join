const notificationTemplate = (notification) => {
    switch (notification.type) {
        case "friendshipRequest": {
            const {userName, userId, id} = notification;
            return /*html*/`
                <div class="notification radius-15 row" data-id="${id}">
                    <div>
                        <span data-lang="user-has-sent-friendship-request, {ownerName: '${userName}'}"></span>
                    </div>
                    <div class="btn-container gap-10">
                        <button data-lang="decline" class="btn btn-secondary txt-small txt-600" onclick="removeFriendshipRequest('${id}', '${userId}')">Decline</button>
                        <button data-lang="accept" class="btn btn-primary txt-small txt-600" onclick="acceptFriendshipRequest('${id}', '${userId}', '${userName}')">Accept</button>
                    </div>
                </div>
            `;
        }
        case "boardInvite": {
            const {ownerName, boardName, boardId, id} = notification;
            return /*html*/`
                <div class="notification radius-15 row" data-id="${id}">
                    <div>
                        <span data-lang="user-invited-you-to-board, {ownerName: '${ownerName}', boardName: '${boardName.replaceAll('-',' ')}'}"></span>
                    </div>
                    <div class="btn-container gap-10">
                        <button data-lang="decline" class="btn btn-secondary txt-small txt-600" onclick="removeNotification('${id}')">Decline</button>
                        <button data-lang="accept" class="btn btn-primary txt-small txt-600" onclick="acceptBoardInvite('${boardId}', '${boardName}', '${id}')">Accept</button>
                    </div>
                </div>
            `;
        }
        case "assignTo": {
            const {userName, boardName, taskName, id} = notification;
            return /*html*/`
                <div class="notification radius-15 column gap-10" data-id="${id}">
                    <div>
                        <span data-lang="assigned-you-to-task, {ownerName: '${userName}', taskName: '${taskName}', boardName: '${boardName}'}"></span>
                    </div>
                    <div class="btn-container gap-10">
                        <button data-lang="understood" class="btn btn-secondary txt-small txt-600" onclick="removeNotification('${id}')">Understood</button>
                    </div>
                </div>
            `;
        }
        default: return
    }
}

async function acceptBoardInvite (boardId, boardName, notificationId) {
    await removeNotification(notificationId);
    if (!await REMOTE_getData(`boards/${boardId}`)) return notification(`board-nonexistent, {boardName: '${boardName}'}`);
    const setUser = USER.setProperty('boards', [...USER.getPropertyValue('boards'), `${boardId}`]);
    const setBoard = REMOTE_setData(`boards/${boardId}/collaborators`, USER.id);
    await Promise.all([setUser, setBoard]);
    await getBoards();
    await notification(`board-joined, {boardName: '${boardName}'}`);
    location.reload();
}

async function removeNotification (notificationId) {
    delete USER.notifications[notificationId];
    await USER.update();
    await getUser();
    $(`.notification[data-id="${notificationId}"]`).remove();
    checkNotifications();
}

async function removeFriendshipRequest(id, userId) {
    await REMOTE_removeData(`users/${userId}/pendingFriendshipRequests/${USER.id}`);
    return removeNotification(id);
}

async function acceptFriendshipRequest(id, userId, name) {
    await REMOTE_setData(`users/${userId}/contacts`, USER.id.toString());
    USER.contacts.push(userId);
    await removeFriendshipRequest(id, userId);
    await notification(`friend-added, {name: '${name}'}`);
    location.reload();
}