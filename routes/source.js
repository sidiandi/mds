const fs = require('fs');
const mime = require('mime-types')
const path = require('path');
var express = require('express');
var router = express.Router();

function returnSource(content, res, p, version) {
    const extension = path.extname(p);
    const mimeType = mime.lookup(extension);
    content.getBinary(p, version)
      .then((data) => {
        res.type(mimeType)
        res.send(data);
      })
      .catch((err) => {
        console.log(err);
        res.send('');
      })
}

module.exports = function(content) {
  return router.get('/*', function(req, res, next) {
    returnSource(content, res, req.path);
  })
  .post('/*', function(req, res, next) {
    const path = req.path;
    const version = req.body.version;
    returnSource(content, res, path, version);
  });
}