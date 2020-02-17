var express = require('express');
var router = express.Router();
var Report  = require('../models/reports'); //import reports model using relative path

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET Report Submission page. */
router.get('/Report', function (req, res, next) {
  res.render('ReportFault');
});

/* GET feed page. */
router.get('/feed', function (req, res, next) {
  res.render('ReportFault');
});

module.exports = router;
