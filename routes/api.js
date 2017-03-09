var express = require('express');
var router = express.Router();
const url = require('url')

module.exports = function(content, renderer) {
  return router
  .post('/', function(req, res, next) {
    content.api(req.body, (err, result) => {
      if (err) {
        throw(err);
      }
      res.send(result);
    });
  });
};

