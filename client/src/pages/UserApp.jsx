// pages/UserApp.jsx
// The mobile-friendly screen citizens use to report road damage

import React, { useState } from "react";
import axios from "axios";

// Your backend URL
const API_URL = "http://localhost:5000";

function UserApp() {
  // State variables — React's memory for this component
  const [image, setImage] = useState(null);        // The selected image file
  const [preview, setPreview] = useState(null);    // Image preview URL
  const [location, setLocation] = useState(null);  // GPS coordinates
  const [loading, setLoading] = useState(false);   // Is a request in progress?
  const [result, setResult] = useState(null);      // AI result after submission
  const [error, setError] = useState(null);        // Error message if anything fails
  const [locationLoading, setLocationLoading] = useState(false);

  // -------------------------------------------------------
  // Handle image selection (from camera or gallery)
  // -------------------------------------------------------
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);

    // Create a preview URL so we can show the image on screen
    // URL.createObjectURL creates a temporary local URL for the file
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setResult(null);  // Clear previous result
    setError(null);
  };

  // -------------------------------------------------------
  // Get GPS location from the browser
  // -------------------------------------------------------
  const getLocation = () => {
    setLocationLoading(true);
    setError(null);

    // navigator.geolocation is built into every browser
    // It asks the user for permission, then returns coordinates
    if (!navigator.geolocation) {
      setError("Your browser doesn't support GPS location");
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      // SUCCESS callback
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationLoading(false);
      },
      // ERROR callback
      (err) => {
        setError("Could not get location. Please allow location access.");
        setLocationLoading(false);
      }
    );
  };

  // -------------------------------------------------------
  // Submit the report to the backend
  // -------------------------------------------------------
  const handleSubmit = async () => {
    if (!image) {
      setError("Please select a road photo first");
      return;
    }
    if (!location) {
      setError("Please capture your GPS location first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // FormData is used to send files + text together
      // Like filling out an HTML form
      const formData = new FormData();
      formData.append("image", image);
      formData.append("latitude", location.latitude);
      formData.append("longitude", location.longitude);
      formData.append("address", `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);

      // Send to backend
      const response = await axios.post(`${API_URL}/api/reports`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setResult(response.data);

    } catch (err) {
      setError("Submission failed. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // Reset form for a new report
  // -------------------------------------------------------
  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setLocation(null);
    setResult(null);
    setError(null);
  };

  // Severity color mapping
  const severityColor = {
    "Severe": "#ef4444",
    "Moderate": "#f97316",
    "Minor": "#22c55e"
  };

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div style={{
      maxWidth: "480px",
      margin: "0 auto",
      padding: "24px 16px"
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h1 style={{
          fontSize: "26px",
          fontWeight: "700",
          color: "#f1f5f9",
          marginBottom: "6px"
        }}>
          Report Road Damage
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px" }}>
          Help authorities fix roads faster with AI-powered detection
        </p>
      </div>

      {/* SUCCESS RESULT VIEW */}
      {result ? (
        <div style={{
          background: "#1e293b",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #334155",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
          <h2 style={{ color: "#22c55e", fontSize: "20px", marginBottom: "8px" }}>
            Report Submitted!
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "20px", fontSize: "14px" }}>
            Your report has been saved and authorities have been notified.
          </p>

          {/* AI Detection Result */}
          <div style={{
            background: "#0f172a",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px"
          }}>
            <p style={{ color: "#64748b", fontSize: "12px", marginBottom: "12px", fontWeight: "600" }}>
              AI ANALYSIS RESULT
            </p>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div>
                <p style={{ color: "#64748b", fontSize: "11px" }}>DAMAGE TYPE</p>
                <p style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "16px", textTransform: "capitalize" }}>
                  {result.aiResult?.damageType || "Unknown"}
                </p>
              </div>
              <div>
                <p style={{ color: "#64748b", fontSize: "11px" }}>SEVERITY</p>
                <p style={{
                  fontWeight: "700",
                  fontSize: "16px",
                  color: severityColor[result.aiResult?.severity] || "#94a3b8"
                }}>
                  {result.aiResult?.severity || "Unknown"}
                </p>
              </div>
              <div>
                <p style={{ color: "#64748b", fontSize: "11px" }}>CONFIDENCE</p>
                <p style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "16px" }}>
                  {result.aiResult?.confidence
                    ? `${(result.aiResult.confidence * 100).toFixed(0)}%`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleReset}
            style={{
              background: "#38bdf8",
              color: "#0f172a",
              border: "none",
              borderRadius: "10px",
              padding: "12px 28px",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "15px"
            }}
          >
            Report Another
          </button>
        </div>

      ) : (
        /* FORM VIEW */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Step 1 — Upload Photo */}
          <div style={{
            background: "#1e293b",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #334155"
          }}>
            <p style={{
              color: "#94a3b8",
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "12px",
              letterSpacing: "0.05em"
            }}>
              STEP 1 — ROAD PHOTO
            </p>

            {/* Image Preview */}
            {preview ? (
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <img
                  src={preview}
                  alt="Road preview"
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "10px"
                  }}
                />
                <button
                  onClick={() => { setImage(null); setPreview(null); }}
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    background: "#0f172a",
                    color: "#ef4444",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "12px"
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            ) : (
              <label style={{
                display: "block",
                border: "2px dashed #334155",
                borderRadius: "10px",
                padding: "32px",
                textAlign: "center",
                cursor: "pointer",
                marginBottom: "12px",
                transition: "border-color 0.2s"
              }}>
                <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>📷</span>
                <span style={{ color: "#64748b", fontSize: "14px" }}>
                  Tap to take photo or upload from gallery
                </span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>

          {/* Step 2 — GPS Location */}
          <div style={{
            background: "#1e293b",
            borderRadius: "16px",
            padding: "20px",
            border: "1px solid #334155"
          }}>
            <p style={{
              color: "#94a3b8",
              fontSize: "12px",
              fontWeight: "600",
              marginBottom: "12px",
              letterSpacing: "0.05em"
            }}>
              STEP 2 — GPS LOCATION
            </p>

            {location ? (
              <div style={{
                background: "#0f172a",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <span style={{ fontSize: "20px" }}>📍</span>
                <div>
                  <p style={{ color: "#22c55e", fontWeight: "600", fontSize: "14px" }}>
                    Location captured
                  </p>
                  <p style={{ color: "#64748b", fontSize: "12px" }}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={getLocation}
                disabled={locationLoading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: locationLoading ? "#334155" : "#1d4ed8",
                  color: "#fff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: "600",
                  fontSize: "15px",
                  cursor: locationLoading ? "wait" : "pointer"
                }}
              >
                {locationLoading ? "📡 Getting location..." : "📍 Capture GPS Location"}
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: "#ef444420",
              border: "1px solid #ef4444",
              borderRadius: "10px",
              padding: "12px 16px",
              color: "#ef4444",
              fontSize: "14px"
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !image || !location}
            style={{
              width: "100%",
              padding: "16px",
              background: (!image || !location || loading) ? "#334155" : "#38bdf8",
              color: (!image || !location || loading) ? "#64748b" : "#0f172a",
              border: "none",
              borderRadius: "12px",
              fontWeight: "700",
              fontSize: "16px",
              cursor: (!image || !location || loading) ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            {loading ? "🔍 Analyzing damage..." : "🚀 Submit Report"}
          </button>

          <p style={{ textAlign: "center", color: "#475569", fontSize: "12px" }}>
            AI will analyze the damage and alert local authorities automatically
          </p>
        </div>
      )}
    </div>
  );
}

export default UserApp;