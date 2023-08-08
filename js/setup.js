// let directories = [];
const currentDirectory = () => window.location.pathname.split('/').at(-1);
const goTo = (directory, options) => {
    const search = options?.search ?? location.search;
    const reroute = options?.reroute ?? false; 
    const newUrl = `/Join/${directory}${search}`;
    if (reroute) location.href = newUrl;
    else history.pushState(directory, '', newUrl);
}
const currentUserId = () => (searchParams().get('uid') == null) ? undefined : `${searchParams().get('uid')}`;

const menuOptionInitator = new MutationObserver(
    mutation => {
        initMenus();
    }
);

const mutationObserverOptions = {
    childList: true,
    subTree: true
};

const resetMenus = () => {
    menuOptionInitator.disconnect();
    $$('[type = "menu"]').for(menu => {
            menuOptionInitator.observe(menu, mutationObserverOptions)
        }
    )
}

const initMenus = () => {
    $$('[type = "menu"]').for(menu => {
        const allButtons = menu.$$('[type = "option"]');
        allButtons.for(
            button => {
                button.addEventListener('click', () => allButtons.for(
                button => button.classList.toggle('active', button == event.currentTarget)
            ))}
        );
    });
}

let inactivityTimer;
const addInactivityTimer = (minutes = 5) => {
    inactivityTimer = setTimeout(()=>{
        goTo('login', {search: '?expired', reroute: true});
    }, minutes * 60 * 1000)
}

const initInactivity = () => {
    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState == "hidden") addInactivityTimer();
        else clearTimeout(inactivityTimer);
    });
}

// const renderObserver = new MutationObserver(
//     mutation => {
//         if ("user-data" in mutation.target.dataset) {

//         }
//     }
// )

const renderUserData = () => {
    const { name, img, color } = USER;
    $$('[data-user-data]').for(
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
    userField.src = img;
};
const renderInitials = (userField, name) => {
    userField.innerText = name.slice(0, 2).toUpperCase();
};
const renderColor = (userField, color) => {
    userField.style.setProperty('--user-clr', color);
};

// redirect();

initMenus();
LANG_load();