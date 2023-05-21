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