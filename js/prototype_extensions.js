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

String.prototype.convert = function () {
    return this.replaceAll(/[A-Z]/g, i => `-${i.toLowerCase()}`);
}

HTMLElement.prototype.includeTemplate = async function(url = this.getAttribute('include-template') || '') {
    if (!url) return;
    const template = await (await fetch(url)).text();
    this.innerHTML = template;
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
    }
    this.removeEventListener('mousedown', closeHandler);
}

HTMLDialogElement.prototype.showNotification = function () {
    this.$('.notification').classList.add('anim-notification');
    this.$('.notification').addEventListener('animationcancel', abortHandler = () => {
        event.currentTarget.removeEventListener('animationend', completionHandler)
    }, { once: true });
    this.$('.notification').addEventListener('animationend', completionHandler = ()=>{
        event.currentTarget.removeEventListener('animationcancel', abortHandler)
        event.currentTarget.classList.remove('anim-notification');
        this.closeModal();
    }, { once: true })
    
}

HTMLElement.prototype.toggleDropDown = function () {
    if (!this.closest('.drp-wrapper')) return;
    this.closest('.drp-wrapper').toggleActive();
    document.addEventListener('click', closeHandler = () => {
        if (this.closest('.drp-wrapper').contains(event.target)) return;
        this.closest('.drp-wrapper').toggleActive();
        document.removeEventListener('click', closeHandler);
    })
}

HTMLElement.prototype.toggleActive = function () {
    this.classList.toggle('active');
}

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
    items.for(item => {
        this.innerHTML += templateFunction(item);
    })
}