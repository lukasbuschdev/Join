const CODE_RegExp = {
    html: {
        entity: /<[^>]+>/g,
        tagEnclosers: /(^<\b\w+\b(?=[ >]))|(<\/\b\w+\b>$)/g,
        tags: /(?<=<\/*)\b\w+\b/g,
        comments: /<!--.+-->/g,
        attrbutes: /(?<!="[^"]+)(?<!!--[^\n]*)(?<= )\b[^_]\w*-{0,1}\w*\b/g,
        strings: /(?<!\bon\w+\b[^"]*)(?<!_\b\w+\b)(?<==)"[^"]+"/g,
        onevent: /(?<=\bon\w+\b[^=]*=)"[^"]*"/g,
        enclosers: /(((?<=>)>)|(<\/*(?=<))|(?<=>[^><]+)>)/g,
        tabs: / {2,}/g
    },
    js: {
        enclosers: /(^"|"$)/g,
        strings: /'[^']*'/g,
        reserved: /(this|const|let|function)/g,
        functions: /([\w$]+\(|(?<=[\w$]+\([^)]*)\))/g,
        operators: /[=;]/g,
        numbers: /(?<!'[^>]*)\b\d+\.{0,1}\d*\b/g
    }
}

const formatHTML = (code) => {
    const { html } = CODE_RegExp; 
    return code
        .replaceAll(html.entity, i => i
            .replaceAll(html.tagEnclosers, j => j
                .replaceAll(html.tags, k => `<_sp _cl"code-darkblue">${k}</_sp>`)// darkblue tags
            )
            .replaceAll(html.comments, i => `<_sp _cl"code-green">${i.replaceAll('<!','&lt;!')}</_sp>`) // green comments
            .replaceAll(html.attrbutes, k => `<_sp _cl"code-lightblue">${k}</_sp>`) // lightblue attributes
            .replaceAll(html.strings, k => `<_sp _cl"code-orange">${k}</_sp>`) // orange strings
            .replaceAll(html.onevent, k => formatJS(k))
            .replaceAll(html.enclosers, k => `<_sp _cl"code-gray">${k.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</_sp>`) // gray <, >, </
        )
        .replaceAll(html.tabs, i => i.replaceAll('  ', `&nbsp;&nbsp;`))
        .replaceAll('\n', '<br>')
        .replaceAll('_sp', 'span')
        .replaceAll('_cl', 'class=')
}

const formatJS = (code) => {
    const { js } = CODE_RegExp;
    return `<_sp _cl"code-lightblue">${code
        .replaceAll(js.enclosers, i => `<_sp _cl"code-orange">${i}</_sp>`) // enclosing " "
        .replaceAll(js.strings, i => `<_sp _cl"code-orange">${i}</_sp>`) // orange strings
        .replaceAll(js.reserved, i => `<_sp _cl"code-darkblue">${i}</_sp>`) // darkblue
        .replaceAll(js.functions, i => `<_sp _cl"code-yellow">${i}</_sp>`) // functions
        .replaceAll(js.operators, i => `<_sp _cl"code-white">${i}</_sp>`) // white = and ;
        .replaceAll(js.numbers, i => `<_sp _cl"code-lightgreen">${i}</_sp>`) // lightgreen numbers
    }</_sp>`
}