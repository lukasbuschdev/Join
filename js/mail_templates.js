const verificationEmailTemplate = ({ id, name, verifyCode: { code }}, langData) => {
    return /*html*/`
        <div style="height: 500px; background-color: #F6F7F8; padding: 30px;">
            <img src="https://tarik-uyan.developerakademie.net/Join/assets/img/icons/logo.svg" alt="" style="width: 75px; margin-bottom: 30px;">
            <h1>${langData["message-1"]}${name}!</h1>
            <p style="font-size: 14px;">${langData["message-2"]}<span style="color: #29ABE2; font-size: 16px; font-weight: 700;">${code}</span>${langData["message-3"]}</p>
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
            ">${langData["message-4"]}</a>
        </div>
        `
}

const resetPasswordEmailTemplate = ({ id, name }, langData) => {
    return /*html*/`
        <div style="height: 500px; background-color: #F6F7F8; padding: 30px;">
            <img src="https://tarik-uyan.developerakademie.net/Join/assets/img/icons/logo.svg" alt="" style="width: 75px; margin-bottom: 30px;">
            <h1>${langData["message-1"]}${name}!</h1>
            <p style="font-size: 14px;">${langData["message-2"]}</p>
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
            ">${langData["message-3"]}</a>
            <p style="font-size: 12px;">${langData["message-4"]}<a href="" mailto="noreply.info.join@gmail.com">noreply.info.join@gmail.com</a></p>
        </div>
    `
}
