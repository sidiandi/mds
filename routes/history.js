const fs = require('fs');
var express = require('express');
var router = express.Router();

module.exports = function(content, renderer) {
  return router.get('/*', function(req, res, next) {
    content.getHistory(req.path, (data) => {
      res.type('text');
      res.send(data);parseFloat
    });
  });
}