NodeList.prototype.for = function(cb) {
    for (let i = 0; i < this.length; i++){
        cb(this[i]);
    }
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
    this.addEventListener('mousedown', closeHandler = () => {
        if (this.$('div').contains(event.target)) return;
        this.$('.notification')?.classList.remove('anim-notification')
        this.closeModal();
    });
    if (this.classList.contains('dlg-notification')) {
        this.showNotification();
    }
    initMenus();
}

HTMLDialogElement.prototype.closeModal = function () {
    this.close();
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
        log('closeHandler removed!')
    })
    log('closeHandler added!')
}

HTMLElement.prototype.toggleActive = function () {
    this.classList.toggle('active');
}
