const init = () => {
    render();
}

const render = async () => {
    const data = await (await fetch('cssFramework.json')).json();
    for (const [key, { imgSrc }] of Object.entries(data)){
        $('#content').innerHTML += itemTemplate(key, imgSrc);
    }
}

const itemTemplate = (key, imgSrc) => {
    return /*html*/`
        <div class="item grid-center" id="${key}" onclick="showFullscreen()">
            <img src="./img/${imgSrc}" alt="">
        </div>
    `
}

const showFullscreen = async () => {
    const id = event.currentTarget.id;
    const { [id]: { codeTemplate, imgSrc, info, minHeight = false } } = await (await fetch('cssFramework.json')).json();
    const code = await (await fetch(`codeTemplates/${codeTemplate}`)).text();
    $('#title').innerText = id.replaceAll('_',' ');
    $('#info').innerText = info;
    $('#img img').src = `./img/${imgSrc}`;
    $('#code').innerHTML = formatHTML(code);
    $('#example').style.minHeight = (minHeight) ? minHeight : 'unset'; 
    $('#example').innerHTML = code;
    $('dialog').openModal();
}

// log(`<button class="btn btn-secondary btn-cancel txt-normal" disabled test>
// <br>    <span data-lang="btn-cancel" onclick="this.doThis()">Cancel</span>
// <br></button>`
// .replaceAll(/(?<=<\/*)\b\w+\b/g, k => `<span class="code-darkblue">${k}</span>`)
// .replaceAll(/(?<!\bon\w+\b[^"]*)(?<!_\b\w+\b)(?<==)"[^"]+"/g, k => `<_sp _cl"code-orange">${k}</_sp>`)
// .replaceAll(/(?<!="[^"]+)(?<!!--[^\n]*)(?<= )\b[^_]\w*-{0,1}\w*\b/g, k => `<_sp _cl"code-lightblue">${k}</_sp>`)
// .replaceAll(/(?<=\bon\w+\b[^=]*=)"[^"]*"/g, k => formatJS(k))
// )
const copyCode = async () => {
    const code = $('#code').innerText;
    navigator.clipboard.writeText(code);
}