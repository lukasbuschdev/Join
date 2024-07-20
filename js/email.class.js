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
		if (!STORAGE.currentUserId()) STORAGE.webSocket.init(this.recipient.id);
		const { socket } = STORAGE.webSocket;
		const mailOptions = {
      to: this.recipient.email,
			subject: this.subject,
			html: this.message
		};
    
		socket.emit("mail", mailOptions);
    console.log(this)
		return new Promise((resolve, reject) => {
			socket.on("mailSent", resolve);
			socket.on("mailFailed", reject);
		});
	}
}
