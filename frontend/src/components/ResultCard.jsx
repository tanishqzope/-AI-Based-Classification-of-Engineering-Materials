import React, { useState } from "react";
import { 
  CheckCircle2, 
  BarChart2, 
  BookOpen, 
  Layers, 
  AlertTriangle, 
  Zap, 
  Activity, 
  Atom,
  ChevronRight,
  Sparkles
} from "lucide-react";

export default function ResultCard({ result, loading }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="glass-panel" style={{
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        minHeight: "420px"
      }}>
        <div style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          border: "3px solid rgba(255, 255, 255, 0.1)",
          borderTopColor: "#38bdf8",
          animation: "spin 0.8s linear infinite"
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "#e2e8f0" }}>
            Evaluating Multi-Property Vector...
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            Running Random Forest inference and cross-referencing materials database
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel" style={{
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        minHeight: "420px",
        color: "#64748b"
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.5)"
        }}>
          <Atom size={28} color="#475569" strokeWidth={1.5} />
        </div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "#94a3b8" }}>
            Awaiting Specimen Parameters
          </div>
          <div style={{ fontSize: "12px", color: "#64748b", maxWidth: "340px", marginTop: "4px", lineHeight: "1.6" }}>
            Adjust the physical and mechanical properties on the left, or select a preset, then click <strong>Classify Material</strong> to run classification.
          </div>
        </div>
      </div>
    );
  }

  const {
    predicted_class,
    confidence,
    probabilities,
    characteristics,
    classification_reasoning,
    comparison_with_class_averages
  } = result;

  // Determine styling based on predicted material class
  const getClassTheme = (className) => {
    switch (className) {
      case "Metals":
        return {
          primary: "#cbd5e1",
          glow: "rgba(203, 213, 225, 0.15)",
          bgTint: "rgba(203, 213, 225, 0.05)",
          border: "rgba(203, 213, 225, 0.3)",
          label: "Metallic Alloy",
          subtitle: "Crystalline electron-gas lattice with high ductility & thermal/electrical conduction."
        };
      case "Polymers":
        return {
          primary: "#38bdf8",
          glow: "rgba(56, 189, 248, 0.15)",
          bgTint: "rgba(56, 189, 248, 0.05)",
          border: "rgba(56, 189, 248, 0.3)",
          label: "Engineering Polymer",
          subtitle: "Covalent macromolecular chain structure with high electrical insulation."
        };
      case "Ceramics":
        return {
          primary: "#f59e0b",
          glow: "rgba(245, 158, 11, 0.15)",
          bgTint: "rgba(245, 158, 11, 0.05)",
          border: "rgba(245, 158, 11, 0.3)",
          label: "Technical Ceramic",
          subtitle: "Ionic-covalent refractory crystal with extreme hardness and thermal wear resistance."
        };
      case "Composites":
        return {
          primary: "#10b981",
          glow: "rgba(16, 185, 129, 0.15)",
          bgTint: "rgba(16, 185, 129, 0.05)",
          border: "rgba(16, 185, 129, 0.3)",
          label: "Advanced Composite",
          subtitle: "Engineered multi-phase fiber/matrix system with ultra-high specific strength."
        };
      default:
        return {
          primary: "#94a3b8",
          glow: "rgba(148, 163, 184, 0.15)",
          bgTint: "rgba(255, 255, 255, 0.03)",
          border: "rgba(255, 255, 255, 0.1)",
          label: className,
          subtitle: "Classified engineering material."
        };
    }
  };

  const theme = getClassTheme(predicted_class);
  const confidencePct = (confidence * 100).toFixed(1);

  return (
    <div className="glass-panel" style={{
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      border: `1px solid ${theme.border}`,
      boxShadow: `0 16px 40px -10px rgba(0, 0, 0, 0.8), 0 0 24px ${theme.glow}`
    }}>
      {/* Classification Outcome Hero */}
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "14px",
        paddingBottom: "18px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
      }}>
        <div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: theme.primary,
            background: theme.bgTint,
            border: `1px solid ${theme.border}`,
            padding: "3px 8px",
            borderRadius: "4px",
            marginBottom: "8px"
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: theme.primary
            }} />
            Predicted Material Class
          </div>

          <h2 style={{
            fontSize: "28px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            {predicted_class}
            <span style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#94a3b8",
              fontFamily: "var(--font-mono)"
            }}>
              ({theme.label})
            </span>
          </h2>
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
            {theme.subtitle}
          </p>
        </div>

        {/* Confidence Gauge Pill */}
        <div style={{
          background: "rgba(10, 12, 16, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "10px",
          padding: "10px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.8)"
        }}>
          <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Model Confidence
          </span>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            gap: "4px"
          }}>
            <span style={{
              fontSize: "22px",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              color: theme.primary
            }}>
              {confidencePct}%
            </span>
          </div>
          {/* Subtle confidence mini bar */}
          <div style={{
            width: "90px",
            height: "4px",
            background: "#1e293b",
            borderRadius: "2px",
            marginTop: "4px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${confidencePct}%`,
              height: "100%",
              background: theme.primary,
              borderRadius: "2px",
              transition: "width 0.4s ease"
            }} />
          </div>
        </div>
      </div>

      {/* Probability Distribution Across All 4 Material Classes */}
      <div style={{
        background: "rgba(10, 12, 16, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "10px",
        padding: "14px 16px"
      }}>
        <div style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <BarChart2 size={13} color="#60a5fa" />
          Classification Probability Distribution
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {probabilities && Object.entries(probabilities).map(([clsName, probVal]) => {
            const probPct = (probVal * 100).toFixed(1);
            const isTarget = clsName === predicted_class;
            const barColor = getClassTheme(clsName).primary;

            return (
              <div key={clsName} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)"
                }}>
                  <span style={{
                    color: isTarget ? "#f1f5f9" : "#64748b",
                    fontWeight: isTarget ? 600 : 400
                  }}>
                    {clsName} {isTarget && "•"}
                  </span>
                  <span style={{
                    color: isTarget ? barColor : "#64748b",
                    fontWeight: isTarget ? 600 : 400
                  }}>
                    {probPct}%
                  </span>
                </div>
                <div style={{
                  width: "100%",
                  height: "5px",
                  background: "#141822",
                  borderRadius: "3px",
                  overflow: "hidden",
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)"
                }}>
                  <div style={{
                    width: `${probPct}%`,
                    height: "100%",
                    background: barColor,
                    borderRadius: "3px",
                    transition: "width 0.4s ease",
                    opacity: isTarget ? 1 : 0.35
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Physics-Guided Decision Reasoning */}
      <div style={{
        background: "rgba(12, 16, 24, 0.75)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "10px",
        padding: "14px 16px",
        boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.6)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "8px"
        }}>
          <Sparkles size={13} color={theme.primary} />
          Model Classification Rationale
        </div>
        <p style={{
          fontSize: "12px",
          color: "#cbd5e1",
          lineHeight: "1.65"
        }}>
          {classification_reasoning}
        </p>
      </div>

      {/* Tabs for Material Profile Exploration */}
      <div>
        <div style={{
          display: "flex",
          gap: "6px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "8px",
          marginBottom: "14px"
        }}>
          {[
            { id: "overview", label: "Characteristics & Bonding" },
            { id: "applications", label: "Typical Applications" },
            { id: "advantages", label: "Pros & Design Limits" },
            { id: "benchmarks", label: "Dataset Metrics" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? "rgba(255, 255, 255, 0.07)" : "transparent",
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? "#f1f5f9" : "#64748b",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Characteristics & Bonding */}
        {activeTab === "overview" && characteristics && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
            <div style={{
              background: "rgba(255, 255, 255, 0.02)",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.04)"
            }}>
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>Atomic & Microstructural Framework:</span>
              <p style={{ color: "#cbd5e1", marginTop: "3px", lineHeight: "1.5" }}>
                {characteristics.atomic_structure}
              </p>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.02)",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.04)"
            }}>
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>Mechanical Behavior:</span>
              <p style={{ color: "#cbd5e1", marginTop: "3px", lineHeight: "1.5" }}>
                {characteristics.mechanical_profile}
              </p>
            </div>

            <div style={{
              background: "rgba(255, 255, 255, 0.02)",
              padding: "10px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.04)"
            }}>
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>Thermal & Electrical Profile:</span>
              <p style={{ color: "#cbd5e1", marginTop: "3px", lineHeight: "1.5" }}>
                {characteristics.thermal_electrical_profile}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Typical Applications */}
        {activeTab === "applications" && characteristics && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
              Key industrial engineering deployments:
            </div>
            {characteristics.typical_applications?.map((app, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  fontSize: "12px",
                  color: "#cbd5e1",
                  background: "rgba(255, 255, 255, 0.02)",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.04)"
                }}
              >
                <ChevronRight size={14} color={theme.primary} style={{ marginTop: "2px", flexShrink: 0 }} />
                <span>{app}</span>
              </div>
            ))}

            {characteristics.representative_materials && (
              <div style={{
                marginTop: "10px",
                padding: "10px 12px",
                background: "rgba(255, 255, 255, 0.02)",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.05)"
              }}>
                <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Notable Commercial Examples:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                  {characteristics.representative_materials.map((mat, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        color: "#94a3b8",
                        background: "rgba(0, 0, 0, 0.3)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        border: "1px solid rgba(255, 255, 255, 0.06)"
                      }}
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Pros & Limits */}
        {activeTab === "advantages" && characteristics && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {/* Advantages */}
            <div style={{
              background: "rgba(16, 185, 129, 0.04)",
              border: "1px solid rgba(16, 185, 129, 0.15)",
              borderRadius: "8px",
              padding: "12px"
            }}>
              <span style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#6ee7b7",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: "8px"
              }}>
                Engineering Strengths
              </span>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                {characteristics.key_advantages?.map((adv, i) => (
                  <li key={i} style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: "1.4" }}>
                    • {adv}
                  </li>
                ))}
              </ul>
            </div>

            {/* Design Limitations */}
            <div style={{
              background: "rgba(245, 158, 11, 0.04)",
              border: "1px solid rgba(245, 158, 11, 0.15)",
              borderRadius: "8px",
              padding: "12px"
            }}>
              <span style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#fcd34d",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: "8px"
              }}>
                Design Limits & Failure Modes
              </span>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "6px" }}>
                {characteristics.design_limitations?.map((lim, i) => (
                  <li key={i} style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: "1.4" }}>
                    • {lim}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 4: Dataset Comparison */}
        {activeTab === "benchmarks" && comparison_with_class_averages && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Statistical alignment with benchmark population for <strong>{predicted_class}</strong>:
            </div>
            <div style={{
              overflowX: "auto",
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.06)"
            }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                textAlign: "left"
              }}>
                <thead>
                  <tr style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#64748b"
                  }}>
                    <th style={{ padding: "8px 12px" }}>Property</th>
                    <th style={{ padding: "8px 12px" }}>Specimen Value</th>
                    <th style={{ padding: "8px 12px" }}>Class Mean</th>
                    <th style={{ padding: "8px 12px" }}>Z-Score</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(comparison_with_class_averages).map(([propKey, stat]) => {
                    const labelsMap = {
                      density: "Density (g/cm³)",
                      tensile_strength: "Tensile Strength (MPa)",
                      thermal_conductivity: "Thermal Cond. (W/m·K)",
                      electrical_conductivity_log10: "Log10 Elec. Cond."
                    };
                    return (
                      <tr key={propKey} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                        <td style={{ padding: "8px 12px", color: "#e2e8f0" }}>{labelsMap[propKey] || propKey}</td>
                        <td style={{ padding: "8px 12px", color: "#38bdf8", fontWeight: 600 }}>{stat.input_value}</td>
                        <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{stat.class_mean}</td>
                        <td style={{ padding: "8px 12px", color: Math.abs(stat.z_score) < 1.5 ? "#6ee7b7" : "#fcd34d" }}>
                          {stat.z_score > 0 ? `+${stat.z_score}` : stat.z_score}σ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
