var express = require('express');
var router = express.Router();
const url = require('url')

module.exports = function(content, renderer) {
  return router
  .get('/*', function(req, res, next) {
    content.getNav(req.path, (markDownSource) => {
      res.type("html");
      res.send(renderer.render(markDownSource, relPath));
    });
  })
};

