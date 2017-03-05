const marked = require('marked');
const url = require('url');

var wikiLinks = /\[\[([^\[]+)\]\]/g;

function wikiLinkToMdLink(wikiLink) {
  var wikiLinks = /\[\[([^\[]+)\]\]/g;
  var m = wikiLinks.exec(wikiLink);
  let text = m[1];
  let link = text.split('/').map(encodeURIComponent).join('/');
  return "[" + text + "](" + (link + ".md") + ")";
}

marked.InlineLexer.prototype.origOutput = marked.InlineLexer.prototype.output;
marked.InlineLexer.prototype.output = function(src) {
  src = src.replace(wikiLinks, wikiLinkToMdLink);
  return this.origOutput(src);
}

marked.Renderer.prototype.origLink = marked.Renderer.prototype.link;
marked.Renderer.prototype.link = function(href, title, text) {
  href = this.options.mdRender.getHashedHref(href, this.options.contentPath);
  return this.origLink(href, title, text);
}

// Constructor
function MdRender() {
}

function canonic(x) {
    let y = [];
    x.forEach((i) => {
        if (i === '.') {

        } else if (i == '..') {
            y.pop();
        } else {
            y.push(i);
        }
    })
    return y;
}

MdRender.prototype.getHashedHref = function (href, contentPath) {
    let u = url.parse(href);
    if (u.host) {
        return href;
    }
    if (href.startsWith('/')) {
        return '/#' + href;
    }
    
    let p = contentPath.split('/');
    p.pop();
    p = p.concat(u.path.split('/'));
    p = canonic(p);
    return '/#' + p.join('/');
}

MdRender.prototype.render = function(src, relPath) {
    var options = { 
        gfm: true,
        breaks: true,
        tables: true,
        contentPath: relPath,
        mdRender: this
    };

    return marked(src, options);
}

// export the class
module.exports = MdRender;
