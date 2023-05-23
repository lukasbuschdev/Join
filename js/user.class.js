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
        log(this.verifyCode)
        LOCAL_setItem('user', this.userData);
        await REMOTE_setItem('verification', this.verifyCode);
        goTo(`./verify_account.html?uid=${this.userData.id}`);
    }

    #sendVerificationCode = async () => {
        const recipient = this.userData.email;
        const message = verificationEmailTemplate(this.userData, this.verifyCode);
        const payload = { recipient, message };
        const response = await fetch(`../php/mailto.php`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    verify = async () => {
        this.logIn();
    }

    logIn = async () => {
        this.loggedIn = 1;
        await this.#update();
        location.href = `../summary/summary.html?uid=${this.userData.id}`;
    }
    
    rememberMe = () => {
        const rememberLogin = $('#remember-me').checked || false;
        if (rememberLogin) {
            LOCAL_setItem('remember-me', { email: $('#email input').value, password: this.userData.password });
        } else {
            if (LOCAL_getItem('remember-me') !== null) {
                LOCAL_removeItem('remember-me');
                log('forgot login Credentials');
            }
        }
    }

    #update = async () => {
        return REMOTE_setItem('users', this.userData);
    }

    generateVerificationCode = () => {
        const charSet = 'abcdefghijlkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += charSet[(Math.floor(Math.random() * charSet.length))];
        }
        this.verifyCode = { id: this.userData.id, code, expires: Date.now() + 5 * 1000 * 60 };
      }

    codeExpired = () => this.verifyCode.expires < Date.now(); 
}