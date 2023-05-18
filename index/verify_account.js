const incrementCodeInputField = () => {
    if (event.currentTarget.nextElementSibling !== null && event.key !== 'Backspace'){
        event.currentTarget.nextElementSibling.focus()
    }
    if (event.currentTarget.previousElementSibling !== null && event.key == 'Backspace') {
        event.currentTarget.previousElementSibling.focus();
    }
}