// routes/reports.js
// This file handles all /api/reports requests

const express = require("express");
const router = express.Router();    // Router = mini express app for one group of routes
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const Report = require("../models/Report");  // Import our schema

// Multer config — store uploaded files in memory (not on disk)
// memoryStorage() means the file lives in RAM temporarily
const upload = multer({ storage: multer.memoryStorage() });

// =====================================================
// ROUTE 1: POST /api/reports
// Citizen submits a new road damage report
// =====================================================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    // Basic validation — latitude and longitude are required
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: "Latitude and longitude are required" 
      });
    }

    let damageType = "unknown";
    let severity = "Minor";
    let confidence = 0;

    // Step 1: Send image to AI service (if image was uploaded)
    if (req.file) {
      try {
        // Build a form to send the image file
        const form = new FormData();
        form.append("image", req.file.buffer, {
          filename: req.file.originalname,
          contentType: req.file.mimetype,
        });

        // Call your Python AI service
        const aiResponse = await axios.post(
          `${process.env.AI_SERVICE_URL}/detect`,
          form,
          { headers: form.getHeaders() }
        );

        // Extract the top detection result
        const aiData = aiResponse.data;
        if (aiData.damage_detected && aiData.detections.length > 0) {
          const top = aiData.detections[0];
          damageType = top.type;
          severity = top.severity;
          confidence = top.confidence;
        }

      } catch (aiError) {
        // If AI service is down, still save the report
        // Just without AI analysis
        console.log("AI service unavailable, saving report without analysis");
      }
    }

    // Step 2: Save the report to MongoDB
    const report = await Report.create({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || "Unknown location",
      damageType,
      severity,
      confidence,
      imageUrl: req.file ? "uploaded" : "no_image"
    });

    // Step 3: Send success response back to frontend
    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report: report,
      aiResult: {
        damageType,
        severity,
        confidence
      }
    });

  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: "Failed to create report: " + error.message });
  }
});

// =====================================================
// ROUTE 2: GET /api/reports
// Fetch all reports (for the authority dashboard map)
// =====================================================
router.get("/", async (req, res) => {
  try {
    // Find all reports, newest first
    const reports = await Report.find().sort({ reportedAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// =====================================================
// ROUTE 3: PATCH /api/reports/:id/status
// Authority updates the repair status of a report
// =====================================================
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    // Validate the status value
    const allowedStatuses = ["Reported", "Acknowledged", "In Progress", "Completed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Find and update the report in MongoDB
    const report = await Report.findByIdAndUpdate(
      req.params.id,           // The report ID from the URL
      { 
        status: status, 
        updatedAt: new Date()  // Record when it was updated
      },
      { new: true }            // Return the UPDATED document
    );

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({ success: true, report });

  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// =====================================================
// ROUTE 4: GET /api/reports/:id
// Get a single report by its ID
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

module.exports = router;