const fs = require('fs');
var express = require('express');
var router = express.Router();

module.exports = function(content) {
  return router.get('/*', function(req, res, next) {
    content.get(req.path, (data) => {
      res.type("text");
      res.send(data);
    })
  })
  .post('/*', function(req, res, next) {
    content.getVersion(req.path, req.body.commitHash, (data) => {
      res.type("text");
      res.send(data);
    });
  });
}