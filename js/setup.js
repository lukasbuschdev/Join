window.$ = function (selector) {
  return this.document.querySelector(selector)
};
window.$$ = function (selector) {
  return this.document.querySelectorAll(selector)
};



// let directories = [];
const currentDirectory = () => window.location.pathname.split('/').at(-1).split('.')[0]

const goTo = (directory, options) => {
    const url = `${window.location.origin}/Join/${directory}.html${(options?.search ?? location.search)}`
    window.location.href = url;
}
const currentUserId = () => (searchParams().get('uid') == null) ? undefined : `${searchParams().get('uid')}`;

const menuOptionInitator = new MutationObserver(
    ({target}) => {
        target.closest('[type = "menu"]').initMenus();
    }
);

const mutationObserverOptions = {
    childList: true,
    subTree: true
};

const resetMenus = function () {
    menuOptionInitator.disconnect();
    this.$$('[type = "menu"]').for(menu => {
            menuOptionInitator.observe(menu, mutationObserverOptions)
        }
    )
}

let inactivityTimer;
const addInactivityTimer = (minutes = 5) => {
    inactivityTimer = setTimeout(()=>{
        goTo('login', {search: '?expired', reroute: true});
    }, minutes * 60 * 1000)
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
            if (dataType == "img") renderImage(userField, img);
            else if (dataType == "name") renderName(userField, name);
            else if (dataType == "initials") renderInitials(userField, name);
            else if (dataType == "color") renderColor(userField, color);
        }
    );
}

const renderName = (userField, name) => {
    userField.innerText = name;
};
const renderImage = (userField, img) => {
        // if (img.includes('drive.google.com')) {
        //     const iframe = document.createElement('iframe');
        //     iframe.src = img;
        //     iframe.allow = "autoplay";
        //     iframe.onload = () => console.log("drive img loaded!")
        //     userField.replaceWith(iframe)
        //     return;
        // }
    userField.src = img;
};
const renderInitials = (userField, name) => {
    userField.innerText = name.slice(0, 2).toUpperCase();
};
const renderColor = (userField, color) => {
    userField.style.setProperty('--user-clr', color);
};

// initInactivity();
$('body').initMenus();
LANG_load();