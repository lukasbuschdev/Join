const goTo = (directory, options) => {
    const url = `${window.location.origin}/Join/${directory}.html${(options?.search ?? location.search)}`
    window.location.href = url;
}
function currentUserId() {
    return (searchParams().get('uid') == null) ? undefined : `${searchParams().get('uid')}`;
}

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
function addInactivityTimer(minutes = 5) {
    return inactivityTimer = setTimeout(() => goTo('init/login/login', { search: '?expired' }), minutes * 60 * 1000);
}

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
LANG_load();
$('body').initMenus();