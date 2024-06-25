import { $, $$, currentDirectory, includeTemplates, initInactivity, parse } from "./utilities.js";
import './prototype_extensions.js';
import { LANG_load } from "./language.js";


// HELPER

export function getContext() {
    const { stack } = new Error()
    return getCallerModulePath(stack)
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
    if (!callerModulePath || currentDirectory(callerModulePath) !== currentDirectory()) return
    const allImportPaths = new Set(importPaths)
    if (!/setup/.test(callerModulePath)) allImportPaths.add(callerModulePath)

    await new Promise((resolve) => {
        window.addEventListener("templatesIncluded", resolve, { once: true })
    })

    // console.log('importing modules: ', allImportPaths, callerModulePath)
    const modules = await Promise.all([...allImportPaths].map((path) => import(path)))
    // console.log(modules)
    
    if (document.readyState === 'loading') await new Promise((resolve) => window.addEventListener("DOMContentLoaded", resolve))
    
    const allFunctionNames = getAllFunctionNames()
    // console.log(allFunctionNames)
    bindFunctionsToWindow(modules, allFunctionNames);
    const onload = customOnloadFunction()
    // console.log(onload)
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
        ? parse(`() => {${customOnloadEvalString.replace(',', ';')}}`)
        : () => {}
}

export function getCallerModulePath(stack) {
    const lastLine = stack.split('\n').at(-1)
    const matches = lastLine.match(/\/Join[^:]*/g)
    if (matches) return matches[0]
}

function bindFunctionsToWindow(modules, allFunctionNames) {
    // const missingFunctions = modules.reduce((allMissing, module) => {
    //     allFunctionNames.forEach((name) => {
    //         if (name in module) {
        //             window[name] = module[name]
        
        //             allMissing.delete(name)
        //         }
        //     })
        //     return allMissing
        // }, new Set(allFunctionNames));
        
        const missingFunctions = new Set();
        
        modules.forEach((mod) => {
            for(const func in mod) {
            // console.log(`binding function ${func} to window!`)
            window[func] = mod[func]
        }
    })

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
