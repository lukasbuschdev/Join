const notificationTemplate = (notification) => {
    if (notification.type == "friendshipRequest") {
        const {userName, userId, id} = notification;
        return /*html*/`
            <div class="notification radius-15 row" data-id="${id}">
                <div>
                    <span><b>${userName}</b> has sent you a friendship request!</span>
                </div>
                <div class="btn-container gap-10">
                    <button class="btn btn-secondary txt-small txt-600" onclick="removeFriendshipRequest('${id}')">Decline</button>
                    <button class="btn btn-primary txt-small txt-600" onclick="acceptFriendshipRequest('${userId}', '${id}')">Accept</button>
                </div>
            </div>
        `
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
        `
    }
}