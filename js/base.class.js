import { STORAGE } from "./storage.js";
import { error } from "./utilities.js";

/**
 * Base class providing basic functionality for setting and getting properties, and updating storage.
 */
export class BaseClass {
	constructor() {}

	/**
	 * Sets the value of a property if it exists and triggers an update.
	 * @param {string} property - The property name to set.
	 * @param {any} value - The value to set for the property.
	 */
	setProperty(property, value) {
		if (!this[property]) return error(`property '${property}' doesn't exist!`);
		this[property] = value;
		this.update();
	}

	/**
	 * Gets the value of a property if it exists.
	 * @param {string} property - The property name to get.
	 * @returns {*} The value of the property, or undefined if the property does not exist.
	 */
	getPropertyValue(property) {
		return this[property] ?? undefined;
	}

	/**
	 * Updates the storage with the current instance data if the class is allowed to be updated.
	 * @async
	 * @param {string} path - The storage path to update.
	 * @returns {Promise<any>} The result of the storage update operation.
	 */
	async update(path) {
		const className = this.constructor.name;
		if ((className !== "User" && className !== "Board" && className !== "Task") || !path)
			return console.log(`can't update this class!`);
		const result = await STORAGE.set(path, this);
		return result;
	}
}

