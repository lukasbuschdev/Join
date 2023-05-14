const log = console.log;

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const show = selector => $(selector).classList.remove('d-none'); 
const hide = selector => $(selector).classList.add('d-none'); 

const toggleActiveBtn = (buttons) => {
    buttons.forEach(button => button.classList.toggle('active', button == event.currentTarget))
}

const addNavToggleBtns = () => {
    $$('nav').forEach(
        navbar => navbar.querySelectorAll('button').forEach(
            button => button.addEventListener('click', () => toggleActiveBtn(navbar.querySelectorAll('button')))
        )
    )
}