// Force Node.js to use Google DNS to fix Windows querySrv errors
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// index.js — The main server file
// This is what you run: "node index.js"

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();   // Load .env file variables

// Create the Express app
const app = express();

// -------------------------------------------------------
// MIDDLEWARE — code that runs on EVERY request
// -------------------------------------------------------

// Allow requests from React frontend (port 3000)
app.use(cors());

// Parse JSON request bodies
// Without this, req.body would be undefined
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------
// ROUTES — connect URL paths to route files
// -------------------------------------------------------

// Import your route files
const reportsRouter = require("./routes/reports");
const dashboardRouter = require("./routes/dashboard");

// Register them — any request to /api/reports goes to reports.js
app.use("/api/reports", reportsRouter);
app.use("/api/dashboard", dashboardRouter);

// Root endpoint — just to confirm server is running
app.get("/", (req, res) => {
  res.json({ 
    message: "RoadGuard AI Backend is running!",
    endpoints: {
      submitReport: "POST /api/reports",
      getAllReports: "GET /api/reports",
      updateStatus: "PATCH /api/reports/:id/status",
      dashboardStats: "GET /api/dashboard/stats"
    }
  });
});

// -------------------------------------------------------
// DATABASE CONNECTION
// -------------------------------------------------------
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
    
    // Only start the server AFTER database connects
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on http://localhost:${PORT}`);
      console.log(`📡 AI Service expected at: ${process.env.AI_SERVICE_URL}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("Check your MONGODB_URI in the .env file");
    process.exit(1);  // Stop the server if DB fails
  });