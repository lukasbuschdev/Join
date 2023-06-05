const setEmailLanguage = () => {
    
}

const verificationEmailTemplate = ({ id, name }, { code }) => {

    return /*html*/`
        <div style="height: 500px; background-color: #F6F7F8; padding: 30px;">
            <img src="https://tarik-uyan.developerakademie.net/Join/assets/img/icons/logo.svg" alt="" style="width: 75px; margin-bottom: 30px;">
            <h1>Hi, ${name}!</h1>
            <p style="font-size: 14px;">Please click the button below or use the Code <span style="color: #29ABE2; font-size: 16px; font-weight: 700;">${code}</span> to verify your account.</p>
            <a
            href="https://tarik-uyan.developerakademie.net/Join/index/verify_account.html?uid=${id}&token=${code}"
            style="
                background-color: rgb(42,54,71);
                display: block;
                padding: 10px 10px;
                margin-top: 30px;
                border-radius: 10px;
                color: white;
                width: 145px;
                font-size: 21px;
                font-weight: 700;
                text-decoration: none;
                text-align: center
            ">Verify</a>
        </div>
        `
}

const forgotPasswordEmailTemplate = ({ id, name }) => {

    return /*html*/`
        <div style="height: 500px; background-color: #F6F7F8; padding: 30px;">
            <img src="https://tarik-uyan.developerakademie.net/Join/assets/img/icons/logo.svg" alt="" style="width: 75px; margin-bottom: 30px;">
            <h1>Hi, ${name}!</h1>
            <p style="font-size: 14px;">A Request has been sent to change the password for your Join account.</p>
            <a
            href="https://tarik-uyan.developerakademie.net/Join/index/forgot_password.html?uid=${id}"
            style="
                background-color: rgb(42,54,71);
                display: block;
                padding: 10px 20px;
                margin-top: 30px;
                margin-bottom: 30px;
                border-radius: 10px;
                color: white;
                font-size: 21px;
                font-weight: 700;
                text-decoration: none;
                text-align: center
            ">Reset Password</a>
            <p style="font-size: 12px;">If this wasn't you, please contact us immediately under <a href="" mailto="musician.tarik@gmx.de">musician.tarik@gmx.de</a></p>
        </div>
    `
}
