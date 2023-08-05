const notificationTemplate = (notification) => {
    if (notification.type == "friendRequest") {
        const {contactName, ContactId} = notification;
        return /*html*/`
            <div><span>${name}</span> wants to be your friend!<div>
        `
    } else if (notification.type == "boardInvite") {
        const {ownerName, boardName, boardId} = notification;
        return /*html*/`
            <div><span><b>${ownerName}</b> invited you to collaborate with them on their board <b>${boardName.replaceAll('-',' ')}</b>!</span>
        `
    }
}