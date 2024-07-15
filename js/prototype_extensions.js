import { LANG } from "./language.js";
import { renderUserData } from "./utilities.js";

NodeList.prototype.for = function(cb) {
    for (let i = 0; i < this.length; i++){
        cb(this[i], i);
    }
}

/**
 * askjdhaskjdhk
 * @param {*} cb 
 * @returns 
 */
Array.prototype.filteredMap = function(cb) {
    return this.reduce((filteredMap, item, index) => {
        const returnItem = cb(item, index, filteredMap)
        return (returnItem?.length ?? returnItem)
            ? [...filteredMap, returnItem]
            : filteredMap
    }, [])
}

/**
 * @template {*} T
 * @param {*} cb 
 * @param {*} depth 
 * @returns {number}
 * @this {Array<T>}
 */
Array.prototype.filteredFlatMap = function(cb, depth) {
    return this.filteredMap(cb).flat(depth)
}

/**
 * @returns {string}
 * @this {String}
 */
String.prototype.reverse = function() {
    return this.split('').reverse().join('')
}

Array.prototype.for = function(cb) {
    for (let i = 0; i < this.length; i++){
        cb(this[i], i);
    }
}

Array.prototype.forAwait = async function(cb) {
    for (let i = 0; i < this.length; i++){
        await cb(this[i], i);
    }
    return;
}

/**
 * returns an object literal where the array values are the values and keys are provided
 * @param {string[]} keys keys for the object as an array (has to be the same length as the array) 
 * @returns {[string]: any}}
 */
Array.prototype.toObject = function (keys) {
    if (keys.length < this.length) {
        console.error('not enough keys provided!');
        return;
    }
    return this.reduce((total, current, i) => ({...total, [keys[i]]: current }), {});
}

/**
 * returns a copy of the array without the specified item(s)
 * @param {T[]} items
 * @returns {boolean}
 *  */
Array.prototype.remove = function(...items) {
    items.forEach(item => {
        if (!this.includes(item)) return false;
        this.splice(this.indexOf(item), 1);
    })
}

Object.prototype.filter = function (cb) {
    return Object.entries(this).reduce((newObj, [key, value], index) => cb([key, value], index) ? ({ ...newObj, [key]: value}) : newObj, {})
}

Object.prototype.for = function (cb) {
    Object.values(this).for(cb);
};

Object.prototype.map = function(cb) {
    return Object.entries(this).reduce((newObj, [key, value]) => ({...newObj, [key]: cb(value) }), {});
}

String.prototype.convert = function () {
    return this.replaceAll(/[A-Z]/g, i => `-${i.toLowerCase()}`);
}

HTMLElement.prototype.includeTemplate = async function({url = this.getAttribute('include-template') || '', replace = true} = {}) {
    let template = await (await fetch(url)).text();
    if (replace && this.parentElement) this.outerHTML = template;
    else this.innerHTML = template;
}

HTMLElement.prototype.initMenus = function () {
    this.$$('[type = "menu"]').for(menu => {
        const allButtons = menu.$$('[type = "option"]');
        allButtons.for(button => {
                button.addEventListener('click', () => allButtons.for(
                button => button.classList.toggle('active', button == event.currentTarget)
            ))}
        );
    });
}

HTMLElement.prototype.$ = function (sel) {
    return this.querySelector(sel);
}

HTMLElement.prototype.$$ = function (sel) {
    return this.querySelectorAll(sel);
}

HTMLDialogElement.prototype.openModal = function () {
    this.showModal();
    let shouldBeAbleToBeClosed = false;
    if (this.classList.contains('big-modal')) {
        this.classList.add('active');
        this.addEventListener('transitionend', () => shouldBeAbleToBeClosed = true)
    } else {
        shouldBeAbleToBeClosed = true
    }
    this.inert = false;
    
    const handlerId = Date.now();
    
    this.addEventListener('pointerdown', window[handlerId] = () => {
        if (!shouldBeAbleToBeClosed) return;
        if (event.which == 3) return;
        if (this.getAttribute('static') == "true") return;
        if (![...this.$$(':scope > div')].every(container => !container.contains(event.target))) return;
        
        this.$('.notification')?.classList.remove('anim-notification');
        this.closeModal(handlerId);
        this.inert = true;
    });

    if (this.classList.contains('dlg-notification')) {
        this.showNotification();
    };
    this.initMenus();
    return this.LANG_load();
}

HTMLDialogElement.prototype.closeModal = function (handlerId) {
    if (this.classList.contains('big-modal')) {
        this.addEventListener('transitionend', () => this.close(), {once: true});
        this.classList.remove('active');
    } else {
        this.close();
    }
    this.removeEventListener('pointerdown', window[handlerId]);
}

HTMLDialogElement.prototype.showNotification = function () {
    let abortHandler, completionHandler
    this.$('.notification').classList.add('anim-notification');
    this.$('.notification').addEventListener('animationcancel', abortHandler = () => {
        event.currentTarget.removeEventListener('animationend', completionHandler)
    }, { once: true });
    this.$('.notification').addEventListener('animationend', completionHandler = () => {
        event.currentTarget.removeEventListener('animationcancel', abortHandler);
        event.currentTarget.classList.remove('anim-notification');
        this.closeModal();
    }, { once: true });
}

HTMLElement.prototype.LANG_load = function() {
    return LANG.render(this);
};

HTMLElement.prototype.renderUserData = function () {
    renderUserData.apply(this);
}

HTMLElement.prototype.toggleDropDown = function () {
    if (!this.closest('.drp-wrapper')) return;
    this.closest('.drp-wrapper').toggleActive();
    const functionName = Date.now();
    document.addEventListener('click', window[functionName] = () => {
        if (this.closest('.drp-wrapper').contains(event.target)) return;
        this.closest('.drp-wrapper').toggleActive();
        document.removeEventListener('click', window[functionName]);
        delete window[functionName];
    })
};

HTMLElement.prototype.toggleActive = function () {
    this.classList.toggle('active');
};

HTMLElement.prototype.updatePosition = function (x = 0, y = 0) {
    if (!this.style.getPropertyValue('--x')) return
    this.style.setProperty('--x', `${x}`);
    this.style.setProperty('--y', `${y}`);
}

HTMLElement.prototype.setTransitionSpeed = function (x = '', y = '') {
    const transitionSpeed = (x && y) ? `${ parseInt(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) / 2)}ms` : '';
    this.style.transitionDuration = transitionSpeed;
}

HTMLElement.prototype.triggerAnimation = function (className) {
    this.classList.add(className);
    this.addEventListener("animationend", endHandler = () => {
        this.classList.remove(className);
        this.removeEventListener("animationend", endHandler);
        this.removeEventListener("animationcancel", endHandler);
    });
    this.addEventListener("animationcancel", endHandler);
}

HTMLElement.prototype.hide = function () {
    this.classList.add('d-none');
}

HTMLElement.prototype.show = function () {
    this.classList.remove('d-none');
}

Math.roundTo = function (nbr, decimals) {
    return Math.round(nbr * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

HTMLElement.prototype.renderItems = function (items, templateFunction) {
    const docFrag = document.createDocumentFragment();
    items.for(item => {
        const newItem = document.createElement('div');
        newItem.innerHTML = templateFunction(item);
        docFrag.append(...newItem.childNodes);
    });
    this.appendChild(docFrag);
}

HTMLElement.prototype.textAnimation = async function (text, speed = 10) {
    this.innerText = '';
    let i = 0;
    const int = setInterval(() => {
      if (i + 1 == text.length) clearInterval(int);
      this.textContent += text[i];
      i++;
    }, speed);
  }