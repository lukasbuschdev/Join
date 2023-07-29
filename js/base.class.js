class BaseClass {
    constructor() {
    }

    setProperty = (property, value) => {
        this[property] = value;
        this.update();
    }

    getPropertyValue = (property) => this[property] ?? undefined;
}