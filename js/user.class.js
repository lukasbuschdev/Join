class User extends Account {
    constructor(userData){
        super(userData);
        this.loggedIn = 0;
    }

    setPicture = (img) => { // TODO
        this.userData.img = img;
        this.#update();
    }

    changePassword = (newPassword) => { // TODO
        this.userData.password = newPassword;
    }

    initVerification = async () => {
        this.generateVerificationCode();
        // this.#sendVerificationCode();
        await REMOTE_setData('verification', {[this.userData.id]: { verifyCode: this.verifyCode, userData: this.userData }});
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
        // await REMOTE_removeData(`verification/${this.userData.id}`)
        log(this.userData)
        await this.#update();
        goTo(`../init/create_account.html?uid=${this.userData.id}`)
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
        LOCAL_setData('user', cred);
    }

    logIn = async () => {
        this.loggedIn = 'true';
        this.setCredentials();
        await this.#update();
        goTo(`../index/index.html?uid=${this.userData.id}`);
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
        return REMOTE_setData('users', {[this.userData.id]: this.userData});
    }

    generateVerificationCode = () => {
        const charSet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += charSet[(Math.floor(Math.random() * charSet.length))];
        }
        this.verifyCode = { code, expires: Date.now() + 5 * 1000 * 60 };
      }

    codeExpired = () => this.verifyCode.expires < Date.now(); 
}