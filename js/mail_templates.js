const verificationEmailTemplate = ({ id, name }, verifyCode) => {
    return /*html*/`
        <!DOCTYPE html>
        <html>
        <body style="font-family: 'Arial';">
            <div style="height: 500px; background-color: #F6F7F8; padding: 30px;">
                <img src="https://tarik-uyan.developerakademie.net/Join/assets/img/icons/logo.svg" alt="" style="width: 75px; margin-bottom: 30px;">
                <h1>Hi, ${name}!</h1>
                <p style="font-size: 14px;">Please click the button below or use the Code <span style="color: #29ABE2; font-size: 16px; font-weight: 700;">${verifyCode}</span> to verify your account.</p>
                <a
                href="https://tarik-uyan.developerakademie.net/Join/index/index.html?uid=${id}&token=${verifyCode}"
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
        </body>
        </html>
    `
}
