const notificationTemplate = (notification) => {
    if (notification.type == "friendRequest") {
        const {contactName, ContactId} = notification;
        return /*html*/`
            <div><span>${name}</span> wants to be your friend!<div>
        `
    } else if (notification.type == "boardInvite") {
        const {ownerName, boardName, boardId, id} = notification;
        return /*html*/`
            <div class="notification radius-15 column gap-10" data-id="${id}">
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