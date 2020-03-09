var express = require('express');
var router = express.Router();
var validator = require('validator');
var Report = require('../models/reports'); //import reports model using relative path
var multer = require('multer');


var natural = require('natural');
var classifier = new natural.LogisticRegressionClassifier();


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
    console.log(file.mimetype);
    res.send("incorrect mimetype");
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

/* GET Closed Feed page. */
router.get('/feedClosed', function (req, res, next) {
  res.render('feedClosed');
});


/* Delete report*/
router.delete('/deleteReport/:id', function (req, res, next) {
  console.log("delete api called");
  // res.send("Delete route deactivated during demo!");  
  Report.deleteOne({ _id: req.params.id }, function (err) {
    if (err)
      res.send(err);
    res.json({ status: "commment with id" + req.params.id + " deleted" });
  }
  );
});

/* Change Status to fasle, put request*/
router.put('/changeStatusFalse/:id', function (req, res, next) {
  var id = req.params.id;
  Report.updateOne({ _id: id }, { status: false }, function (err) {
    if (err)
      res.send(err);
    res.json({ status: "Report Status Changed!" });
  });
});

/* Change Status to true, put request*/
router.put('/changeStatusTrue/:id', function (req, res, next) {
  var id = req.params.id;
  Report.updateOne({ _id: id }, { status: true }, function (err) {
    if (err)
      res.send(err);
    res.json({ status: "Report Status Changed!" });
  });
});

/* Upvote similar versions 
  increases votes field of Report by 1
 */
router.put('/upVote/:id', function (req, res, next) {
  var id1 = req.params.id;
  Report.updateOne({ _id: id1 }, { $inc: { votes: 1 } }, function (err) {
    if (err)
      res.send(err);
    res.send("Report UpVoted");
  });
});



/*Adding Report to DB
* middleware specifies the nuber of files (1) 
* and the name of the field that will hold the file to be parsed
*/

router.post('/AddReport', upload.single('ImageUpload'), function (req, res, next) {
  console.log("Add report called");
  console.log(req.body);
  var filePath;

  //If no image upload save path as path to default image, otherwise save image path to DB
  if (req.body.ImageUpload == 'undefined') {
    filePath = "images/noImage.jpg";

  } else {
    filePath = req.file.path;
  }

  //create new report with values from body
  report = new Report({
    description: req.body.description,
    building: req.body.building,
    room_number: req.body.room_number,
    // longitude: req.body.longitude,
    // latitude: req.body.latitude,
    image_file_name: filePath,

  });
  /*Report is saved if description & room_number contains Alphanumeric characters only 
  *  .replace argument removes all spaces from string before passing it to isAlphanumeric method.
  *     otherwise isAlphanumeric() would return false for any filed with spaces.
  */
  if ((validator.isAlphanumeric(req.body.description.replace(/\s+/g, ''))) && (validator.isAlphanumeric(req.body.room_number.replace(/\s+/g, '')))) {
    report.save(function (err, savedReport) {
      if (err)

        throw err;
      console.log("Report Sucessfully Saved");
      // res.json({ //Send response with saved details (for testing/debugging)
      //   "id": savedReport._id,
      //   "building": savedReport.building,
      //   "Room Number": savedReport.room_number,
      //   "description": savedReport.description,
      //   "longitude": savedReport.longitude,
      //   "latitude": savedReport.latitude,
      //   "file name ": savedReport.image_file_name
      // });

      res.send("Report for '" + savedReport.building + "', Room: '" + savedReport.room_number + "' saved.")
    });
  } else {
    console.log("Error: validator issue!")
    res.send("Error : Only letters and Numbers allowed");
  }
});


/*Get Open Reports <24hours old, with status=true
* sorted by votes (desc) then date(oldest first)
*/
router.get('/getTodaysReports', function (req, res, next) {
  Report.find({
    $and: [
      {
        "date_created":
        {
          $gte: new Date((new Date().getTime() - (24 * 60 * 60 * 1000)))
        }
      },
      { "status": { $eq: true } }]
  }, function (err, reports) {
    if (err)
      res.send(err);
    //takes js array (reports) and sorts it by votes, then date
    reports.sort(function (a, b) {
      if ((a.votes - b.votes) == 0)
        return a.date_created - b.date_created; //oldest first
      return b.votes - a.votes; //Highest votes first
    });
    res.json(reports);
  });
});


/*Get Open Reports >24hours but < 7days old old*/
router.get('/getWeeklyReports', function (req, res, next) {
  Report.find({
    $and: [
      {
        "date_created":
        {//this is returning everything <7days old, but > 1 day old
          $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000))), //less than 7 days 
          $lte: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)) //greater than 1 day
        }
      },
      { "status": { $eq: true } }]
  },
    function (err, reports) {
      if (err)
        res.send(err);

      //takes js array (reports) and sorts it by votes, then date
      reports.sort(function (a, b) {
        if ((a.votes - b.votes) == 0)
          return a.date_created - b.date_created; //oldest first
        return b.votes - a.votes; //Highest votes first
      });

      res.json(reports);
    });
});


/*Get Open Reports >7days old old*/
router.get('/getOlderReports', function (req, res, next) {
  Report.find({
    "date_created":
    {//this is returning everything >7days old
      $lte: new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000))
    }
  }, function (err, reports) {
    if (err)
      res.send(err);
    //takes js array (reports) and sorts it by votes, then date
    reports.sort(function (a, b) {
      if ((a.votes - b.votes) == 0)
        return a.date_created - b.date_created; //oldest first
      return b.votes - a.votes; //Highest votes first
    });
    res.json(reports);
  });
});





/*Get Closed Reports <24hours old, with status=false
* sorted by votes (desc) then date(oldest first)
*/
router.get('/getTodaysClosedReports', function (req, res, next) {
  Report.find({
    $and: [
      {
        "date_created":
        {
          $gte: new Date((new Date().getTime() - (24 * 60 * 60 * 1000)))
        }
      },
      { "status": { $eq: false } }]
  }, function (err, reports) {
    if (err)
      res.send(err);
    //takes js array (reports) and sorts it by votes, then date
    reports.sort(function (a, b) {
      if ((a.votes - b.votes) == 0)
        return a.date_created - b.date_created; //oldest first
      return b.votes - a.votes; //Highest votes first
    });
    res.json(reports);
  });
});

/*Get Closed Reports >24hours but < 7days old old*/
router.get('/getWeeklyClosedReports', function (req, res, next) {
  Report.find({
    $and: [
      {
        "date_created":
        {//this is returning everything <7days old, but > 1 day old
          $gte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000))), //less than 7 days 
          $lte: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)) //greater than 1 day
        }
      },
      { "status": { $eq: false } }]
  },
    function (err, reports) {
      if (err)
        res.send(err);

      //takes js array (reports) and sorts it by votes, then date
      reports.sort(function (a, b) {
        if ((a.votes - b.votes) == 0)
          return a.date_created - b.date_created; //oldest first
        return b.votes - a.votes; //Highest votes first
      });
      res.json(reports);
    });
});


/*Get Closed Reports >7days old old*/
router.get('/getOlderClosedReports', function (req, res, next) {
  Report.find({
    $and: [{
      "date_created":
      {//this is returning everything >7days old
        $lte: new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000))
      },
    }, { "status": { $eq: false } }]
  }, function (err, reports) {
    if (err)
      res.send(err);
    //takes js array (reports) and sorts it by votes, then date
    reports.sort(function (a, b) {
      if ((a.votes - b.votes) == 0)
        return a.date_created - b.date_created; //oldest first
      return b.votes - a.votes; //Highest votes first
    });
    res.json(reports);
  });
});




























/* -------Getting Open Reports by building ___________________________________________________________________*/


/*Get all OPEN Reports for IT building
* sorted by votes (desc) then date(oldest first)
*/
router.get('/getAllOpenReportsIT', function (req, res, next) {
  Report.find({
    $and: [{ "building": { $eq: 'IT' } }, { "status": { $eq: true } }
    ]
  }, function (err, reports) {
    if (err)
      res.send(err);
    //takes js array (reports) and sorts it by votes, then date 
    reports.sort(function (a, b) {
      if ((a.votes - b.votes) == 0)
        return a.date_created - b.date_created; //oldest first
      return b.votes - a.votes; //Highest votes first
    });
    res.json(reports);
  });
});


/* GET /feedOpenIT page. */
router.get('/feedOpenIT', function (req, res, next) {
  res.render('OpenBuildingFeed/feedOpenIT');
});

/*Get all OPEN Reports for Concourse building
* sorted by votes (desc) then date(oldest first)
*/
router.get('/getAllOpenReportsConcourse', function (req, res, next) {
  Report.find({
    $and: [{ "building": { $eq: 'Concourse' } }, { "status": { $eq: true } }
    ]
  }, function (err, reports) {
    if (err)
      res.send(err);
    //takes js array (reports) and sorts it by votes, then date 
    reports.sort(function (a, b) {
      if ((a.votes - b.votes) == 0)
        return a.date_created - b.date_created; //oldest first
      return b.votes - a.votes; //Highest votes first
    });
    res.json(reports);
  });
});

/* GET /feedOpenMoffetts page. */
router.get('/feedOpenConcourse', function (req, res, next) {
  res.render('OpenBuildingFeed/FeedOpenConcourse');
});


/*Get all OPEN Reports for Moffetts building
* sorted by votes (desc) then date(oldest first)
*/
router.get('/getAllOpenReportsMoffetts', function (req, res, next) {
  Report.find({
    $and: [{ "building": { $eq: 'Moffetts' } }, { "status": { $eq: true } }
    ]
  }, function (err, reports) {
    if (err)
      res.send(err);
    //takes js array (reports) and sorts it by votes, then date 
    reports.sort(function (a, b) {
      if ((a.votes - b.votes) == 0)
        return a.date_created - b.date_created; //oldest first
      return b.votes - a.votes; //Highest votes first
    });
    res.json(reports);
  });
});

/* GET /feedOpenMoffetts page. */
router.get('/feedOpenMoffetts', function (req, res, next) {
  res.render('OpenBuildingFeed/FeedOpenMoffetts');
});


/*Get all OPEN Reports for Orbsen building
* sorted by votes (desc) then date(oldest first)
*/
router.get('/getAllOpenReportsOrbsen', function (req, res, next) {
  Report.find({
    $and: [{ "building": { $eq: 'Orbsen' } }, { "status": { $eq: true } }
    ]
  }, function (err, reports) {
    if (err)
      res.send(err);
    //takes js array (reports) and sorts it by votes, then date 
    reports.sort(function (a, b) {
      if ((a.votes - b.votes) == 0)
        return a.date_created - b.date_created; //oldest first
      return b.votes - a.votes; //Highest votes first
    });
    res.json(reports);
  });
});

/* GET /feedOpenMoffetts page. */
router.get('/feedOpenOrbsen', function (req, res, next) {
  res.render('OpenBuildingFeed/FeedOpenOrbsen');
});



/*End of Get all open Reopts by building*/



/* Change Status to fasle, put request*/
router.put('/changeRating/:rating&:id', function (req, res, next) {
  var id = req.params.id;
  var rating = req.params.rating;
  Report.updateOne({ _id: id }, { urgency_rating: rating }, function (err) {
    if (err)
      res.send(err);
    res.json({ status: "Report Status Changed!" });
  });
});



/*Get all unranked reports*/
router.get('/getAllUnrankedReports', function (req, res, next) {
  Report.find(
    { "urgency_rating": { $eq: 0 } }, function (err, reports) {
      if (err)
        res.send(err);

      res.json(reports);
    });
});



router.get('/getAllUnrankedReportsOnce', function (req, res, next) {
  console.log("called correct api");
  Report.find(
    {}, function (err, reports) {
      if (err) {
        res.send(err);
      }
      else {
        console.log("found all docs, count: "+reports.length);
        for (i = 0; i < reports.length; i++) {
          var id = reports[i]._id
          console.log("got id ok!");
          Report.updateOne({ _id: id }, { urgency_rating: 0 }, function (err) {
            if (err)
              res.send(err);
          });
        }
        console.log("sucessfully updated all!!");
        res.json(reports);
      }
    });
});




module.exports = router;
