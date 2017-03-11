// Constructor
function MdNav(content, render) {
    this.content = content;
    this.render = render;
}

function getHeadingId(raw) {
    return raw.toLowerCase().replace(/[^\w]+/g, '-');
}

MdNav.prototype.get = function(path) {
    return this.content.get(path)
    .then((source) => {
        const tokens = this.render.lexer(source);
        const headings = tokens.filter((i) => { return i.type === 'heading'; });
        toc = headings
            .map((i) => { return `* [${i.text}](${path}#${getHeadingId(i.text)})`; })
            .join('\n');
        return toc;
    });
}

// export the class
module.exports = MdNav;
