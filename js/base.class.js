class BaseClass {
    constructor() {
    }

    setProperty = (property, value) => {
        this[property] = value;
        log(this)
        this.update();
    }

    getPropertyValue = (property) => this[property] ?? undefined;
}