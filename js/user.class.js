class User extends Account {
    constructor(userData){
        super(userData);
        this.loggedIn = 0;
    }

    setPicture = (picture) => {
        this.userData.picture = picture;
    }

    changePassword = (newPassword) => {
        this.userData.password = newPassword;
    }

    initVerification = async () => {
        this.generateVerificationCode();
        this.#sendVerificationCode();
        LOCAL_setItem('user', this.userData);
        await REMOTE_setItem('verification', this.verifyCode);
        goTo(`./verify_account.html?uid=${this.userData.id}`);
    }

    #sendVerificationCode = async () => {
        const subject = 'Verify your Account';
        const message = verificationEmailTemplate(this.userData, this.verifyCode);
        this.#sendMail(message, subject);
    }

    initPasswordReset = () => {
        this.#sendPasswordReset();
    }

    #sendPasswordReset = () => {
        const subject = 'Reset your passowrd';
        const message = forgotPasswordEmailTemplate(this.userData);
        this.#sendMail(message, subject);
    }

    #sendMail = async (message, subject) => {
        const payload = {
            recipient: this.userData.email,
            message,
            subject
        };
        return fetch(`../php/mailto.php`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    verify = async () => {
        this.logIn();
    }

    setCredentials = () => {
        const cred = new PasswordCredential({
            id: this.userData.name,
            password: this.userData.password,
            name: this.userData.email
        });
        navigator.credentials.store(cred);
    }

    setCredentialsFallback = () => {
        const cred = {
            name: this.userData.name,
            password: this.userData.password
        }
        LOCAL_setItem('user', cred);
    }

    logIn = async () => {
        this.loggedIn = 1;
        this.setCredentials();
        await this.#update();
        location.href = `../summary/summary.html?uid=${this.userData.id}`;
    }

    rememberMe = () => {
        const rememberLogin = $('#remember-me').checked || false;
        if (rememberLogin == false) return;
        if ("PasswordCredential" in window) {
            this.setCredentials();
        } else {
            this.setCredentialsFallback();
        }
    }

    #update = async () => {
        return REMOTE_setItem('users', this.userData);
    }

    generateVerificationCode = () => {
        const charSet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += charSet[(Math.floor(Math.random() * charSet.length))];
        }
        this.verifyCode = { id: this.userData.id, code, expires: Date.now() + 5 * 1000 * 60 };
      }

    codeExpired = () => this.verifyCode.expires < Date.now(); 
}