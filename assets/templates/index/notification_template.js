const notificationTemplate = (notification) => {
    if (notification.type == "friendshipRequest") {
        const {userName, userId, id} = notification;
        return /*html*/`
            <div class="notification radius-15 row" data-id="${id}">
                <div>
                    <span><b>${userName}</b> has sent you a friendship request!</span>
                </div>
                <div class="btn-container gap-10">
                    <button class="btn btn-secondary txt-small txt-600" onclick="removeFriendshipRequest('${id}', '${userId}')">Decline</button>
                    <button class="btn btn-primary txt-small txt-600" onclick="acceptFriendshipRequest('${id}', '${userId}')">Accept</button>
                </div>
            </div>
        `;
    } else if (notification.type == "boardInvite") {
        const {ownerName, boardName, boardId, id} = notification;
        return /*html*/`
            <div class="notification radius-15 row" data-id="${id}">
                <div>
                    <b>${ownerName}</b> invited you to collaborate with them on their board <b>${boardName.replaceAll('-',' ')}</b>!
                </div>
                <div class="btn-container gap-10">
                    <button class="btn btn-secondary txt-small txt-600" onclick="removeNotification('${id}')">Decline</button>
                    <button class="btn btn-primary txt-small txt-600" onclick="acceptBoardInvite('${boardId}', '${id}')">Accept</button>
                </div>
            </div>
        `;
    } else if (notification.type == "assignTo") {
        const {userName, boardName, taskName, id} = notification;
        return /*html*/`
            <div class="notification radius-15 column gap-10" data-id="${id}">
                <div>
                    <b>${userName}</b> assigned you to the task <b>"${taskName}"</b> in <b>"${boardName.replaceAll('-',' ')}"</b>!
                </div>
                <div class="btn-container gap-10">
                    <button class="btn btn-secondary txt-small txt-600" onclick="removeNotification('${id}')">Understood</button>
                </div>
            </div>
        `;
    }
}

async function removeFriendshipRequest(id, userId) {
    await REMOTE_removeData(`users/${userId}/pendingFriendshipRequests/${USER.id}`);
    return removeNotification(id);
}

async function acceptFriendshipRequest(id, userId) {
    await REMOTE_setData(`users/${userId}/contacts`, USER.id.toString());
    USER.contacts.push(userId);
    await removeFriendshipRequest(id, userId);
    loadContent();
    notification('friend-added');
}