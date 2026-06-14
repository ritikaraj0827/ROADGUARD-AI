// pages/Dashboard.jsx
// Authority dashboard — map, stats, report management

import React, { useState, useEffect } from "react";
import axios from "axios";
import MapView from "../components/MapView";
import SeverityChart from "../components/SeverityChart";

const API_URL = "http://localhost:5000";

// Status options for the dropdown
const STATUS_OPTIONS = ["Reported", "Acknowledged", "In Progress", "Completed"];

const STATUS_COLORS = {
  "Reported":     { bg: "#ef444420", color: "#ef4444" },
  "Acknowledged": { bg: "#f9731620", color: "#f97316" },
  "In Progress":  { bg: "#3b82f620", color: "#3b82f6" },
  "Completed":    { bg: "#22c55e20", color: "#22c55e" }
};

const SEVERITY_COLORS = {
  "Severe":   "#ef4444",
  "Moderate": "#f97316",
  "Minor":    "#22c55e"
};

function Dashboard() {
  const [reports, setReports] = useState([]);       // All reports from DB
  const [stats, setStats]     = useState(null);     // Dashboard stats
  const [loading, setLoading] = useState(true);     // Loading state
  const [error, setError]     = useState(null);

  // -------------------------------------------------------
  // Fetch data when component loads
  // useEffect runs code after the component first appears
  // The [] means "run only once on first load"
  // -------------------------------------------------------
  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);  // Cleanup on unmount
  }, []);

  const fetchData = async () => {
    try {
      // Fetch both reports and stats at the same time (parallel)
      const [reportsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/reports`),
        axios.get(`${API_URL}/api/dashboard/stats`)
      ]);
      setReports(reportsRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      setError("Cannot connect to backend. Make sure it's running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // Update the status of a report
  // -------------------------------------------------------
  const updateStatus = async (reportId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/api/reports/${reportId}/status`, {
        status: newStatus
      });
      // Refresh data after update
      fetchData();
    } catch (err) {
      alert("Failed to update status. Try again.");
    }
  };

  // -------------------------------------------------------
  // Helper to get a stat count by name
  // -------------------------------------------------------
  const getStatCount = (arr, key) => {
    if (!arr) return 0;
    const found = arr.find(item => item._id === key);
    return found ? found.count : 0;
  };

  // -------------------------------------------------------
  // LOADING STATE
  // -------------------------------------------------------
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px", color: "#64748b" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>⏳</div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  // -------------------------------------------------------
  // ERROR STATE
  // -------------------------------------------------------
  if (error) {
    return (
      <div style={{
        maxWidth: "500px",
        margin: "60px auto",
        textAlign: "center",
        padding: "24px"
      }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>⚠️</div>
        <p style={{ color: "#ef4444", marginBottom: "8px", fontWeight: "600" }}>
          Connection Error
        </p>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
          {error}
        </p>
        <button
          onClick={fetchData}
          style={{
            background: "#38bdf8",
            color: "#0f172a",
            border: "none",
            borderRadius: "8px",
            padding: "10px 20px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // -------------------------------------------------------
  // MAIN DASHBOARD RENDER
  // -------------------------------------------------------
  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>

      {/* Page Title */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#f1f5f9" }}>
          Authority Dashboard
        </h1>
        <p style={{ color: "#475569", fontSize: "14px" }}>
          Live road damage reports · Auto-refreshes every 30 seconds
        </p>
      </div>

      {/* STATS CARDS ROW */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        {[
          { label: "Total Reports", value: stats?.total || 0, icon: "📊", color: "#38bdf8" },
          { label: "Severe",        value: getStatCount(stats?.bySeverity, "Severe"),      icon: "🔴", color: "#ef4444" },
          { label: "Moderate",      value: getStatCount(stats?.bySeverity, "Moderate"),    icon: "🟠", color: "#f97316" },
          { label: "Completed",     value: getStatCount(stats?.byStatus,   "Completed"),   icon: "✅", color: "#22c55e" },
          { label: "In Progress",   value: getStatCount(stats?.byStatus,   "In Progress"), icon: "🔧", color: "#3b82f6" },
        ].map((card, i) => (
          <div key={i} style={{
            background: "#1e293b",
            borderRadius: "12px",
            padding: "18px",
            border: "1px solid #334155"
          }}>
            <div style={{ fontSize: "22px", marginBottom: "6px" }}>{card.icon}</div>
            <div style={{
              fontSize: "28px",
              fontWeight: "700",
              color: card.color,
              lineHeight: 1
            }}>
              {card.value}
            </div>
            <div style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* MAP + CHART ROW */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "16px",
        marginBottom: "24px"
      }}>
        {/* Map */}
        <div style={{
          background: "#1e293b",
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid #334155"
        }}>
          <p style={{
            color: "#64748b",
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "12px",
            letterSpacing: "0.05em"
          }}>
            DAMAGE MAP
          </p>
          <MapView reports={reports} />
          {/* Map legend */}
          <div style={{
            display: "flex",
            gap: "16px",
            marginTop: "12px",
            justifyContent: "center"
          }}>
            {[["Severe","#ef4444"], ["Moderate","#f97316"], ["Minor","#22c55e"]].map(([label, color]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: color
                }} />
                <span style={{ color: "#64748b", fontSize: "12px" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Chart */}
        <div style={{
          background: "#1e293b",
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid #334155"
        }}>
          <p style={{
            color: "#64748b",
            fontSize: "12px",
            fontWeight: "600",
            marginBottom: "8px",
            letterSpacing: "0.05em"
          }}>
            SEVERITY BREAKDOWN
          </p>
          <SeverityChart data={stats?.bySeverity || []} />
        </div>
      </div>

      {/* REPORTS TABLE */}
      <div style={{
        background: "#1e293b",
        borderRadius: "16px",
        border: "1px solid #334155",
        overflow: "hidden"
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #334155" }}>
          <p style={{
            color: "#64748b",
            fontSize: "12px",
            fontWeight: "600",
            letterSpacing: "0.05em"
          }}>
            ALL REPORTS ({reports.length})
          </p>
        </div>

        {reports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#475569" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🛣️</div>
            <p>No reports yet. Submit one using the Report Damage screen.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #334155" }}>
                  {["Type", "Severity", "Location", "Reported", "Status", "Action"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: "#475569",
                      fontSize: "12px",
                      fontWeight: "600",
                      letterSpacing: "0.05em"
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((report, idx) => (
                  <tr key={report._id} style={{
                    borderBottom: "1px solid #1e293b",
                    background: idx % 2 === 0 ? "transparent" : "#0f172a20"
                  }}>
                    {/* Damage Type */}
                    <td style={{ padding: "14px 16px", color: "#e2e8f0", fontSize: "14px", textTransform: "capitalize" }}>
                      {report.damageType || "Unknown"}
                    </td>

                    {/* Severity Badge */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: `${SEVERITY_COLORS[report.severity]}20`,
                        color: SEVERITY_COLORS[report.severity] || "#94a3b8",
                        border: `1px solid ${SEVERITY_COLORS[report.severity] || "#94a3b8"}`,
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {report.severity}
                      </span>
                    </td>

                    {/* Location */}
                    <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "13px" }}>
                      {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
                    </td>

                    {/* Date */}
                    <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "13px" }}>
                      {new Date(report.reportedAt).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        background: STATUS_COLORS[report.status]?.bg || "#33415520",
                        color: STATUS_COLORS[report.status]?.color || "#94a3b8",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "600"
                      }}>
                        {report.status}
                      </span>
                    </td>

                    {/* Status Update Dropdown */}
                    <td style={{ padding: "14px 16px" }}>
                      <select
                        value={report.status}
                        onChange={(e) => updateStatus(report._id, e.target.value)}
                        style={{
                          background: "#0f172a",
                          color: "#94a3b8",
                          border: "1px solid #334155",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;