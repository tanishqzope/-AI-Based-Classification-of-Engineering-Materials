import React from "react";
import { Cpu, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export default function Header({ backendConnected, isModelLoaded }) {
  return (
    <header style={{
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
      background: "rgba(11, 14, 20, 0.8)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      padding: "18px 24px",
      position: "sticky",
      top: 0,
      zIndex: 50,
      marginBottom: "28px"
    }}>
      <div style={{
        maxWidth: "1320px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        {/* Brand & Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)"
          }}>
            <Cpu size={22} color="#60a5fa" strokeWidth={1.8} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{
                fontSize: "19px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                color: "#f8fafc"
              }}>
                Engineering Materials Classifier
              </h1>
              <span style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                background: "rgba(59, 130, 246, 0.12)",
                color: "#93c5fd",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                padding: "2px 7px",
                borderRadius: "4px"
              }}>
                ML System
              </span>
            </div>
            <p style={{
              fontSize: "12px",
              color: "#64748b",
              marginTop: "2px"
            }}>
              Physics-guided Random Forest classification for Metals, Polymers, Ceramics, and Composites
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Model Accuracy Badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 10px",
            borderRadius: "6px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            fontSize: "12px",
            color: "#94a3b8"
          }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>RF Model: <strong style={{ color: "#e2e8f0" }}>99.8% Test Acc</strong></span>
          </div>

          {/* Backend Connection Status */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "5px 12px",
            borderRadius: "6px",
            background: backendConnected 
              ? "rgba(16, 185, 129, 0.08)" 
              : "rgba(245, 158, 11, 0.08)",
            border: backendConnected 
              ? "1px solid rgba(16, 185, 129, 0.25)" 
              : "1px solid rgba(245, 158, 11, 0.25)",
            fontSize: "12px"
          }}>
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: backendConnected ? "#10b981" : "#f59e0b",
              boxShadow: backendConnected 
                ? "0 0 8px rgba(16, 185, 129, 0.6)" 
                : "0 0 8px rgba(245, 158, 11, 0.6)"
            }} />
            <span style={{
              color: backendConnected ? "#6ee7b7" : "#fcd34d",
              fontWeight: 500
            }}>
              {backendConnected ? "FastAPI Online" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
