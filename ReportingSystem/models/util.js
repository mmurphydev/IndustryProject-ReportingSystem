var mongoose = require ('mongoose');
const url = 'mongodb://127.0.0.1:27017/ReportingSystemDB'; //connection string to DB hosted locally
var connection = mongoose.connect(url,{useNewUrlParser:true, useUnifiedTopology: true} );  //connecting to DB & solving depreciationWarning;

exports.connection=connection;