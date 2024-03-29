let SOCKET;

const initVerifyAccount = () => {
    LANG_load();
    initTimer();
    checkEmailVerification();
}

const checkEmailVerification = async () => {
    const uid = currentUserId();
    const { verifyCode: { code }} = await REMOTE_getData(`verification/${uid}`)
    if (new URLSearchParams(location.search).get('token') !== code) return;
    fillCodeInputs(code);
}

const initTimer = async () => {
    const uid = currentUserId();
    const { verifyCode: { expires }} = await REMOTE_getData(`verification/${uid}`);
    if (expires == undefined) return;
    const timer = setInterval(()=>{
        const now = Date.now();
        if (expires <= now) {
            clearInterval(timer);
            $('#timer').classList.toggle('d-none');
            $('[data-lang="expires-in"]').classList.toggle('d-none');
            $('[data-lang="code-expired"]').classList.toggle('d-none');
            return;
        };
        const minutes = Math.floor((expires - now + 1000) / 60 / 1000);
        const seconds = Math.round((expires - now) / 1000) % 60;
        $('#timer').innerText = `0${minutes}:${(seconds / 100).toFixed(2).toString().slice(-2)}`;
    }, 1000)
}

const processVerification = async () => {
    event.preventDefault();
    
    const uid = currentUserId();
    const { verifyCode: { code, expires }, userData} = await REMOTE_getData(`verification/${uid}`);
    
    const inputCode = [...$$('input')].map(input => input.value).join('');
    
    if (code !== inputCode) {
        $$('.error')[0].classList.add('active');
        return;
    }
    if (expires < Date.now()) {
        $$('.error')[1].classList.add('active');
        return;
    }
    const newUser = new User(userData);
    await newUser.verify();
    goTo('init/create_account/create_account', {search: `?uid=${userData.id}`});
}

const sendNewCode = async () => {
    event.preventDefault();
    const { userData } = await REMOTE_getData(`verification/${currentUserId()}`);
    const user = new User(userData);
    user.initVerification();
}

const incrementCodeInputField = () => {
    const input = event.currentTarget;
    if (input.value.length !== 1) return;
    if (event.key == 'Backspace') {
        input.value = '';
        input.previousElementSibling?.focus();
    } else if (isLetterOrNumber(event.key)) {
        input.nextElementSibling?.focus();
        try {
            input.nextElementSibling.value = event.key;
        } catch (e) {}
    }
    event.preventDefault();
}

const fillCodeInputs = (code) => {
    $$('input').forEach((input, i) => setTimeout(()=>input.value = code[i], 200 * i))
}

const pasteCode = () => {
    event.preventDefault();
    const code = event.clipboardData.getData('text');
    fillCodeInputs(code);
}