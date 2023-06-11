HTMLDivElement.prototype.includeTemplate = async function(url) {
    const template = await (await fetch(url)).text();
    this.innerHTML = template;
    LANG_load();
}