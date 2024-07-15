import { confirmationTemplate } from "../assets/templates/index/confirmation_template.js";
import { LANG } from "./language.js";
import { STORAGE } from "./storage.js";

export const log = console.log;
export const error = console.error;

/**
 * shortcut of document.querySelector
 * @param {string} selectors 
 * @returns {HTMLElement | null}
 */
export function $(selectors) {
  return document.querySelector(selectors)
};

/**
 * shortcut of document.querySelectorAll()
 * @param {string} selector
 * @returns {Element[]}
 */
export function $$(selector) {
  return [...document.querySelectorAll(selector)]
};

/**
 * returns the current directory name
 * @param {string} path
 * @returns {'login' | 'signup' | 'forgot_password' | 'reset_password' | 'create_account' | 'verification' | 'summary' | 'board' | 'add_task' | 'contacts' | 'help' | 'privacy' | 'legal_notice' | 'privacy'}
 */
export function currentDirectory(path = window.location.pathname) {
  return path.split('/').at(-1).split('.')[0].replace('-', '_')
}

/**
 * shows an element specified by its selector
 * @param {string} selectors 
 * @returns {void}
*/
export function show(selectors) {
  $(selectors)?.classList.remove('d-none')
}

/**
 * hides an element specified by its selector
 * @param {string} selectors 
 * @returns {void}
*/
export function hide(selectors) {
  $(selectors)?.classList.add("d-none");
}

/**
 * callback to toggle the 'active' class on a set of buttons. Only use as EventListerner!!!
 * @param {NodeListOf<HTMLButtonElement> | HTMLButtonElement[]} buttons
 */
export async function toggleActiveBtn(buttons) {
  buttons.forEach((button) => button.classList.toggle("active", button === event.currentTarget));
};

/**
 * adds the toggleActiveBtn() callback to all nav buttons
 */
export function addNavToggleBtns() {
  $$('nav button').forEach((btn, i, buttons) => btn.addEventListener("click", toggleActiveBtn.bind(btn, buttons)))
};

/**
 * toggles the 'active' class on the provided error containers
 * @param {...{string, boolean}} errors 
 */
export function throwErrors(...errors) {
  errors.for(({identifier, bool}) => {
    const errorContainer = $(`#${identifier}`);
    if (!errorContainer) console.log(identifier)
    const inputContainer = errorContainer.closest('.inp-wrapper')?.$('.inp-container');
    errorContainer.classList.toggle('active', bool);
    inputContainer?.classList.toggle('active', bool);
  });
}

/**
 * adds a notification popup to the screen which fades out
 * @param {string} languageKey 
 */
export const notification = (languageKey) => {
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
export function popUpNotificationTemplate(languageKey) {
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
export function debounce(cb, delay = 1000) {
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
export function throttle (cb, delay = 1000) {
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
export function includeTemplates() {
  return new Promise(async (resolve) => {
    const data = await Promise.all($$('[include-template]')?.map((templateContainer) => templateContainer.includeTemplate()));
    window.dispatchEvent(new CustomEvent("templatesIncluded"))
    resolve(data)
  })
}

/**
 * returns the content of a template as text
 * @param {string} url path of the template 
 * @returns {Promise<string>}
 */
export async function getTemplate(url) {
    return (await fetch(url)).text();
}

/**
 * custom eval() implementation
 * @param {string} evalString
 */
export function parse(evalString) {
  return Function(`'use strict'; return (${evalString}) ?? false`)();
}

/**
 * returns the current url search params
 * @returns {URLSearchParams}
 */
export function searchParams() {
  return new URLSearchParams(document.location.search);
}

/**
 * TO DO
 * @returns 
 */
export const submitUpload = async () => {
  const img = $('[type="file"]').files[0];
  if (!img) return;
  if (isInvalidImg(img)) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const arrayBuffer = e.target.result;
    STORAGE.webSocket.socket.emit('uploadImg', arrayBuffer);
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
export function isInvalidImg(file) {
  const maxSize = 1024 * 1024;
  const fileTooLarge = file.size > maxSize
  throwErrors({ identifier: 'img-too-large', bool: fileTooLarge });
  return fileTooLarge
}

/**
 * creates a promise which resolves to the url of the user image when the websocket emits the 'imgURL' event
 * @returns {Promise<string>}
 */
export function getImgUrl() {
  return new Promise(resolve => {
    STORAGE.webSocket.socket.on('imgURL', async (imgURL) => {
          const uid = currentUserId();
          STORAGE.set(`users/${uid}`, {img: imgURL});
          resolve(imgURL);
      });
  });
}

/**
 * TO DO
 * @param {string} imgURL 
 */
export function renderUploadedImg(imgURL) {
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

export const removeUpload = async () => {
  if (event.target.tagName == "LABEL" || event.target.tagName == "INPUT") return;
  const container = event.currentTarget;
  if (!($('#color-wheel').classList.contains('d-none'))) return;
  const img = container.$('img');
  if (container.dataset.img === 'false') return;
  
  $('[type="file"]').value = '';
  container.dataset.img = 'false';
  img.src = '';
  STORAGE.webSocket.socket.emit('deleteImg');
  const user = STORAGE.currentUser;
  if (user) {
    user.img = "";
    await user.update();
    renderUserData();
  }
}

export function renderColorWheel() {
  let clrBg = [];
  const factor = 12;
  for (let i = 0; i < 361; i+= 360 / factor) {
      clrBg.push(`hsl(${i}, 100%, 50%)`)
  }
  $('#color-wheel').style.backgroundImage = `radial-gradient(white, transparent, black), conic-gradient(${clrBg.join(', ')})`;
}

export function toggleColorPicker() {
  event.stopPropagation();
  $('#color-wheel').classList.toggle('d-none');
  $('label').classList.toggle('d-none');
  if (event.currentTarget.classList.contains('active') && $('.user-img-container').style.getPropertyValue('--user-clr') == false) {
      $('#color-cursor').classList.add('d-none');
      $('#accept-user-color').classList.remove('active');
  }
  $('#user-color').classList.toggle('active');
}

export function pickColor() {
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

export function getFraction(numerator, denominator, range = 1) {
    return numerator / (denominator / range);
}

export function moveColorCursor(offsetX, offsetY, userColor) {
  const colorCursor = $('#color-cursor');
  colorCursor.classList.remove('d-none');
  colorCursor.style.setProperty('--x', offsetX);
  colorCursor.style.setProperty('--y', offsetY);
  colorCursor.style.backgroundColor = userColor;
}

export function addAcceptColor(userColor) {
  $('#accept-user-color').classList.add('active');
  $('label').classList.remove('border');

  let colorPicker
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

export function getRGBfromString(colorString) {
  if (!(typeof colorString == 'string')) return colorString;
  const a = document.createElement('div');
  a.style.color = colorString;
  $('body').append(a);
  const rgb = (getComputedStyle(a).color)
  a.remove();
  return rgb;
}

export function getRGBA(color) {
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

export function getRange(min, max, factor) {
    return min + (factor * max - factor * min)
}

/**
 * tests if the input string is a letter or a number
 * @param {string} input 
 * @returns {boolean}
 */
export function isLetterOrNumber(input) {
  return input.length == 1 && /([a-z]|[A-Z]|[0-9])/.test(input);
}

/**
 * TO DO
 */
export async function confirmation(type, cb) {
  const dataLang = (type.includes(',')) ? type.slice(0, type.indexOf(',')) : type;
  if (!LANG.currentLangData[`confirmation-${dataLang}`]) return error('message unknown!');
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
 * if 'input' is a valid date (and the date is in the future), a new date is returned. if invalid, returns undefined
 * @param {string} input 
 * @returns {Date | undefined}
 */
export function dateFormat(input) {
  if (typeof input !== "string") return;
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(input)) return;

  const [day, month, year] = input.split('/');
  const date = new Date(year, month - 1, day);
  if (isInvalidDate(input, date)) return

  const now = Date.now();
  if (date < now || date.getDate() !== date.getDate()) return;
  return date;
}

/**
 * tests whether the date given as a string is a valid date for a deadline
 * @param {string} input 
 * @param {Date} output 
 * @returns {boolean}
 */
export function isInvalidDate (input, output) {
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
export async function hashInputValue(inputValue) {
  const encoder = new TextEncoder();
  const data = encoder.encode(inputValue);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function renderUserData() {
    const { name, img, color } = STORAGE.currentUser;
    (this ?? document.documentElement).$$('[data-user-data]').forEach(
        (userField) => {
            const dataType = userField.dataset.userData;
            switch (dataType) {
                case "img": return renderImage(userField, img);
                case "name": return renderName(userField, name);
                case "initials": return renderInitials(userField, name);
                case "color": return renderColor(userField, color);
                default: return;
            }
        }
    );
}

export function currentUserId() {
    return (searchParams().get('uid') == null) ? undefined : `${searchParams().get('uid')}`;
}

export const menuOptionInitator = new MutationObserver(([{target}]) => target.parentElement.closest('[type = "menu"]').initMenus());

export const mutationObserverOptions = {
    childList: true,
    subTree: true
};

export const resetMenus = function () {
    menuOptionInitator.disconnect();
    this.$$('[type = "menu"]').for(menu => menuOptionInitator.observe(menu, mutationObserverOptions));
}

let inactivityTimer;
export function addInactivityTimer(minutes = 5) {
    return inactivityTimer = setTimeout(() => goTo('init/login/login', { search: '?expired' }), minutes * 60 * 1000);
}

export const initInactivity = () => {
    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState == "hidden") return addInactivityTimer();
        clearTimeout(inactivityTimer);
    });
}

export const renderName = (userField, name) => {
    userField.innerText = name;
};
export const renderImage = (userField, img) => {
    userField.src = img;
};
export const renderInitials = (userField, name) => {
    userField.innerText = name.slice(0, 2).toUpperCase();
};
export const renderColor = (userField, color) => {
    userField.style.setProperty('--user-clr', color);
};

export function cloneDeep(input) {
  return JSON.parse(JSON.stringify(input))
}

/**
 * parses the specified directory and reloads the current page to it
 * @param {string} directory 
 * @param {any} options 
 */
export const goTo = (directory, options) => {
    const url = `${window.location.origin}/Join/${directory}.html${(options?.search ?? location.search)}`
    window.location.href = url;
}


export function isEqual(obj1, obj2, depth = Infinity) {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) return false;

    if (depth > 0) {
        for (let key of keys1) {
            if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key], depth - 1)) {
                return false;
            }
        }
    }
    return true;
}