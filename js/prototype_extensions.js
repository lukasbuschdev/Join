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

Array.prototype.forAwait = async function(cb) {
    for (let i = 0; i < this.length; i++){
        await cb(this[i], i);
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
    Object.entries(this).filter(([key, value], index) =>
        {
            if (cb(value, index) == true) {
                newObj[key] = value;
                return true;
            }
        }
    );
    return newObj;
}

Object.prototype.for = function (cb) {
    Object.values(this).for(cb);
};

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
    shadowObservers = {};
    this.$$('[data-shadow]').for(scrollContainer => scrollContainer.addScrollShadow());
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
    if (this.classList.contains('big-modal')) {
        this.classList.add('active');
    };
    this.inert = false;

    const handlerId = Date.now();
    this.addEventListener('mousedown', window[handlerId] = () => {
        if (event.which == 3) return;
        if (this.getAttribute('static') == "true") return;
        if (![...this.$$(':scope > div')]
        .every(container => !container.contains(event.target))) return;
        
        this.$('.notification')?.classList.remove('anim-notification');
        this.closeModal(handlerId);
        this.inert = true;
    });

    if (this.classList.contains('dlg-notification')) {
        this.showNotification();
    };
    this.$$('[data-shadow]')?.for(scrollContainer => scrollContainer.addScrollShadow());
    this.initMenus();
    this.LANG_load();
}

HTMLDialogElement.prototype.closeModal = function (handlerId) {
    if (this.classList.contains('big-modal')) {
        this.addEventListener('transitionend', () => this.close(), {once: true});
        this.classList.remove('active');
    } else {
        this.close();
    }
    this.removeEventListener('mousedown', window[handlerId]);
}

HTMLDialogElement.prototype.showNotification = function () {
    this.$('.notification').classList.add('anim-notification');
    this.$('.notification').addEventListener('animationcancel', abortHandler = () => {
        event.currentTarget.removeEventListener('animationend', completionHandler)
    }, { once: true });
    this.$('.notification').addEventListener('animationend', completionHandler = ()=>{
        event.currentTarget.removeEventListener('animationcancel', abortHandler);
        event.currentTarget.classList.remove('anim-notification');
        this.closeModal();
    }, { once: true });
}

let shadowObservers = {};

HTMLElement.prototype.addScrollShadow = function () {
    if (!this.classList.contains('shadow-container') && !this.$('.shadow-container')) return;
    const [direction, color, thickness] = this.dataset.shadow.split('/');
    const shadowWrapper = document.createElement('div');
    shadowWrapper.classList.add('scroll-shadow');
    shadowWrapper.classList.add(direction);
    shadowWrapper.style.setProperty('--direction', (direction == "ud") ? 'to bottom' : 'to right');
    shadowWrapper.style.setProperty('--clr', color);
    shadowWrapper.style.setProperty('--thickness', thickness);
    shadowWrapper.innerHTML = this.outerHTML;
    this.replaceWith(shadowWrapper);
    shadowWrapper.addScrollShadowObserver();
};

HTMLElement.prototype.addScrollShadowObserver = function () {
    if (!this.classList.contains('scroll-shadow')) return error('not a srcoll-shadow container!');
    const scrollContainer = this.$('.shadow-container');
    const newId = Object.values(shadowObservers).length;

    this.dataset.observerId = newId;
    const intersectionObserver = new IntersectionObserver((entries) => {
        entries.for(({target, isIntersecting}) => {
            if (!target.previousElementSibling) this.style.setProperty('--shadow-before', (isIntersecting) ? '0' : '1');
            if (!target.nextElementSibling) this.style.setProperty('--shadow-after', (isIntersecting) ? '0' : '1');
        });
    }, {root: scrollContainer.parentElement, threshold: .98});
    shadowObservers[newId] = intersectionObserver;

    const observe = (target) => {
        const observer = shadowObservers[this.dataset.observerId];
        observer.disconnect();
        const children = [...target.children]
        if (children.length == 0) return;
        const targets = [children[0]];
        if (children.length > 1) {
            targets.push(children.at(-1));
        }
        targets.for(container => observer.observe(container));
    }
    observe(scrollContainer);
    const mutationObserver = new MutationObserver(([{target}]) => {
        observe(target);
    });
    mutationObserver.observe(scrollContainer, {subtree: true, childList: true});
}

HTMLElement.prototype.LANG_load = function() {
    this.$$('[data-lang]').for(element => element.innerText = LANG[element.dataset.lang]);
    this.$$('[data-lang-placeholder]').for(input => input.placeholder = LANG[input.dataset.langPlaceholder])
};

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
    // this.innerHTML = '';

    const docFrag = document.createDocumentFragment();
    items.for(item => {
        const newItem = document.createElement('div');
        newItem.innerHTML = templateFunction(item);
        docFrag.append(...newItem.childNodes);
    });
    this.appendChild(docFrag);
}