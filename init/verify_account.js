const initVerifyAccount = () => {
    LANG_load();
    initTimer();
    // redirect();
    checkEmailVerification();
}

const checkEmailVerification = async () => {
    const uid = currentUserId();
    const { verifyCode: { code } } = await REMOTE_getData(`verification/${uid}`)
    if (new URLSearchParams(location.search).get('token') !== code) return;
    fillCodeInputs(code);
}

const redirect = () => {
    const searchParams = new URLSearchParams(document.location.search);
    const newUserdata = LOCAL_getData('user');
    const id = (newUserdata !== null) ? newUserdata.id : false;
    if (searchParams.get('uid') == null || newUserdata == false || !(searchParams.get('uid') == id)) goTo(`./init.html?redirect`)
}

const initTimer = async () => {
    const uid = currentUserId();
    const { verifyCode: { expires } } = await REMOTE_getData(`verification/${uid}`);
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
    const { verifyCode: { code, expires }, userData } = await REMOTE_getData(`verification/${uid}`);
    
    const inputCode = [...$$('input')].map(input => input.value).join('');
    
    if (code !== inputCode) {
        $$('.error')[0].classList.add('active');
        return;
    }
    if (expires < Date.now()) {
        $$('.error')[1].classList.add('active');
        return;
    }
    // await REMOTE_removeData(`verification/${newUserdata.id}`);
    const newUser = new User(userData);
    newUser.verify();
}

const sendNewCode = () => {
    event.preventDefault();
    const userData = LOCAL_getData('user');
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

const isLetterOrNumber = (input) => input.length == 1 && /([a-z]|[A-Z]|[0-9])/.test(input)

const pasteCode = () => {
    event.preventDefault();
    const code = event.clipboardData.getData('text');
    fillCodeInputs(code)
}