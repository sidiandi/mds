const marked = require('marked');
const mdContent = require('../mdContent');
var express = require('express');
var router = express.Router();

var wikiLinks = /\[\[([^\[]+)\]\]/g;

function wikiLinkToMdLink(wikiLink) {
  var wikiLinks = /\[\[([^\[]+)\]\]/g;
  var m = wikiLinks.exec(wikiLink);
  var text = m[1];
  return "[" + text + "](" + (text + ".md") + ")";
}

marked.InlineLexer.prototype.origOutput = marked.InlineLexer.prototype.output;
marked.InlineLexer.prototype.output = function(src) {
  src = src.replace(wikiLinks, wikiLinkToMdLink);
  return this.origOutput(src);
}

/* GET users listing. */
router.get('/*', function(req, res, next) {
  mdContent.get(req.path, (data) => {
    var markedOptions = { 
      gfm: true,
      breaks: true,
      tables: true
    };
    res.type("html");
    res.send(marked(data, markedOptions));
  });
});

module.exports = router;

