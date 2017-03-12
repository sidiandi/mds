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
            const tokens = _this.render.lexer(source);
            const headings = tokens.filter((i) => { return i.type === 'heading'; });
            toc = headings
                .map((i) => { return `${getHeadingIndent(i.depth)}* [${i.text}](${path}#${getHeadingId(i.text)})`; })
                .join('\n');
            return toc;
        });
}

// Promise
MdNav.prototype.get = function(path) {
    const _this = this;
    const getToc = _this.getTableOfContents(path);
    const parent = _this.content.getParent(path);
    const getParentDir = parent ? _this.content.getDirectoryAsMarkdown(parent) : Promise.resolve(undefined);
    const getDir = _this.content.getDirectoryAsMarkdown(path);

    return Promise.all([getParentDir, getDir, getToc]).then((a) => {
        return a.filter(i => i).join('\n----\n');
    });
}

// export the class
module.exports = MdNav;
