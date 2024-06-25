import { Account } from "./account.class.js";
import { Board } from "./board.class.js";
import { Email } from "./email.class.js";
import { getEmailLanguage } from "./language.js";
import { goTo } from "./utilities.js";
import { LOCAL_setData, REMOTE_getData, REMOTE_setData } from "./storage.js";

export class User extends Account {
    socket
    constructor(userData) {
        super(userData);
        this.password = userData.password;
        this.color = userData.color ?? '#D1D1D1';
        this.pendingFriendshipRequests = userData.pendingFriendshipRequests ?? [];
    }

    async setPicture(img) {
        return this.setProperty("img", img)
    };

    async setColor(color) {
        return this.setProperty("color", color);
    }

    async setPhoneNumber(phone) {
        return this.setProperty("phone", phone);
    }

    async resetPassword(newPassword = '') {
        return this.setProperty("password", newPassword);
    }

    async initVerification() {
        this.generateVerificationCode();
        await this.#sendMail("verification");
        await REMOTE_setData('verification', {[this.id]: { verifyCode: this.verifyCode, userData: this }});
        goTo('init/verify_account/verify_account', {reroute: true, search: `?uid=${this.id}`});
    }

    initPasswordReset() {
        return this.#sendMail("passwordReset");
    }

    async #sendMail(type, options) {
        const mailOptions = {
            recipient: this,
            type,
            langData: await getEmailLanguage(type)
        }
        if (typeof options == "object") mailOptions.options = options;
        const mail = new Email(mailOptions);
        return mail.send(this.socket);
    }

    async verify() {
        await this.update();
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
        LOCAL_setData('loggedIn', true);
        this.loggedIn = 'true';
        // await this.update();
        goTo('index/summary/summary', {search: `?uid=${this.id}`});
    }

    async logOut() {
        LOCAL_setData('loggedIn', false);
        this.loggedIn = 'false';
        await this.update();
        if ("PasswordCredential" in window) navigator.credentials.preventSilentAccess();
        goTo('init/login/login', {search: ''});
    }

    async update() {
        const allUsers = await REMOTE_setData('users', {[this.id]: this});
        if (typeof CONTACTS === 'undefined') return;
        USER = this
    }

    generateVerificationCode() {
        const charSet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += charSet[(Math.floor(Math.random() * charSet.length))];
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
        await Promise.all([
            board.update(),
            this.update()
        ]);
        return board;
    }

    getBoard(boardId) {
        return REMOTE_getData(`boards/${boardId}`);
    }

    async getContacts() {
        const allUsers = await REMOTE_getData('users');
        return this.contacts.map(
            contactId => allUsers[contactId]
        );
    }
}