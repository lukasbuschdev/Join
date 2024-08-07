import { checkNotifications } from "../../../index/index/index.js";
import { Board } from "../../../js/board.class.js";
import { bindInlineFunctions, getContext } from "../../../js/setup.js";
import { LOCAL_setData, STORAGE } from "../../../js/storage.js";
import { $, notification } from "../../../js/utilities.js";

bindInlineFunctions(getContext());

export function notificationTemplate(notification) {
	switch (notification.type) {
		case "friendshipRequest": {
			const { userName, userId, id } = notification;
			return /*html*/ `
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
			const { ownerName, boardName, boardId, id } = notification;
			return /*html*/ `
                <div class="notification radius-15 row" data-id="${id}">
                    <div>
                        <span data-lang="user-invited-you-to-board, {ownerName: '${ownerName}', boardName: '${boardName.replaceAll("-", " ")}'}"></span>
                    </div>
                    <div class="btn-container gap-10">
                        <button data-lang="decline" class="btn btn-secondary txt-small txt-600" onclick="removeNotification('${id}')">Decline</button>
                        <button data-lang="accept" class="btn btn-primary txt-small txt-600" onclick="acceptBoardInvite('${boardId}', '${boardName}', '${id}')">Accept</button>
                    </div>
                </div>
            `;
		}
		case "assignTo": {
			const { userName, boardName, taskName, id } = notification;
			return /*html*/ `
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
		default:
			return;
	}
}

export async function acceptBoardInvite(boardId, boardName, notificationId) {
	const USER = STORAGE.currentUser;
	const BOARD = new Board(STORAGE.data.boards[boardId]);
	await removeNotification(notificationId);
	if (!(boardId in STORAGE.data.boards)) return notification(`board-nonexistent, {boardName: '${boardName}'}`);
	USER.boards.push(boardId);
	BOARD.collaborators.push(USER.id);
	await Promise.all([USER.update(), BOARD.update()]);
	await notification(`board-joined, {boardName: '${boardName}'}`);
	LOCAL_setData("activeBoard", boardId);
	goTo("index/board/board");
}

export async function removeNotification(notificationId) {
	const USER = STORAGE.currentUser;
	delete USER.notifications[notificationId];
	await USER.update();
	$(`.notification[data-id="${notificationId}"]`).remove();
	checkNotifications();
}

export async function removeFriendshipRequest(id, userId) {
	await STORAGE.delete(`users/${userId}/pendingFriendshipRequests/${STORAGE.currentUserId()}`);
	return removeNotification(id);
}

export async function acceptFriendshipRequest(id, userId, name) {
	const user = STORAGE.currentUser;
	const contact = STORAGE.allUsers[userId];
	user.contacts.push(userId);
	contact.contacts.push(STORAGE.currentUserId());

	await Promise.all([user.update(), contact.update()]);
	await removeFriendshipRequest(id, userId);
	await notification(`friend-added, {name: '${name}'}`);
	goTo("index/contacts/contacts");
}
