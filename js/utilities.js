const log = console.log;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const show = (selector) => $(selector).classList.remove("d-none");
const hide = (selector) => $(selector).classList.add("d-none");

const toggleActiveBtn = (buttons) => {
  buttons.forEach((button) =>

    button.classList.toggle("active", button == event.currentTarget)
  );
};

const addNavToggleBtns = () => {
  $$("nav").forEach((navbar) =>
    navbar
      .querySelectorAll("button")
      .forEach((button) =>
        button.addEventListener("click", () =>
          toggleActiveBtn(navbar.querySelectorAll("button"))
        )
      )
  );
};

const debounce = (cb, delay = 1000) => {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

const includeTemplates = async () => {
  $$('[include-template]').forEach(
    async templateContainer => {
      const url = templateContainer.getAttribute('include-template');
      const template = await ((await fetch(url)).text());
      templateContainer.innerHTML = template;
    }
  );
  return new Promise(resolve => {
    setTimeout(resolve, 100);
  })
}

const goToPage = (page) => {
  location.href = page;
}

const generateVerificationCode = () => {
  const charSet = 'abcdefghijlkmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += charSet[(Math.floor(Math.random() * charSet.length))];
  }
  return code;
}