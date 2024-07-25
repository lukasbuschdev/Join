import { $, $$, currentDirectory, includeTemplates, initInactivity, parse } from "./utilities.js";
import "./prototype_extensions.js";
import { LANG } from "./language.js";

export function getContext() {
	try {
		throw new Error();
	} catch(e) {
		const { stack } = e;
		console.log(stack)
		return getCallerModulePath(stack);
	}
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
	if (!callerModulePath || currentDirectory(callerModulePath) !== currentDirectory()) return;
	const allImportPaths = new Set([
		...importPaths,
		"/Join/assets/templates/index/notification_template.js"
	]);
	if (!/setup/.test(callerModulePath)) allImportPaths.add(callerModulePath);

	await new Promise((resolve) => {
		window.addEventListener("templatesIncluded", resolve, { once: true });
	});

	const modules = await Promise.all([...allImportPaths].map((path) => import(path)));

	if (document.readyState === "loading")
		await new Promise((resolve) => window.addEventListener("DOMContentLoaded", resolve));

	const allFunctionNames = getAllFunctionNames();
	bindFunctionsToWindow(modules, allFunctionNames);
	const onload = customOnloadFunction();
	onload(); // calls the oncustomload event
	window.dispatchEvent(new CustomEvent("EventsBound"));
}

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

function customOnloadFunction() {
	const customOnloadEvalString = $("body").attributes.getNamedItem("oncustomload")?.value;
	return !!customOnloadEvalString ? parse(`() => {${customOnloadEvalString}}`) : () => {};
}

export function getCallerModulePath(stack) {
	const lastLine = stack.split("\n")
		.filter(line => !!line)
		.at(-1);
	const matches = lastLine.match(/\/Join[^:]*/g);
	if (matches) return matches[0];
}

function bindFunctionsToWindow(modules, allFunctionNames) {
	const missingFunctions = new Set();
	modules.forEach((mod) => {
		for (const func in mod) window[func] = mod[func];
	});

	if (missingFunctions.size > 0)
		throw Error(
			`Missing module / invalid import(s):\n${Array.from(missingFunctions).join("\n")}`
		);
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
