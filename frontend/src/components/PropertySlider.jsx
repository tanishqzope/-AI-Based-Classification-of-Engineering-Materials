import React from "react";
import { HelpCircle } from "lucide-react";

export default function PropertySlider({
  id,
  label,
  symbol,
  unit,
  value,
  min,
  max,
  step,
  description,
  typicalRanges,
  onChange,
  valueDisplayFormatter
}) {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    onChange(val);
  };

  const handleNumberChange = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(Math.min(max, Math.max(min, val)));
    }
  };

  return (
    <div style={{
      background: "rgba(16, 21, 29, 0.6)",
      border: "1px solid rgba(255, 255, 255, 0.07)",
      borderRadius: "12px",
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.35)",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease"
    }}>
      {/* Top row: Label, Symbol, and Numeric Input */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontSize: "12px",
            fontFamily: "var(--font-mono)",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "2px 7px",
            borderRadius: "4px",
            color: "#94a3b8",
            fontWeight: 600
          }}>
            {symbol}
          </span>
          <div>
            <div style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#e2e8f0",
              letterSpacing: "-0.01em"
            }}>
              {label}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              {description}
            </div>
          </div>
        </div>

        {/* Precision Numeric Input */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "#080a0e",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "8px",
          padding: "4px 8px",
          boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.8)"
        }}>
          <input
            id={id}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleNumberChange}
            style={{
              background: "transparent",
              border: "none",
              color: "#38bdf8",
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              fontWeight: 600,
              width: "72px",
              textAlign: "right",
              outline: "none"
            }}
          />
          <span style={{
            fontSize: "11px",
            color: "#64748b",
            fontFamily: "var(--font-mono)",
            userSelect: "none"
          }}>
            {unit}
          </span>
        </div>
      </div>

      {/* Range Slider Track with dynamic gradient fill */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <input
          id={`${id}-slider`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #38bdf8 ${percentage}%, #171d26 ${percentage}%, #171d26 100%)`
          }}
        />

        {/* Min / Max bounds & formatted readouts */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "10px",
          fontFamily: "var(--font-mono)",
          color: "#475569"
        }}>
          <span>{min} {unit}</span>
          {valueDisplayFormatter && (
            <span style={{ color: "#94a3b8", fontWeight: 500 }}>
              {valueDisplayFormatter(value)}
            </span>
          )}
          <span>{max} {unit}</span>
        </div>
      </div>

      {/* Typical Ranges Indicator Pills */}
      {typicalRanges && typicalRanges.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
          paddingTop: "4px",
          borderTop: "1px solid rgba(255, 255, 255, 0.04)",
          fontSize: "10px",
          color: "#64748b"
        }}>
          <span style={{ color: "#475569", fontWeight: 500 }}>Benchmarks:</span>
          {typicalRanges.map((tr, idx) => (
            <span
              key={idx}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                padding: "1px 6px",
                borderRadius: "3px",
                border: "1px solid rgba(255, 255, 255, 0.05)"
              }}
            >
              <strong style={{ color: tr.color || "#94a3b8" }}>{tr.label}:</strong> {tr.range}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
