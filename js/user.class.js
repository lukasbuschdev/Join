import { Board } from "./board.class.js";
import { Email } from "./email.class.js";
import { getEmailLanguage } from "./language.js";
import { goTo, notification } from "./utilities.js";
import { LOCAL_setData, STORAGE } from "./storage.js";
import { Notify } from "./notify.class.js";
import { Account } from "./account.class.js";

export class User extends Account {
	socket;
	/** @type {string} */
	password;

	constructor(userData) {
		super(userData);
		this.password = userData.password;
	}

	async setPicture(img) {
		return this.setProperty("img", img);
	}

	async setColor(color) {
		return this.setProperty("color", color);
	}

	async setPhoneNumber(phone) {
		return this.setProperty("phone", phone);
	}

	async resetPassword(newPassword = "") {
		return this.setProperty("password", newPassword);
	}

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

	initPasswordReset() {
		return this.#sendMail("passwordReset");
	}

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

	verify() {
		return this.update();
	}

	setCredentials(rawPassword) {
		const cred = new PasswordCredential({
			id: this.name,
			password: rawPassword,
			name: this.email
		});
		navigator.credentials.store(cred);
	}

	async logIn() {
		LOCAL_setData("loggedIn", true);
		this.loggedIn = "true";
		// await this.update();
		goTo("index/summary/summary", { search: `?uid=${this.id}` });
	}

	async logOut() {
		LOCAL_setData("loggedIn", false);
		this.loggedIn = "false";
		await this.update();
		if ("PasswordCredential" in window) navigator.credentials.preventSilentAccess();
		goTo("init/login/login", { search: "" });
	}

	generateVerificationCode() {
		const charSet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789";
		let code = "";
		for (let i = 0; i < 6; i++) {
			code += charSet[Math.floor(Math.random() * charSet.length)];
		}
		this.verifyCode = { code, expires: Date.now() + 5 * 1000 * 60 };
	}

	codeExpired() {
		return this.verifyCode.expires < Date.now();
	}

	async addBoard(boardData) {
		if (typeof boardData !== "object") return;
		boardData.owner = this.id;
		const board = new Board(boardData);

		this.boards.push(board.id);
		await Promise.all([board.update(), this.update()]);
		return board;
	}

	async addContact(contactId) {
		if (this.pendingFriendshipRequests.includes(contactId)) return;

		const notificationPrototype = new Notify({
			recipients: [contactId],
			userName: this.name,
			userId: this.id,
			type: "friendshipRequest"
		});

		await notificationPrototype.send();

		// TO DO update data!
		return this.update();
	}

	async deleteContact(id) {
		this.contacts.remove(id);
		return this.update();
	}

	async update() {
		STORAGE.data.users[this.id] = JSON.parse(JSON.stringify(this));
		return super.update(`users/${this.id}`);
	}

	async deleteAccount() {
		await Promise.all([
			`users/${this.id}`,
			// ATTENTION: array placeholder not properly stored yet (no underscore)
			...allBoardCollaboratorPaths(),
			...allTaskAssignedToPaths(),
			...allContactPaths()
			].map((path) => STORAGE.delete(path))
		);
		await notification('account-deleted');
		goTo(`init/login/login`, { search: '' })
	}

}

function allBoardCollaboratorPaths() {
	return Object.values(STORAGE.currentUserBoards).map((board, i) => `boards/${board.id}/_collaborators/${i}`)
}

function allTaskAssignedToPaths() {
	return Object.values(STORAGE.currentUserBoards).reduce(
		(allAssignedTasks, { tasks }) => {
			const assignedTasks = Object.values(tasks).reduce((taskMap, task) => {
				if (task.assignedTo.includes(this.id)) taskMap.set(`${task.id}_${task.assignedTo.indexOf(this.id)}`, task)
				return taskMap;
			}, new Map())
		
			return [ ...allAssignedTasks, ...[...assignedTasks].map(singleTaskAssignedToPath()) ];
		}, [])
}

function singleTaskAssignedToPath([identifier, task]) {
	const i = identifier.match(/(?<=_).*$/g);
	return `boards/${task.boardId}/tasks/${task.id}/_assignedTo/${i}`;
}

function allContactPaths() {
	return Object.values(STORAGE.currentUserContacts).reduce(
		(allContacts, contact) => {
			const i = contact.contacts.indexOf(this.id);
			return [...allContacts, `users/${contact.id}/_contacts/${i}`];
		}, []
	)
}