var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./util');

//Report Schema
var reportsSchema = new Schema({
    building: {type: String},
    room_number: {type: String},
    description: {type: String},
    image_file_name : {type : String},
    longitude : {type : Number},
    latitude : {type : Number},
    date_created : {type: Date, default: new Date()},
    votes: {type: Number, default : 0},
    status : {type: Boolean, default : true},
    urgency_rating : {type: Number, default : 0},
    classifier_suggested_rating : {type : Number, default : 0},

});
module.exports = mongoose.model('Report',reportsSchema);