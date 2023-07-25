const currentDirectory = () => location.pathname.split('/').filter(i=>i !== "").at(-1).split('.')[0];
const currentUserId = () => (searchParams().get('uid') == null) ? undefined : `${searchParams().get('uid')}`;


$$('div[include-template]').for(container => {
    container.includeTemplate();
    LANG_load();
});

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
        menu.$$('[type = "option"]').for(
            button => button.addEventListener('click', () => menu.$$('[type = "option"]').for(
                button => button.classList.toggle('active', button == event.currentTarget)
            ))
        )
    });
}

const redirect = async () => {
    const userData = await getCurrentUserData();
    if (!userData && searchParams().has('redirected') == false) {
        // goTo('../init/init.html?redirected');
    }
}

let inactivityTimer;
const addInactivityTimer = (minutes = 5) => {
    inactivityTimer = setTimeout(()=>{
        goTo('../init/init.html?expired');
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

const renderUserData = async () => {
    const { name, img, color } = await getCurrentUserData();
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
REMOTE_clearVerifications();
if (currentDirectory() == "index") {
    // const uid = currentUserId();
    // loadUserData(uid);
    // initInactivity();
}
