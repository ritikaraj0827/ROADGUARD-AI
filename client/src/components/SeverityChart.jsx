// components/SeverityChart.jsx
// Pie chart showing severity breakdown

import React from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = {
  "Severe":   "#ef4444",
  "Moderate": "#f97316",
  "Minor":    "#22c55e"
};

function SeverityChart({ data }) {
  // data looks like: [{ _id: "Severe", count: 12 }, ...]
  // We reshape it for Recharts
  const chartData = data.map(item => ({
    name: item._id,
    value: item.count
  }));

  if (chartData.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#475569", padding: "40px" }}>
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={4}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={COLORS[entry.name] || "#64748b"}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            color: "#f1f5f9"
          }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default SeverityChart;