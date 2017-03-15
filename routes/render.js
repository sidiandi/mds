var express = require('express');
var router = express.Router();
const url = require('url')

module.exports = function(content, renderer) {
  return router
  .get('/uml/:id', function(req, res, next) {
    let format = 'png';
    res.type("image/png");
    renderer.renderPlantUmlDiagram(req.params.id, format).pipe(res);
  })
  .get('/*', function(req, res, next) {
    let relPath = req.path;
      content.get(relPath).then((markDownSource) => {
      res.type("html");
      res.send(renderer.render(markDownSource, relPath));
    });
  })
  .post('/*', function(req, res, next) {
    let relPath = req.path;
    if (req.body.commit) {
        content.set(relPath, req.body.content).then(() => {
          res.type("html");
          res.send(renderer.render(req.body.content, relPath));
        });
      }
  });
};

