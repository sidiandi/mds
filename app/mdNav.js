// Constructor
function MdNav(content, render) {
    this.content = content;
    this.render = render;
}

function getHeadingId(raw) {
    return raw.toLowerCase().replace(/[^\w]+/g, '-');
}

function getHeadingIndent(depth) {
    let indent = '';
    for (i=1; i<depth; ++i) {
        indent += '  ';
    }
    return indent;
}

// Promise
MdNav.prototype.getTableOfContents = function(path) {
    const _this = this;
    return this.content.get(path)
        .then((source) => {
            const tokens = _this.render.lexer(source.markdown);
            const headings = tokens.filter((i) => { return i.type === 'heading'; });
            toc = headings
                .map((i) => { return `${getHeadingIndent(i.depth)}* [${i.text}](${path}#${getHeadingId(i.text)})`; })
                .join('\n');
            return toc;
        })
}

// Promise
MdNav.prototype.get = function(path) {
    const _this = this;
    const getToc = _this.getTableOfContents(path);
    const dir = path.endsWith('/') ? path : _this.content.getParent(path);
    const getDir = _this.content.get(dir).then(r => r.markdown);

    return Promise.all([getDir, getToc]).then((a) => {
        return a.join('\n----\n')
    })
}

// export the class
module.exports = MdNav;
