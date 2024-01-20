window.$ = function (selector) {
  return this.document.querySelector(selector)
};
window.$$ = function (selector) {
  return this.document.querySelectorAll(selector)
};

const currentDirectory = () => window.location.pathname.split('/').at(-1).split('.')[0]

const goTo = (directory, options) => {
    const url = `${window.location.origin}/Join/${directory}.html${(options?.search ?? location.search)}`
    window.location.href = url;
}
const currentUserId = () => (searchParams().get('uid') == null) ? undefined : `${searchParams().get('uid')}`;

const menuOptionInitator = new MutationObserver(({target}) => target.closest('[type = "menu"]').initMenus());

const mutationObserverOptions = {
    childList: true,
    subTree: true
};

const resetMenus = function () {
    menuOptionInitator.disconnect();
    this.$$('[type = "menu"]').for(menu => menuOptionInitator.observe(menu, mutationObserverOptions));
}

let inactivityTimer;
const addInactivityTimer = (minutes = 5) => inactivityTimer = setTimeout(() => goTo('login', {search: '?expired', reroute: true}), minutes * 60 * 1000);

const initInactivity = () => {
    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState == "hidden") return addInactivityTimer();
        clearTimeout(inactivityTimer);
    });
}

window.renderUserData = function () {
    const { name, img, color } = USER;
    this.$$('[data-user-data]').for(
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

const renderName = (userField, name) => {
    userField.innerText = name;
};
const renderImage = (userField, img) => {
    userField.src = img;
};
const renderInitials = (userField, name) => {
    userField.innerText = name.slice(0, 2).toUpperCase();
};
const renderColor = (userField, color) => {
    userField.style.setProperty('--user-clr', color);
};

initInactivity();
$('body').initMenus();
LANG_load();