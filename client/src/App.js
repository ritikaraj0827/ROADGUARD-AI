// App.js — Controls which screen is shown

import React, { useState } from "react";
import UserApp from "./pages/UserApp";
import Dashboard from "./pages/Dashboard";
import "./index.css";

function App() {
  // activeScreen controls which page is visible
  // "user" = citizen upload screen
  // "dashboard" = authority dashboard
  const [activeScreen, setActiveScreen] = useState("user");

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a" }}>

      {/* Navigation Bar — top of every page */}
      <nav style={{
        background: "#1e293b",
        borderBottom: "1px solid #334155",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "22px" }}>🛣️</span>
          <span style={{
            fontWeight: "700",
            fontSize: "18px",
            color: "#38bdf8",
            letterSpacing: "-0.5px"
          }}>
            RoadGuard AI
          </span>
        </div>

        {/* Screen switcher buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveScreen("user")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              background: activeScreen === "user" ? "#38bdf8" : "#334155",
              color: activeScreen === "user" ? "#0f172a" : "#94a3b8",
              transition: "all 0.2s"
            }}
          >
            📱 Report Damage
          </button>
          <button
            onClick={() => setActiveScreen("dashboard")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              background: activeScreen === "dashboard" ? "#38bdf8" : "#334155",
              color: activeScreen === "dashboard" ? "#0f172a" : "#94a3b8",
              transition: "all 0.2s"
            }}
          >
            🗺️ Authority Dashboard
          </button>
        </div>
      </nav>

      {/* Render the active screen */}
      {activeScreen === "user" ? <UserApp /> : <Dashboard />}

    </div>
  );
}

export default App;