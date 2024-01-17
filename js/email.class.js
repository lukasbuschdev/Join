class Email {
    constructor({recipient, type = '', langData, options}) {
        this.recipient = recipient;
        this.subject = langData["subject"];
        if (type == "verification") {
            this.message = verificationEmailTemplate(recipient, langData);
        }
        if (type == "passwordReset") {
            this.message = resetPasswordEmailTemplate(recipient, langData);
        }
    }

    send = async () => {
        const mailOptions = {
            to: this.recipient.email,
            subject: this.subject,
            html: this.message
        }
        SOCKET.emit('mail', mailOptions);
        return new Promise((resolve, reject) => {
            SOCKET.on('mailSent', () => {
                resolve();
            });
            SOCKET.on('mailFailed', () => {
                reject()
            })
        })
    }
}