// models/Report.js
// This file defines what a "Report" looks like in the database
// Think of it as designing the columns of a spreadsheet

const mongoose = require("mongoose");

// Define the schema — the shape of every report document
const ReportSchema = new mongoose.Schema({

  // URL of the uploaded image (stored in Cloudinary)
  imageUrl: {
    type: String,
    default: "no_image"
  },

  // GPS coordinates from the citizen's phone
  latitude: {
    type: Number,
    required: true   // This field is mandatory
  },
  longitude: {
    type: Number,
    required: true
  },

  // Human-readable address (optional)
  address: {
    type: String,
    default: "Unknown location"
  },

  // What kind of damage the AI detected
  damageType: {
    type: String,
    enum: ["pothole", "crack", "damaged_surface", "unknown"],
    default: "unknown"
  },

  // How bad the damage is
  severity: {
    type: String,
    enum: ["Minor", "Moderate", "Severe"],
    default: "Minor"
  },

  // Current repair status — updated by authorities
  status: {
    type: String,
    enum: ["Reported", "Acknowledged", "In Progress", "Completed"],
    default: "Reported"  // Every new report starts as "Reported"
  },

  // How confident was the AI? (0 to 1, e.g. 0.87 = 87% sure)
  confidence: {
    type: Number,
    default: 0
  },

  // Timestamps — auto-managed
  reportedAt: {
    type: Date,
    default: Date.now   // Automatically set to current time
  },
  updatedAt: {
    type: Date
  }

});

// Export this schema as "Report" — we'll import it in routes
module.exports = mongoose.model("Report", ReportSchema);