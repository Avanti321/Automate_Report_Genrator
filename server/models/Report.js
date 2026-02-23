const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  title: String,
  date: String,
  duration: String,
  agenda: String,
  summary: String,
  classType: [String],
  organizedBy: String,
  speakerName: String,
  speakerDesignation: String,

  sessionRoles: {
    hod: String,
    coordinator: String,
    anchor: String,
    voteOfThanks: String,
  },

  noticeFile: String,
  photos: [String],
  createdBy: String
}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema);