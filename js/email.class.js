import { STORAGE } from "./storage.js";
import { resetPasswordEmailTemplate, verificationEmailTemplate } from "/Join/assets/templates/index/mail_templates.js";

export class Email {
	constructor({ recipient, type = "", langData }) {
		this.recipient = recipient;
		this.subject = langData["subject"];
		if (type == "verification") this.message = verificationEmailTemplate(recipient, langData);
		if (type == "passwordReset") this.message = resetPasswordEmailTemplate(recipient, langData);
	}

	async send() {
		STORAGE.webSocket.init(this.recipient);
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
