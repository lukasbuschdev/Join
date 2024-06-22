export class BaseClass {
    constructor() {
    }

    setProperty(property, value) {
        if (!this[property]) return error(`property '${property}' doesn't exist!`)
        this[property] = value;
        this.update();
    }

    getPropertyValue (property) {
        return this[property] ?? undefined;
    }
}