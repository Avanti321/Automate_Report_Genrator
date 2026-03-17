const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  title: String,
  date: String,
  duration: String,
  objective: String,
  summary: String,

  classType: [String],
  whocanattend: [String], 

  organizedBy: String,
  speakerName: String,
  speakerDesignation: String,

  sessionRoles: {
    hod: String,
    coordinator: String,
    anchor: String,
    voteOfThanks: String,
  },
  noticeFile: [String], 
  photos: [String], 

  registrationLink: String,   //existing QR
  attendanceLink: String,     //New QR for attendance 

  createdBy: String
}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema);
