// components/MapView.jsx
// Displays a Leaflet map with colored damage markers

import React, { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Color for each severity level
const SEVERITY_COLORS = {
  "Severe":   "#ef4444",  // Red
  "Moderate": "#f97316",  // Orange
  "Minor":    "#22c55e"   // Green
};

function MapView({ reports }) {
  // Default center — Jaipur, Rajasthan
  const defaultCenter = [26.9124, 75.7873];

  // If there are reports, center on the first one
  const center = reports.length > 0
    ? [reports[0].latitude, reports[0].longitude]
    : defaultCenter;

  return (
    <div style={{ height: "420px", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Map tiles — the actual map imagery from OpenStreetMap (free) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© OpenStreetMap contributors'
        />

        {/* Render a circle marker for each report */}
        {reports.map((report) => (
          <CircleMarker
            key={report._id}
            center={[report.latitude, report.longitude]}
            radius={10}
            fillColor={SEVERITY_COLORS[report.severity] || "#94a3b8"}
            color={SEVERITY_COLORS[report.severity] || "#94a3b8"}
            weight={2}
            opacity={0.9}
            fillOpacity={0.6}
          >
            {/* Popup shown when clicking a marker */}
            <Popup>
              <div style={{ minWidth: "180px" }}>
                <strong style={{ fontSize: "14px" }}>
                  {report.damageType?.toUpperCase() || "DAMAGE"}
                </strong>
                <br />
                <span style={{
                  color: SEVERITY_COLORS[report.severity],
                  fontWeight: "bold"
                }}>
                  {report.severity} Severity
                </span>
                <br />
                <span style={{ color: "#666", fontSize: "12px" }}>
                  Status: {report.status}
                </span>
                <br />
                <span style={{ color: "#999", fontSize: "11px" }}>
                  {new Date(report.reportedAt).toLocaleDateString()}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;