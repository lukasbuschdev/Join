import { STORAGE } from "./storage.js";
import { resetPasswordEmailTemplate, verificationEmailTemplate } from "/Join/assets/templates/index/mail_templates.js";

/**
 * @typedef {"verification"|"passwordReset"} EmailType
 */

/**
 * @typedef {Object} EmailParams
 * @property {string} recipient
 * @property {EmailType} type
 * @property {import("./language.js").LangData} langData
 */

/**
 * Class representing an email.
 * @implements {EmailParams}
 */
export class Email {

	recipient;
	type;
	
	/** @type {string} */
	subject;

	/** @type {string} */
	message;

	/**
	 * Create an email.
	 * @param {EmailParams} options - The email options.
	 */
	constructor({ recipient, type, langData }) {
		this.recipient = recipient;
		this.subject = langData["subject"];
		this.type = type;
		if (type === "verification") {
			this.message = verificationEmailTemplate(recipient, langData);
		}
		if (type === "passwordReset") {
			this.message = resetPasswordEmailTemplate(recipient, langData);
		}
	}

	/**
	 * Send the email.
	 * @returns {Promise<void>} A promise that resolves if the email was sent successfully, and rejects if it failed.
	 */
	async send() {
		if (!STORAGE.currentUserId()) {
			STORAGE.webSocket.init(this.recipient.id);
		}

		const { socket } = STORAGE.webSocket;
		const mailOptions = {
			to: this.recipient.email,
			subject: this.subject,
			html: this.message
		};
		socket.emit("mail", mailOptions);
		return new Promise((resolve, reject) => {
			socket.on("mailSent", resolve);
			socket.on("mailFailed", reject);
		});
	}
}
