class BaseClass {
    constructor() {
    }

    setProperty = (property, value) => {
        if (!this[property]) return error(`property '${property}' doesn't exist!`)
        this[property] = value;
        if (this instanceof Board) {
            this.dateOfLastEdit = Date.now();
        }
        this.update();
    }

    getPropertyValue = (property) => this[property] ?? undefined;
}