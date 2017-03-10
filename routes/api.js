var express = require('express');
var router = express.Router();
const url = require('url')

module.exports = function(api) {
  return router
  .post('/', function(req, res, next) {
    console.log(req.body);
    api.call(req.body)
      .then((result) => {
        // console.log(result);
        res.send(result);
      })
      .catch((err) => {
         console.log(err);
         res.send(err);});
  });
};

