// routes/dashboard.js
// Provides statistics for the authority dashboard

const express = require("express");
const router = express.Router();
const Report = require("../models/Report");

// =====================================================
// GET /api/dashboard/stats
// Returns summary numbers for the dashboard cards
// =====================================================
router.get("/stats", async (req, res) => {
  try {
    // Count total reports
    const total = await Report.countDocuments();

    // Count by severity using MongoDB aggregation
    // Aggregation = doing math/grouping directly in the database
    const bySeverity = await Report.aggregate([
      { 
        $group: { 
          _id: "$severity",    // Group by the severity field
          count: { $sum: 1 }   // Count each group
        } 
      }
    ]);

    // Count by status
    const byStatus = await Report.aggregate([
      { 
        $group: { 
          _id: "$status", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Count by damage type
    const byType = await Report.aggregate([
      { 
        $group: { 
          _id: "$damageType", 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Get the 5 most recent reports
    const recentReports = await Report.find()
      .sort({ reportedAt: -1 })
      .limit(5);

    res.json({
      total,
      bySeverity,
      byStatus,
      byType,
      recentReports
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

module.exports = router;