class Email {
    constructor({recipient, type = '', langData}) {
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
        const payload = {
            recipient: this.recipient.email,
            message: this.message,
            subject: this.subject
        };
        return (await fetch(`../php/mailto.php`, {
            method: 'POST',
            body: JSON.stringify(payload)
        })).text();
    }
}