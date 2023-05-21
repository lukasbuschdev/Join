const initPage = () => {
    initTimer();
}

const initTimer = async () => {
    const newUserdata = LOCAL_getItem('user');
    const { expires } = await REMOTE_getItem('verification', newUserdata.id);
    // const expires = Date.now() + 65 * 1000;
    const timer = setInterval(()=>{
        const now = Date.now();
        if (expires <= now) {
            clearInterval(timer);
            $('#timer-wrapper').innerText = 'Code Expired!'
            return;
        };
        const minutes = Math.floor((expires - now + 1000) / 60 / 1000);
        const seconds = Math.round((expires - now) / 1000) % 60;
        $('#timer').innerText = `0${minutes}:${(seconds / 100).toFixed(2).toString().slice(-2)}`;
    }, 1000)
}

const processVerification = async () => {
    event.preventDefault();
    
    const newUserdata = LOCAL_getItem('user');
    const newUser = new User(newUserdata);
    const { code, expires } = await REMOTE_getItem('verification', newUserdata.id);
    
    const inputCode = [...$$('input')].map(input => input.value).join('');
    
    if (code !== inputCode) {
        $$('.error')[0].classList.add('active');
        return;
    }
    if (expires < Date.now()) {
        $$('.error')[1].classList.add('active');
        return;
    }
    await REMOTE_removeItem('verification', newUserdata.id);
    LOCAL_removeItem('user');
    newUser.verify();
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

const isLetterOrNumber = (input) => input.length == 1 && /([a-z]|[A-Z]|[0-9])/.test(input)