import { $, $$, currentDirectory, includeTemplates, parse, searchParams } from "./utilities.js";
import './prototype_extensions.js';
import { LANG_load } from "./language.js";

/**
 * parses the specified directory and reloads the current page to it
 * @param {string} directory 
 * @param {any} options 
 */
export const goTo = (directory, options) => {
    const url = `${window.location.origin}/Join/${directory}.html${(options?.search ?? location.search)}`
    window.location.href = url;
}
export function currentUserId() {
    return (searchParams().get('uid') == null) ? undefined : `${searchParams().get('uid')}`;
}

export const menuOptionInitator = new MutationObserver(([{target}]) => target.parentElement.closest('[type = "menu"]').initMenus());

export const mutationObserverOptions = {
    childList: true,
    subTree: true
};

export const resetMenus = function () {
    menuOptionInitator.disconnect();
    this.$$('[type = "menu"]').for(menu => menuOptionInitator.observe(menu, mutationObserverOptions));
}

let inactivityTimer;
export function addInactivityTimer(minutes = 5) {
    return inactivityTimer = setTimeout(() => goTo('init/login/login', { search: '?expired' }), minutes * 60 * 1000);
}

export const initInactivity = () => {
    window.addEventListener("visibilitychange", () => {
        if (document.visibilityState == "hidden") return addInactivityTimer();
        clearTimeout(inactivityTimer);
    });
}

export function renderUserData() {
    const { name, img, color } = window.USER;
    (this ?? document.documentElement).$$('[data-user-data]').forEach(
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

export const renderName = (userField, name) => {
    userField.innerText = name;
};
export const renderImage = (userField, img) => {
    userField.src = img;
};
export const renderInitials = (userField, name) => {
    userField.innerText = name.slice(0, 2).toUpperCase();
};
export const renderColor = (userField, color) => {
    userField.style.setProperty('--user-clr', color);
};

// HELPER

export function getContext() {
    return getCallerModulePath(new Error().stack)
}

/**
 * makes inline HTML events available in es modules
 * 
 * IMPORTANT: callerModulePath must be passed in via the 'getContext()' function
 * @param {string} callerModulePath !! must be passed in via the 'getContext()' function !!
 * @param {string[]} importPaths an Array of paths to js files 
 * @returns 
 */
export async function bindInlineFunctions(callerModulePath, importPaths = []) {    
    if (currentDirectory(callerModulePath) !== currentDirectory()) return
    const allImportPaths = new Set(importPaths)
    if (!/setup/.test(callerModulePath)) allImportPaths.add(callerModulePath)

    await new Promise((resolve) => {
        window.addEventListener("templatesIncluded", resolve, { once: true })
    })

    // console.log('importing modules: ', allImportPaths)
    const modules = await Promise.all([...allImportPaths].map((path) => import(path)))
    console.log(modules)
    if (document.readyState === 'loading') await new Promise((resolve) => window.addEventListener("DOMContentLoaded", resolve))
    
    const allFunctionNames = getAllFunctionNames() 
    bindFunctionsToWindow(modules, allFunctionNames);
    const onload = customOnloadFunction()
    console.log(onload)
    window.onload = onload
    onload() // calls the oncustomload event
    window.dispatchEvent(new CustomEvent("EventsBound"))
}

function getAllFunctionNames() {
    const functionNameRegExp = /(?<!\.)\b\w+\b(?=\()/g;
    return [...$$('*')].reduce((total, { attributes }) => {
            [...attributes].forEach(({ name, value }) => {
                if (!/^(on|methods)/.test(name)) return
                const functionNames = String(value).match(functionNameRegExp)
                if (!functionNames) return
                total.add(...functionNames)
            })
            return total
    }, new Set());
}

function customOnloadFunction() {
    const customOnloadEvalString = $('body').attributes.getNamedItem('oncustomload')?.value
    return !!customOnloadEvalString
        ? parse(customOnloadEvalString)
        : () => {}
}

export function getCallerModulePath(stack) {
    const lastLine = stack.split('\n').at(-1)
    const matches = lastLine.match(/\/Join[^:]*/g)
    if (matches) return matches[0]
}

function bindFunctionsToWindow(modules, allFunctionNames) {
    const missingFunctions = modules.reduce((allMissing, module) => {
        allFunctionNames.forEach((name) => {
            if (name in module) {
                console.log(`binding function ${name} to window!`)
                window[name] = module[name]
                
                allMissing.delete(name)
            }
        })
        return allMissing
    }, new Set(allFunctionNames));
    if (missingFunctions.size > 0) throw Error(`Missing module / invalid import(s):\n${Array.from(missingFunctions).join("\n")}`);
}

window.addEventListener("DOMContentLoaded", () => {
    initInactivity();
    includeTemplates();
}, { once: true })

window.addEventListener("EventsBound", () => {
    LANG_load();
    $('body').initMenus();
}, { once: true })