class User extends Account {
    constructor(name, email, password){
        super(name, email, password);
        this.test = 'test';
    }

    setPicture = (picture) => {
        this.picture = picture;
    }

    changePassword = () => {

    }

    sendVerificationCode = async () => {
        const messageTemplate = await (await fetch('../php/mail_template.html')).text();
        const payload = {
            recipient: this.email,
            message: messageTemplate,
            token: "asdkjgbljkh123e91zaoisudg82"
        };
        log(payload);
        const response = await fetch(`../php/mailto.php`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await response.text();
        log(data);
    }
}