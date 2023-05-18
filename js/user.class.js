class User extends Account {
    constructor(name, email, password){
        super(name, email, password);
        this.loggedIn = false;
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

    logIn = () => {
        this.rememberMe();
        location.href = `../summary/summary.html?uid=${this.id}`;
    }
    
    rememberMe = () => {
        const rememberLogin = $('#remember-me').checked;
        if (rememberLogin) {
            LOCAL_setItem('remember-me', { email: this.email, password: this.password });
        } else {
            if (LOCAL_getItem('remember-me') !== null) {
                LOCAL_removeItem('remember-me');
                log('forgot login Credentials');
            }
        }
    }
}