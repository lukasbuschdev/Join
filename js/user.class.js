class User extends Account {
    constructor(userData, methods){
        super(userData);
        this.password = userData.password;
        this.color = userData.color ?? "";
        if (!methods) return removeMethods(this)
    }

    setPicture = async (img) => await this.setProperty("img", img);

    setColor = async (color) => await this.setProperty("color", color);

    setPhoneNumber = async (phone) => await this.setProperty("phone", phone);

    resetPassword = async (newPassword = '') => { // TODO
        return this.setProperty("password", newPassword);
    }

    initVerification = async () => {
        this.generateVerificationCode();
        this.#sendMail("verification");
        await REMOTE_setData('verification', {[this.id]: { verifyCode: this.verifyCode, userData: this }});
        goTo(`./verify_account.html?uid=${this.id}`);
    }

    initPasswordReset = () => {
        this.#sendMail("passwordReset");
    }

    #sendMail = async (type, options) => {
        const mailOptions = {
            recipient: this,
            type,
            langData: await getEmailLanguage(type)
        }
        if (typeof options == "object") mailOptions.options = options;
        const mail = new Email(mailOptions);
        return await mail.send();
    }

    verify = async () => {
        await REMOTE_removeData(`verification/${this.id}`);
        await this.#update();
    }

    forgotPassword = async () => {
        return await this.#sendMail("passwordReset");
    }

    setCredentials = () => {
        const cred = new PasswordCredential({
            id: this.name,
            password: this.password,
            name: this.email
        });
        navigator.credentials.store(cred);
    }

    logIn = async () => {
        this.loggedIn = 'true';
        this.setCredentials();
        await this.#update();
        goTo(`../index/index.html?uid=${this.id}`);
    }

    rememberMe = () => {
        const rememberLogin = $('#remember-me').checked || false;
        if (rememberLogin == false) return;
        if ("PasswordCredential" in window) this.setCredentials();
    }

    #update = async () => {
        return await REMOTE_setData('users', {[this.id]: this});
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

    unknownDevice = async (deviceData) => {
        await this.#sendMail("unknownDevice", deviceData);
    }
}