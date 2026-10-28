import React from "react";
import { Sparkles, Layers } from "lucide-react";

export default function PresetBar({ presets, selectedPresetId, onSelectPreset }) {
  const getCategoryColor = (category) => {
    switch (category) {
      case "Metals": return "#cbd5e1";
      case "Polymers": return "#38bdf8";
      case "Ceramics": return "#f59e0b";
      case "Composites": return "#10b981";
      default: return "#94a3b8";
    }
  };

  return (
    <div style={{
      background: "rgba(14, 18, 26, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.07)",
      borderRadius: "12px",
      padding: "14px 18px",
      marginBottom: "24px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "12px",
        flexWrap: "wrap",
        gap: "8px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={16} color="#60a5fa" />
          <span style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#e2e8f0",
            letterSpacing: "-0.01em"
          }}>
            Real-World Engineering Presets
          </span>
          <span style={{ fontSize: "11px", color: "#64748b" }}>
            (Load authentic handbook baseline properties for instant classification)
          </span>
        </div>
      </div>

      {/* Preset Chips */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px"
      }}>
        {presets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          const catColor = getCategoryColor(preset.category);

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              style={{
                background: isSelected 
                  ? "rgba(37, 99, 235, 0.18)" 
                  : "rgba(255, 255, 255, 0.03)",
                border: isSelected 
                  ? "1px solid rgba(96, 165, 250, 0.5)" 
                  : "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "8px",
                padding: "7px 12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isSelected ? "0 0 12px rgba(37, 99, 235, 0.25)" : "none"
              }}
            >
              <span style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: catColor
              }} />
              <span style={{
                fontSize: "12px",
                fontWeight: isSelected ? 600 : 500,
                color: isSelected ? "#f8fafc" : "#cbd5e1"
              }}>
                {preset.name}
              </span>
              <span style={{
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: catColor,
                opacity: 0.8,
                background: "rgba(0, 0, 0, 0.3)",
                padding: "1px 5px",
                borderRadius: "3px"
              }}>
                {preset.category}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
