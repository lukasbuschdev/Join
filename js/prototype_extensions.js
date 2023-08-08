NodeList.prototype.for = function(cb) {
    for (let i = 0; i < this.length; i++){
        cb(this[i], i);
    }
}

Array.prototype.for = function(cb) {
    for (let i = 0; i < this.length; i++){
        cb(this[i], i);
    }
}

Array.prototype.toObject = function (keys) {
    if (keys.length < this.length) {
        console.error('not enough keys provided!');
        return;
    }
    return this.reduce((total, current, i) => { return {...total, [keys[i]]: current }}, {});
}

Object.prototype.filter = function (cb) {
    let newObj = {};
    Object.entries(this).filter(([key, value]) =>
        {
            if (cb(value) == true) {
                newObj[key] = value;
                return true;
            }
        }
    );
    return newObj;
}

Object.prototype.for = function (cb) {
    Object.values(this).for(cb);
}

Object.prototype.map = function(cb){
    let newObj = {};
    Object.entries(this).for(([key, value]) =>
        {
            newObj[key] = cb(value);
        }
    );
    return newObj;
}

String.prototype.convert = function () {
    return this.replaceAll(/[A-Z]/g, i => `-${i.toLowerCase()}`);
}

HTMLElement.prototype.includeTemplate = async function(url = this.getAttribute('include-template') || '') {
    if (!url) return;
    const template = await (await fetch(url)).text();
    this.innerHTML = template;
    this.$$('[data-shadow]').for(scrollContainer => scrollContainer.addScrollShadow());
    LANG_load();
}

HTMLElement.prototype.$ = function (sel) {
    return this.querySelector(sel);
}

HTMLElement.prototype.$$ = function (sel) {
    return this.querySelectorAll(sel);
}

HTMLDialogElement.prototype.openModal = function () {
    this.showModal();
    if (this.classList.contains('big-modal')) {
        this.classList.add('active');
    };
    this.inert = false;
    this.addEventListener('mousedown', closeHandler = () => {
        if (this.$('div').contains(event.target)) return;
        this.$('.notification')?.classList.remove('anim-notification');
        this.closeModal();
        this.inert = true;
    });
    if (this.classList.contains('dlg-notification')) {
        this.showNotification();
    }
    initMenus();
}

HTMLDialogElement.prototype.closeModal = function () {
    if (this.classList.contains('big-modal')) {
        this.addEventListener('transitionend', () => this.close(), {once: true});
        this.classList.remove('active');
    } else {
        this.close();
    }
    this.removeEventListener('mousedown', closeHandler);
}

HTMLDialogElement.prototype.showNotification = function () {
    this.$('.notification').classList.add('anim-notification');
    this.$('.notification').addEventListener('animationcancel', abortHandler = () => {
        event.currentTarget.removeEventListener('animationend', completionHandler)
    }, { once: true });
    this.$('.notification').addEventListener('animationend', completionHandler = ()=>{
        event.currentTarget.removeEventListener('animationcancel', abortHandler);
        event.currentTarget.classList.remove('anim-notification');
        log('closing');
        this.closeModal();
    }, { once: true });
}

let shadowObservers = {};

HTMLElement.prototype.addScrollShadow = function () {
    const [direction, color] = this.dataset.shadow.split('/');
    const shadowWrapper = document.createElement('div');
    shadowWrapper.classList.add('scroll-shadow');
    shadowWrapper.style.setProperty('--direction', (direction == "ud") ? 'to bottom' : 'to right');
    shadowWrapper.style.setProperty('--clr', color);
    shadowWrapper.innerHTML = this.outerHTML;
    this.replaceWith(shadowWrapper);
    log(shadowWrapper.classList.value)
    shadowWrapper.addScrollShadowObserver();
};

HTMLElement.prototype.addScrollShadowObserver = function () {
    if (!this.classList.contains('scroll-shadow')) return error('not a srcoll-shadow container!');
    const scrollContainer = this.children[0];
    const newId = Object.values(shadowObservers).length;

    this.dataset.observerId = newId;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
        log(entry, entry.isIntersecting);
    }, {root: scrollContainer});
    intersectionObserver.observe(scrollContainer.children[0]);
    intersectionObserver.observe([...scrollContainer.children].at(-1));
    shadowObservers[newId] = intersectionObserver;
}

HTMLElement.prototype.LANG_load = function() {
    this.$$('[data-lang]').for(element => element.innerText = LANG[element.dataset.lang]);
    this.$$('[data-lang-placeholder]').for(input => input.placeholder = LANG[input.dataset.langPlaceholder])
};

HTMLElement.prototype.toggleDropDown = function () {
    const drpWrapper = this.closest('.drp-wrapper');
    if (!drpWrapper) return;
    drpWrapper.toggleActive();
    window.addEventListener('click', closeHandler = () => {
        if (drpWrapper.contains(event.target)) return;
        drpWrapper.toggleActive();
        window.removeEventListener('click', closeHander);
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
    // this.innerHTML = '';

    const docFrag = document.createDocumentFragment();
    items.for(item => {
        const newItem = document.createElement('div');
        newItem.innerHTML = templateFunction(item);
        docFrag.append(...newItem.childNodes);
    });
    this.appendChild(docFrag);
}