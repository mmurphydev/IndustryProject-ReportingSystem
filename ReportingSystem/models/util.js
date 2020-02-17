var mongoose = require ('mongoose');
const url = 'mongodb://127.0.0.1:27017/ReportingSystemDB'; //connection string to DB hosted locally
var connection = mongoose.connect(url);

exports.connection=connection;