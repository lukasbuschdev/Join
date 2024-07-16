import { STORAGE } from "./storage.js";

export class BaseClass {
  constructor() {}

  setProperty(property, value) {
    if (!this[property]) return error(`property '${property}' doesn't exist!`);
    this[property] = value;
    this.update();
  }

  getPropertyValue(property) {
    return this[property] ?? undefined;
  }

  async update(path) {
    const className = this.constructor.name;
    if (
      (className !== "User" && className !== "Board" && className !== "Task") ||
      !path
    )
      return console.log(`cant update this class!`);
    const result = await STORAGE.set(path, this);
    return result;
  }
}
