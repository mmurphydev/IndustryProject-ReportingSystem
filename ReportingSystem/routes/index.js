var express = require('express');
var router = express.Router();
var validator = require('validator'); 
var Report = require('../models/reports'); //import reports model using relative path
var multer = require('multer'); 

//storage strategy 
var storage = multer.diskStorage({
  //defines where file should be stored
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  }
});

//Filter which only allows files of type jpeg or png
var fileFilter = (req, file, cb) => {

  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
    cb(null, true);
  } else {
    cb(null, false); //ignores file and doesnt save it
  };


};

//executes multer passig a configuration 
var upload = multer({
  storage: storage,
  limits: {
    filesize: 1024 * 1024 * 10  //limits filesize to max of 10MB 
  },
  fileFilter: fileFilter
});

/* GET home page. */
router.get('/', function (req, res, next) {
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

/*Adding Report to DB
* middleware specifies the nuber of files (1) 
* and the name of the field that will hold the file to be parsed
*/

router.post('/AddReport', upload.single('ImageUpload'), function (req, res, next) {
  
  console.log("logging file" + req.file.filename);
 
  console.log(req.body);
  console.log("logging path "+ req.body.path);
  console.log("loggin building: " + req.body.building);
  console.log("loggin description: " + req.body.description);
  console.log("loggin room_number: " + req.body.room_number);
  console.log("lat postionn: " + req.body.latitude);
  console.log("long position: " + req.body.longitude);
  console.log(req.file.filename)

  //create new report with values from body
  report = new Report({
    description: req.body.description,
    building: req.body.building,
    room_number: req.body.room_number,
    // longitude: req.body.longitude,
    // latitude: req.body.latitude,
    image_file_name: req.file.path,
  
  });
  /*Report is saved if description & room_number contains Alphanumeric characters only 
  *  .replace argument removes all spaces from string before passing it to isAlphanumeric method.
  *     otherwise isAlphanumeric() would return false for any filed with spaces.
  */
  if ((validator.isAlphanumeric(req.body.description.replace(/\s+/g,''))) && (validator.isAlphanumeric(req.body.room_number.replace(/\s+/g,''))))
  {   
    report.save(function (err, savedReport) {
      if (err)
        throw err;
      res.json({ //Send response with saved details (for testing/debugging)
        "id": savedReport._id,
        "building": savedReport.building,
        "Room Number": savedReport.room_number,
        "description": savedReport.description,
        "longitude": savedReport.longitude,
        "latitude": savedReport.latitude,
        "file name ": savedReport.image_file_name
      });
    });
  }else {
      res.json({"Error":  "Only letters and Numbers allowed"}) 
  }
});



// router.post('/AddReport', function (req, res, next) {

//   console.log(req.body);
//   console.log("loggin body: " + req.body.building);
//   console.log("loggin description: " + req.body.description);
//   console.log("loggin room_number: " + req.body.room_number);
//   console.log("lat postionn: " + req.body.latitude);
//   console.log("long position: " + req.body.longitude);

//   //create new report with values from body
//   report = new Report({
//     description: req.body.description,
//     building: req.body.building,
//     room_number: req.body.room_number,
//     longitude: req.body.longitude,
//     latitude: req.body.latitude,
//   });

//   report.save(function (err, savedReport) {
//     if (err)
//       throw err;
//     res.json({ //Send response with saved details (for testing/debugging)
//       "id": savedReport._id,
//       "building": savedReport.building,
//       "Room Number": savedReport.room_number,
//       "description": savedReport.description,
//       "longitude": savedReport.longitude,
//       "latitude": savedReport.latitude
//     });
//   });
// });

module.exports = router;
