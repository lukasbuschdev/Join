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
        if (type == "unknownDevice") {
            this.message = unknownDeviceEmailTemplate(recipient, langData, options);
        }
    }

    send = async () => {
        const payload = {
            recipient: this.recipient.email,
            message: this.message,
            subject: this.subject
        };
        return (await fetch(`/Join/php/mailto.php`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })).text();
    }
}