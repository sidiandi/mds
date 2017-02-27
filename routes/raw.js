const fs = require('fs');
const mdContent = require('../mdContent');
var express = require('express');
var router = express.Router();

var mdContentDirectory = "C:\\work\\hagen";

/* GET users listing. */
router.get('/*', function(req, res, next) {
  mdContent.get(req.path, (data) => {
    res.type("text");
    res.send(data)
  });
});

module.exports = router;

