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
  res.render('feed');
});

/*Adding Report to DB*/
router.post('/AddReport',  function (req, res, next) {

  console.log(req.body);
  console.log("loggin body: " + req.body.building);
  console.log("loggin description: " + req.body.description);
  console.log("loggin room_number: " + req.body.room_number);
  console.log("lat postionn: " + req.body.latitude);
  console.log("long position: " + req.body.longitude);

  //create new report with values from body
  report = new Report({
    description: req.body.description,
    building: req.body.building,
    room_number: req.body.room_number,
    longitude : req.body.longitude,
    latitude: req.body.latitude,
  });

  report.save(function (err, savedReport) {
    if (err)
      throw err;
    res.json({ //Send response with saved details (for testing/debugging)
      "id": savedReport._id,
      "building":savedReport.building,
      "Room Number":savedReport.room_number,
      "description" : savedReport.description,
      "longitude" : savedReport.longitude,
      "latitude" : savedReport.latitude
    });
  });
});

module.exports = router;
