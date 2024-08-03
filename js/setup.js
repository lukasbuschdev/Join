import { $, $$, currentDirectory, includeTemplates, initInactivity, parse } from "./utilities.js";
import "./prototype_extensions.js";
import { LANG } from "./language.js";

/**
 * Retrieves the caller module path from the error stack.
 * @returns {string} The caller module path.
 */
export function getContext() {
	try {
		throw new Error();
	} catch (e) {
		const { stack } = e;
		return getCallerModulePath(stack);
	}
}

/**
 * Makes inline HTML events available in ES modules.
 *
 * IMPORTANT: callerModulePath must be passed in via the 'getContext()' function.
 * @param {string} callerModulePath - The path of the caller module. Must be passed in via the 'getContext()' function.
 * @param {string[]} [importPaths=[]] - An array of paths to JavaScript files.
 * @returns {Promise<void>}
 */
export async function bindInlineFunctions(callerModulePath, importPaths = []) {
	if (!callerModulePath || currentDirectory(callerModulePath) !== currentDirectory()) return;
	const allImportPaths = new Set([...importPaths, "/Join/assets/templates/index/notification_template.js"]);
	if (!/setup/.test(callerModulePath)) allImportPaths.add(callerModulePath);

	await new Promise((resolve) => {
		window.addEventListener("templatesIncluded", resolve, { once: true });
	});

	const modules = await Promise.all([...allImportPaths].map((path) => import(path)));

	if (document.readyState === "loading") await new Promise((resolve) => window.addEventListener("DOMContentLoaded", resolve));

	const allFunctionNames = getAllFunctionNames();
	bindFunctionsToWindow(modules, allFunctionNames);
	const onload = customOnloadFunction();
	onload(); // calls the oncustomload event
	window.dispatchEvent(new CustomEvent("EventsBound"));
}

/**
 * Retrieves all function names used in inline event handlers.
 * @returns {Set<string>} A set of function names.
 */
function getAllFunctionNames() {
	const functionNameRegExp = /(?<!\.)\b\w+\b(?=\()/g;
	return [...$$("*")].reduce((total, { attributes }) => {
		[...attributes].forEach(({ name, value }) => {
			if (!/^(on|methods)/.test(name)) return;
			const functionNames = String(value).match(functionNameRegExp);
			if (!functionNames) return;
			total.add(...functionNames);
		});
		return total;
	}, new Set());
}

/**
 * Retrieves the custom onload function defined in the body element.
 * @returns {Function} The custom onload function.
 */
function customOnloadFunction() {
	const customOnloadEvalString = $("body").attributes.getNamedItem("oncustomload")?.value;
	return !!customOnloadEvalString ? parse(`() => {${customOnloadEvalString}}`) : () => {};
}

/**
 * Retrieves the caller module path from the stack trace.
 * @param {string} stack - The error stack trace.
 * @returns {string|undefined} The caller module path, or undefined if not found.
 */
export function getCallerModulePath(stack) {
	const lastLine = stack
		.split("\n")
		.filter((line) => !!line)
		.at(-1);
	const matches = lastLine.match(/\/Join[^:]*/g);
	if (matches) return matches[0];
}

/**
 * Binds functions from imported modules to the window object.
 * @param {Array<Object>} modules - The imported modules.
 * @param {Set<string>} allFunctionNames - A set of all function names to bind.
 * @throws Will throw an error if any functions are missing or invalid imports are detected.
 */
function bindFunctionsToWindow(modules, allFunctionNames) {
	const missingFunctions = new Set();
	modules.forEach((mod) => {
		for (const func in mod) window[func] = mod[func];
	});

	if (missingFunctions.size > 0) {
		throw new Error(`Missing module / invalid import(s):\n${Array.from(missingFunctions).join("\n")}`);
	}
}

window.addEventListener(
	"DOMContentLoaded",
	() => {
		initInactivity();
		includeTemplates();
	},
	{ once: true }
);

window.addEventListener(
	"EventsBound",
	async () => {
		await LANG.init();
		LANG.render();
		$("body").initMenus();
	},
	{ once: true }
);
