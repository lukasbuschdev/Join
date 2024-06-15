const log = console.log;
const error = console.error;

/**
 * shortcut of document.querySelector
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} selectors 
 * @returns {HTMLElementTagNameMap[K]}
 */
function $(selectors) {
  return document.querySelector(selectors)
};

/**
 * shortcut of document.querySelectorAll()
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} selector
 * @returns {HTMLElementTagNameMap[T][]}
 */
function $$(selector) {
  return [...document.querySelectorAll(selector)]
};

/**
 * returns the current directory name
 * @returns {'login' | 'signup' | 'forgot_password' | 'reset_password' | 'create_account' | 'verification' | 'summary' | 'board' | 'add_task' | 'contacts' | 'help' | 'privacy' | 'legal_notice' | 'privacy'}
 */
function currentDirectory() {
  return window.location.pathname.split('/').at(-1).split('.')[0]
}

/**
 * shows an element specified by its selector
 * @param {string} selectors 
 * @returns {void}
*/
function show(selectors) {
  $(selectors)?.classList.remove('d-none')
}

/**
 * hides an element specified by its selector
 * @param {string} selectors 
 * @returns {void}
*/
function hide(selectors) {
  $(selectors)?.classList.add("d-none");
}

/**
 * callback to toggle the 'active' class on a set of buttons. Only use as EventListerner!!!
 * @param {NodeListOf<HTMLButtonElement> | HTMLButtonElement[]} buttons
 */
async function toggleActiveBtn(buttons) {
  buttons.forEach((button) => button.classList.toggle("active", button === event.currentTarget));
};

/**
 * adds the toggleActiveBtn() callback to all nav buttons
 */
function addNavToggleBtns() {
  $$('nav button').forEach((btn, i, buttons) => btn.addEventListener("click", toggleActiveBtn.bind(btn, buttons)))
};

/**
 * toggles the 'active' class on the provided error containers
 * @param {...{string, boolean}} errors 
 */
function throwErrors(...errors) {
  errors.for(({identifier, bool}) => {
    const errorContainer = $(`#${identifier}`);
    const inputContainer = errorContainer.closest('.inp-wrapper')?.$('.inp-container');
    errorContainer.classList.toggle('active', bool);
    inputContainer?.classList.toggle('active', bool);
  });
}

/**
 * adds a notification popup to the screen which fades out
 * @param {string} languageKey 
 */
const notification = (languageKey) => {
  return new Promise(resolve => {
    const el = document.createElement('dialog');
    el.type = "modal";
    el.classList.value = "dlg-notification";
    $('body').append(el);
    el.innerHTML = popUpNotificationTemplate(languageKey);
    el.LANG_load();
    el.openModal();
    el.addEventListener("close", () => {
      el.remove();
      resolve();
    });
  });
}

/**
 * template for popup
 * @param {string} languageKey keyof LANG
 * @returns {string}
 */
function popUpNotificationTemplate(languageKey) {
  return /*html*/`
  <div class="notification grid-center">
      <span data-lang="${languageKey}"></span>
  </div>`
}

/**
 * returns a debounced function from an input callback function
 * @template T
 * @param {(...params: any[]) => T} cb callback function
 * @param {number} [delay] idle time in miliseconds before execition (1000 default)
 * @returns {(...params: any[]) => T}
 */
function debounce(cb, delay = 1000) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

/**
 * returns a throttled function from an input callback function
 * @template T
 * @param {(...params: any[]) => T} cb callback function 
 * @param {number} [delay] cooldown time in miliseconds (1000 default) 
 * @returns {(...params: any[]) => T}
 */
function throttle (cb, delay = 1000) {
  let shouldWait = false;
  return (...args) => {
      if (shouldWait) return;
      cb(...args);
      shouldWait = true;
      setTimeout(() => shouldWait = false, delay);
  }
}

/**
 * renders into elements with the 'include-template' attribute
 * @returns {Promise<void[]>}
 */
async function includeTemplates() {
  return Promise.all($$('[include-template]')?.map((templateContainer) => templateContainer.includeTemplate()))
}

/**
 * returns the content of a template as text
 * @param {string} url path of the template 
 * @returns {Promise<string>}
 */
async function getTemplate(url) {
    return (await fetch(url)).text();
}

/**
 * custom eval() implementation
 * @param {string} evalString
 */
function parse(evalString) {
  return Function(`'use strict'; return (${evalString}) ?? false`)();
}

/**
 * returns the current url search params
 * @returns {URLSearchParams}
 */
function searchParams() {
  return new URLSearchParams(document.location.search);
}

/**
 * TO DO
 * @returns 
 */
const submitUpload = async () => {
  const img = $('[type="file"]').files[0];
  if (!img) return;
  if (isInvalidImg(img)) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const arrayBuffer = e.target.result;
    SOCKET.emit('uploadImg', arrayBuffer);
  }
  reader.readAsArrayBuffer(img)
  $('.loading').classList.add('active');
  
  const imgURL = await getImgUrl();

  renderUploadedImg(imgURL);
}

/**
 * checks if file size is biggaer than 1MB and throws errors accordingly
 * @param {File} file 
 * @returns {boolean}
 */
function isInvalidImg(file) {
  const maxSize = 1024 * 1024;
  const fileTooLarge = file.size > maxSize
  throwErrors({ identifier: 'img-too-large', bool: fileTooLarge });
  return fileTooLarge
}

/**
 * creates a promise which resolves to the url of the user image when the websocket emits the 'imgURL' event
 * @returns {Promise<string>}
 */
function getImgUrl() {
  return new Promise(resolve => {
    SOCKET.on('imgURL', async (imgURL) => {
          const uid = currentUserId();
          REMOTE_setData(`users/${uid}`, {img: imgURL});
          resolve(imgURL);
      });
  });
}

/**
 * TO DO
 * @param {string} imgURL 
 */
function renderUploadedImg(imgURL) {
  const imgContainer = $('.user-img');
  imgContainer.src = imgURL;
  imgContainer.onload = () => {
      $('.loading').classList.remove('active');
      $('[type="file"]').value = '';
      $('.account.user-img-container').dataset.img = 'true';
  }
  if (typeof USER !== "undefined") {
      USER.img = imgURL;
      renderUserData();
  }  
}

const removeUpload = async () => {
  if (event.target.tagName == "LABEL" || event.target.tagName == "INPUT") return;
  const container = event.currentTarget;
  if (!($('#color-wheel').classList.contains('d-none'))) return;
  const img = container.$('img');
  if (container.dataset.img === 'false') return;
  
  $('[type="file"]').value = '';
  container.dataset.img = 'false';
  img.src = '';
  SOCKET.emit('deleteImg');
  if (typeof USER !== "undefined") {
    USER.img = "";
    renderUserData();
  }
  REMOTE_setData(`users/${currentUserId()}`, {img: ""});
}

const renderColorWheel = () => {
  let clrBg = [];
  const factor = 12;
  for (let i = 0; i < 361; i+= 360 / factor) {
      clrBg.push(`hsl(${i}, 100%, 50%)`)
  }
  $('#color-wheel').style.backgroundImage = `radial-gradient(white, transparent, black), conic-gradient(${clrBg.join(', ')})`;
}

const toggleColorPicker = () => {
  event.stopPropagation();
  $('#color-wheel').classList.toggle('d-none');
  $('label').classList.toggle('d-none');
  if (event.currentTarget.classList.contains('active') && $('.user-img-container').style.getPropertyValue('--user-clr') == false) {
      $('#color-cursor').classList.add('d-none');
      $('#accept-user-color').classList.remove('active');
  }
  $('#user-color').classList.toggle('active');
}

const pickColor = () => {
  const width = event.currentTarget.offsetWidth;
  const heigth = event.currentTarget.offsetHeight;
  const { offsetX, offsetY } = event;
  const x = offsetX - width / 2;
  const y = offsetY - heigth / 2;

  const hue = Math.round((Math.atan2(y, x) * (180 / Math.PI)) + 450) % 360;
  const lightness = 30 - Math.round(getFraction(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) * 60, width / 2));
  const userColor = `hsl(${hue}, 100%, ${50 + lightness}%)`

  moveColorCursor(offsetX, offsetY, userColor);
  addAcceptColor(userColor);
}

function getFraction(numerator, denominator, range = 1) {
    return numerator / (denominator / range);
}

const moveColorCursor = (offsetX, offsetY, userColor) => {
  const colorCursor = $('#color-cursor');
  colorCursor.classList.remove('d-none');
  colorCursor.style.setProperty('--x', offsetX);
  colorCursor.style.setProperty('--y', offsetY);
  colorCursor.style.backgroundColor = userColor;
}

const addAcceptColor = (userColor) => {
  $('#accept-user-color').classList.add('active');
  $('label').classList.remove('border');
  try {$('#accept-user-color').removeEventListener("click", colorPicker, { once: true })}catch(e){};
  $('#accept-user-color').addEventListener("click", colorPicker = () => {
      event.stopPropagation();
      $$('.user-img-container.account').for(button => button.style.setProperty('--user-clr', userColor));
      if (typeof USER !== "undefined") {
          USER.color = userColor;
          USER.update();
          renderUserData();
      };
      $('#user-color').click();
  }, { once: true });
}

const getRGBfromString = (colorString) => {
  if (!(typeof colorString == 'string')) return colorString;
  const a = document.createElement('div');
  a.style.color = colorString;
  $('body').append(a);
  const rgb = (getComputedStyle(a).color)
  a.remove();
  return rgb;
}

const getRGBA = (color) => {
  if (!color.includes("rgb")) {
    const rgb = getRGBfromString(color);
    if (rgb) color = rgb;
  };
  const r = Number(color.match(/(?<=\()\d+(?=,)/g)[0]);
  const g = Number(color.match(/(?<=,\s{0,1})\d+(?=,)/g)[0]);
  const b = (color.includes("rgba")) ? Number(color.match(/(?<=,\s{0,1})\d+(?=,)/g)[1]) : Number(color.match(/(?<=,\s{0,1})\d+(?=\))/g)[0]);
  const a = (color.includes("rgba")) ? Number(color.match(/(?<=,\s{0,1})[\d\.]+(?=\))/g)[0]) : 1;
  return {r, g, b, a}; 
}

function getRange(min, max, factor) {
    return min + (factor * max - factor * min)
}

/**
 * tests if the input string is a letter or a number
 * @param {string} input 
 * @returns {boolean}
 */
function isLetterOrNumber(input) {
  return input.length == 1 && /([a-z]|[A-Z]|[0-9])/.test(input);
}

/**
 * TO DO
 */
async function confirmation(type, cb) {
  const dataLang = (type.includes(',')) ? type.slice(0, type.indexOf(',')) : type;
  if (!LANG[`confirmation-${dataLang}`]) return error('message unknown!');
  const confirmationContainer = document.createElement('dialog');
  confirmationContainer.type = "modal";
  confirmationContainer.innerHTML = confirmationTemplate(type);
  confirmationContainer.LANG_load();
  confirmationContainer.$('.btn-primary').addEventListener('click', () => {
    cb();
    confirmationContainer.closeModal();
    confirmationContainer.remove()
  }, {once: true});

  $('body').append(confirmationContainer);
  confirmationContainer.openModal();
}

/**
 * if 'input' is a valid date, a new date is returned. if invalid, returns undefined
 * @param {string} input 
 * @returns {Date | undefined}
 */
const dateFormat = (input) => {
  if (typeof input !== "string") return;
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return;

  const [day, month, year] = input.split('/');
  const date = new Date(year, month - 1, day);
  if (isInvalidDate(input, date)) return

  const now = Date.now();
  if (date < now && date.getDate() !== date.getDate()) return;
  return date;
}

/**
 * tests whether the date given as a string is a valid date for a deadline
 * @param {string} input 
 * @param {Date} output 
 * @returns {boolean}
 */
function isInvalidDate (input, output) {
  const [, mI, yI] = input.split('/');
  const mO = output.getMonth() + 1;
  const yO = output.getFullYear();
  return !(Number(mI) == mO && Number(yI) == yO);
}

/**
 * gets a hashed input
 * @param {string} inputValue 
 * @returns {Promise<string>}
 */
async function hashInputValue(inputValue) {
  const encoder = new TextEncoder();
  const data = encoder.encode(inputValue);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}