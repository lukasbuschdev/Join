import { Board } from "./board.class.js";
import { Email } from "./email.class.js";
import { getEmailLanguage } from "./language.js";
import { goTo, notification } from "./utilities.js";
import { LOCAL_setData, STORAGE } from "./storage.js";
import { Notify } from "./notify.class.js";
import { Account } from "./account.class.js";

/**
 * @typedef {Object} UserParams
 * @property {string} password
 */

/**
 * @implements {UserParams}
 */
export class User extends Account {
	socket;
	password;

	/**
	 * Creates an instance of User.
	 * @param {import("./account.class.js").AccountParams & UserParams} userData - The data for the user.
	 */
	constructor(userData) {
		super(userData);
		this.password = userData.password;
	}

	/**
	 * Sets the profile picture for the user.
	 * @param {string} img - The URL of the image.
	 * @returns {Promise<any>} The result of the update operation.
	 */
	async setPicture(img) {
		return this.setProperty("img", img);
	}

	/**
	 * Sets the profile color for the user.
	 * @param {string} color - The color to set.
	 * @returns {Promise<any>} The result of the update operation.
	 */
	async setColor(color) {
		return this.setProperty("color", color);
	}

	/**
	 * Sets the phone number for the user.
	 * @param {string} phone - The phone number to set.
	 * @returns {Promise<any>} The result of the update operation.
	 */
	async setPhoneNumber(phone) {
		return this.setProperty("phone", phone);
	}

	/**
	 * Resets the password for the user.
	 * @param {string} [newPassword=""] - The new password.
	 * @returns {Promise<any>} The result of the update operation.
	 */
	async resetPassword(newPassword = "") {
		return this.setProperty("password", newPassword);
	}

	/**
	 * Initializes the verification process for the user.
	 * @returns {Promise<void>} The result of the verification initialization.
	 */
	async initVerification() {
		this.generateVerificationCode();
		await this.#sendMail("verification");
		await STORAGE.set(`verification/${this.id}`, {
			verifyCode: this.verifyCode,
			userData: this
		});

		goTo("init/verify_account/verify_account", {
			reroute: true,
			search: `?uid=${this.id}`
		});
	}

	/**
	 * Initializes the password reset process for the user.
	 * @returns {Promise<any>} The result of the password reset initialization.
	 */
	initPasswordReset() {
		return this.#sendMail("passwordReset");
	}

	/**
	 * Sends an email for verification or password reset.
	 * @param {string} type - The type of email to send ("verification" or "passwordReset").
	 * @param {Object} [options] - Additional options for the email.
	 * @returns {Promise<any>} The result of the email send operation.
	 * @private
	 */
	async #sendMail(type, options) {
		const mailOptions = {
			recipient: this,
			type,
			langData: await getEmailLanguage(type)
		};
		if (typeof options == "object") mailOptions.options = options;
		const mail = new Email(mailOptions);
		return mail.send();
	}

	/**
	 * Verifies the user.
	 * @returns {Promise<any>} The result of the update operation.
	 */
	verify() {
		return this.update();
	}

	/**
	 * Sets the credentials for the user.
	 * @param {string} rawPassword - The raw password to set.
	 */
	setCredentials(rawPassword) {
		const cred = new PasswordCredential({
			id: this.name,
			password: rawPassword,
			name: this.email
		});
		navigator.credentials.store(cred);
	}

	/**
	 * Logs in the user.
	 * @returns {Promise<void>} The result of the login operation.
	 */
	async logIn() {
		LOCAL_setData("loggedIn", true);
		this.loggedIn = "true";
		goTo("index/summary/summary", { search: `?uid=${this.id}` });
	}

	/**
	 * Logs out the user.
	 * @returns {Promise<void>} The result of the logout operation.
	 */
	async logOut() {
		LOCAL_setData("loggedIn", false);
		this.loggedIn = "false";
		await this.update();
		if ("PasswordCredential" in window) navigator.credentials.preventSilentAccess();
		goTo("init/login/login", { search: "" });
	}

	/**
	 * Generates a verification code for the user.
	 */
	generateVerificationCode() {
		const charSet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789";
		let code = "";
		for (let i = 0; i < 6; i++) {
			code += charSet[Math.floor(Math.random() * charSet.length)];
		}
		this.verifyCode = { code, expires: Date.now() + 5 * 1000 * 60 };
	}

	/**
	 * Checks if the verification code has expired.
	 * @returns {boolean} True if the verification code has expired, otherwise false.
	 */
	codeExpired() {
		return this.verifyCode.expires < Date.now();
	}

	/**
	 * Adds a board for the user.
	 * @param {Object} boardData - The data for the board.
	 * @returns {Promise<Board>} The created board.
	 */
	async addBoard(boardData) {
		if (typeof boardData !== "object") return;
		boardData.owner = this.id;
		const board = new Board(boardData);

		this.boards.push(board.id);
		await Promise.all([board.update(), this.update()]);
		return board;
	}

	/**
	 * Adds a contact for the user.
	 * @param {string} contactId - The ID of the contact to add.
	 * @returns {Promise<any>} The result of the update operation.
	 */
	async addContact(contactId) {
		if (this.pendingFriendshipRequests.includes(contactId)) return;

		const notificationPrototype = new Notify({
			recipients: [contactId],
			userName: this.name,
			userId: this.id,
			type: "friendshipRequest"
		});
		await notificationPrototype.send();
		return this.update();
	}

	/**
	 * Deletes a contact for the user.
	 * @param {string} id - The ID of the contact to delete.
	 * @returns {Promise<any>} The result of the update operation.
	 */
	async deleteContact(id) {
		this.contacts.remove(id);
		return this.update();
	}

	/**
	 * Updates the user data.
	 * @returns {Promise<any>} The result of the update operation.
	 */
	async update() {
		STORAGE.data.users[this.id] = JSON.parse(JSON.stringify(this));
		return super.update(`users/${this.id}`);
	}

	/**
	 * Deletes the user account.
	 * @returns {Promise<void>} The result of the account deletion.
	 */
	async deleteAccount() {
		await Promise.all([
			...allBoardCollaboratorPaths(this.id),
			...allTaskAssignedToPaths(this.id),
			...allContactPaths(this.id)
		].map(([path, data]) => STORAGE.set(path, data)),
			STORAGE.delete(`users/${this.id}`)
		);
		if (this.img) STORAGE.webSocket.socket.emit("deleteImg");
		await notification('account-deleted');
		goTo(`init/login/login`, { search: '' })
	}

}

/**
 * Gets all paths for board collaborators.
 * @param {string} userId - The ID of the user.
 * @returns {Array<[string, any]>} An array of paths and data for board collaborators.
 */
function allBoardCollaboratorPaths(userId) {
	return Object.values(STORAGE.currentUserBoards).map((board) => [`boards/${board.id}/_collaborators`, board.collaborators.remove(userId)])
}

/**
 * Gets all paths for tasks assigned to the user.
 * @param {string} userId - The ID of the user.
 * @returns {Array<[string, any]>} An array of paths and data for tasks assigned to the user.
 */
function allTaskAssignedToPaths(userId) {
	return Object.values(STORAGE.currentUserBoards).reduce(
		(allAssignedTasks, { tasks }) => {
			const assignedTasks = Object.values(tasks).reduce((taskMap, task) => {
				if (task.assignedTo.includes(userId)) taskMap.set(`${task.id}_${userId}`, task)
				return taskMap;
			}, new Map())

			return [ ...allAssignedTasks, ...[...assignedTasks].map(singleTaskAssignedToPath) ];
		}, []
	)
}

/**
 * Gets the path for a single task assigned to the user.
 * @param {[string, any]} param0 - An array containing the identifier and task data.
 * @returns {[string, any]} The path and data for the task.
 */
function singleTaskAssignedToPath([identifier, task]) {
	const userId = identifier.match(/(?<=_).*$/g)[0];
	return [`boards/${task.boardId}/tasks/${task.id}/_assignedTo`,
		STORAGE.data.boards[task.boardId].tasks[task.id].assignedTo.remove(userId)
	];
}

/**
 * Gets all paths for contacts of the user.
 * @param {string} userId - The ID of the user.
 * @returns {Array<[string, any]>} An array of paths and data for contacts of the user.
 */
function allContactPaths(userId) {
	return Object.values(STORAGE.currentUserContacts).reduce(
		(allContacts, contact) => [...allContacts, [`users/${contact.id}/_contacts`, STORAGE.data.users[contact.id].contacts.remove(userId)]], []
	)
}