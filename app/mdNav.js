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

MdNav.prototype.get = function(path) {
    const getToc = this.content.get(path)
        .then((source) => {
            const tokens = this.render.lexer(source);
            const headings = tokens.filter((i) => { return i.type === 'heading'; });
            toc = headings
                .map((i) => { return `${getHeadingIndent(i.depth)}* [${i.text}](${path}#${getHeadingId(i.text)})`; })
                .join('\n');
            return toc;
        });
    const getDir = this.content.get(this.content.getParent(path));

    return Promise.all([getDir, getToc]).then((a) => {
        return a.join('\n----\n');
    });
}

// export the class
module.exports = MdNav;
