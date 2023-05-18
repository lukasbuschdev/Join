class User extends Account {
    constructor(name, email, password){
        super(name, email, password);
    }

    setPicture = (picture) => {
        this.picture = picture;
    }

    changePassword = () => {

    }

    sendVerificationCode = async () => {
        const code = generateVerificationCode();
        const message = mailTemplate(this.name, code);
        const payload = {
            recipient: this.email,
            message: message
        };
        const response = await fetch(`../php/mailto.php`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await response.text();
        log(data);
    }
}