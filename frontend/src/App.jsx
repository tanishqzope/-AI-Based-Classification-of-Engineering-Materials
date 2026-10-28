import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import PresetBar from "./components/PresetBar";
import PropertySlider from "./components/PropertySlider";
import ResultCard from "./components/ResultCard";
import { DEFAULT_PRESETS } from "./data/fallbackPresets";
import { Play, RotateCcw, AlertCircle, Info } from "lucide-react";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function App() {
  // Mechanical & Physical Properties State
  const [density, setDensity] = useState(4.43); // Titanium default
  const [tensileStrength, setTensileStrength] = useState(950);
  const [thermalConductivity, setThermalConductivity] = useState(6.7);
  const [elecCondLog10, setElecCondLog10] = useState(6.18);

  const [selectedPresetId, setSelectedPresetId] = useState("ti-6al-4v");
  const [presets, setPresets] = useState(DEFAULT_PRESETS);

  // API & Result State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check backend health on mount
  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setBackendConnected(data.status === "ok");
          }
          // Fetch dynamic metadata & presets if available
          try {
            const metaRes = await fetch(`${API_BASE_URL}/api/metadata`);
            if (metaRes.ok) {
              const metaData = await metaRes.json();
              if (isMounted && metaData.presets && metaData.presets.length > 0) {
                setPresets(metaData.presets);
              }
            }
          } catch (e) {
            // Keep default presets
          }
        } else {
          if (isMounted) setBackendConnected(false);
        }
      } catch (err) {
        if (isMounted) setBackendConnected(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 6000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Run initial classification on mount for default preset
  useEffect(() => {
    handleClassify();
  }, [backendConnected]);

  // Handle Preset Selection
  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setDensity(preset.density);
    setTensileStrength(preset.tensile_strength);
    setThermalConductivity(preset.thermal_conductivity);
    setElecCondLog10(preset.electrical_conductivity_log10);
    setErrorMessage("");
  };

  // Check if current inputs match any preset
  const handlePropertyChange = (setter) => (newVal) => {
    setter(newVal);
    setSelectedPresetId(null); // Clear selected preset chip if manually modified
    setErrorMessage("");
  };

  // Reset to default baseline values
  const handleReset = () => {
    const defaultPreset = DEFAULT_PRESETS[0];
    handleSelectPreset(defaultPreset);
  };

  // Execute Classification API Request
  const handleClassify = async () => {
    setLoading(true);
    setErrorMessage("");

    const payload = {
      density: parseFloat(density),
      tensile_strength: parseFloat(tensileStrength),
      thermal_conductivity: parseFloat(thermalConductivity),
      electrical_conductivity_log10: parseFloat(elecCondLog10)
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server responded with HTTP ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setBackendConnected(true);
    } catch (err) {
      console.warn("API request failed:", err.message);
      // Fallback: If backend is offline, provide a client-side simulated classification
      // so the interface remains fully interactive and responsive
      fallbackClassification(payload);
    } finally {
      setLoading(false);
    }
  };

  // Offline Fallback Heuristic Classifier
  const fallbackClassification = (payload) => {
    let predicted = "Metals";
    let conf = 0.98;

    const { density, tensile_strength, thermal_conductivity, electrical_conductivity_log10 } = payload;

    if (electrical_conductivity_log10 > 5.0 && thermal_conductivity > 10.0) {
      predicted = "Metals";
    } else if (density < 2.3 && electrical_conductivity_log10 < -6.0 && tensile_strength < 150) {
      predicted = "Polymers";
    } else if (tensile_strength > 300 && density < 2.5 && thermal_conductivity < 20.0) {
      predicted = "Composites";
    } else if (density > 2.2 && electrical_conductivity_log10 < -1.0 && tensile_strength < 450) {
      predicted = "Ceramics";
    } else if (density > 5.0) {
      predicted = "Metals";
    } else {
      predicted = "Composites";
    }

    const probabilities = {
      Metals: predicted === "Metals" ? 0.95 : 0.02,
      Polymers: predicted === "Polymers" ? 0.95 : 0.02,
      Ceramics: predicted === "Ceramics" ? 0.95 : 0.02,
      Composites: predicted === "Composites" ? 0.95 : 0.02
    };

    const simulatedCharacteristics = {
      title: predicted,
      atomic_structure: "Physics-informed classification based on Ashby material selection boundaries.",
      mechanical_profile: `Density: ${density} g/cm³, Tensile Strength: ${tensile_strength} MPa.`,
      thermal_electrical_profile: `Thermal: ${thermal_conductivity} W/m·K, Electrical: 10^${electrical_conductivity_log10} S/m.`,
      typical_applications: [
        "Aerospace and high-performance structural systems",
        "Industrial mechanical and civil assemblies",
        "High-durability precision components"
      ],
      key_advantages: [
        "Optimal balance of mass density and load capability",
        "High predictability under specified operating conditions"
      ],
      design_limitations: [
        "Environmental wear constraints based on operational boundary"
      ],
      representative_materials: ["Industrial Reference Standard"]
    };

    setResult({
      predicted_class: predicted,
      confidence: conf,
      probabilities: probabilities,
      characteristics: simulatedCharacteristics,
      classification_reasoning: `Classified as ${predicted} based on density (${density} g/cm³), tensile strength (${tensile_strength} MPa), and conductivity (10^${electrical_conductivity_log10} S/m). (Running in client-side fallback mode - connect FastAPI backend on port 8000 for trained Random Forest inference).`,
      comparison_with_class_averages: {
        density: { input_value: density, class_mean: density, class_std: 1.0, z_score: 0.0 },
        tensile_strength: { input_value: tensile_strength, class_mean: tensile_strength, class_std: 100.0, z_score: 0.0 },
        thermal_conductivity: { input_value: thermal_conductivity, class_mean: thermal_conductivity, class_std: 10.0, z_score: 0.0 },
        electrical_conductivity_log10: { input_value: electrical_conductivity_log10, class_mean: electrical_conductivity_log10, class_std: 1.0, z_score: 0.0 }
      }
    });

    setErrorMessage("FastAPI backend is offline (http://127.0.0.1:8000). Showing fallback estimation. Start backend with `python backend/main.py`.");
  };

  // Helper formatter for log10 conductivity readout
  const formatConductivityReadout = (logVal) => {
    if (logVal <= -10) return `10^${logVal.toFixed(1)} S/m (High Dielectric / Insulator)`;
    if (logVal < 0) return `10^${logVal.toFixed(1)} S/m (Weak / Insulator)`;
    if (logVal < 5) return `10^${logVal.toFixed(1)} S/m (Semiconductor / Dissipative)`;
    return `10^${logVal.toFixed(1)} S/m (High Conductor / Metal)`;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Header */}
      <Header backendConnected={backendConnected} />

      {/* Main Container */}
      <main style={{
        flex: 1,
        maxWidth: "1320px",
        width: "100%",
        margin: "0 auto",
        padding: "0 24px 48px 24px"
      }}>
        {/* Presets Bar */}
        <PresetBar
          presets={presets}
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
        />

        {/* Notice banner if backend is disconnected */}
        {!backendConnected && (
          <div style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            borderRadius: "10px",
            padding: "10px 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "12px",
            color: "#fcd34d"
          }}>
            <Info size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
            <span>
              Backend is starting or disconnected at <code>http://127.0.0.1:8000</code>. To start the live Random Forest model, run <code>python backend/main.py</code> in your terminal.
            </span>
          </div>
        )}

        {/* 2-Column Grid: Form Inputs & Results Card */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
          gap: "24px",
          alignItems: "start"
        }}>
          {/* LEFT: Input Matrix */}
          <div className="glass-panel" style={{
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "18px"
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "14px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
            }}>
              <div>
                <h2 style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#f8fafc",
                  letterSpacing: "-0.01em"
                }}>
                  Physical & Mechanical Input Vector
                </h2>
                <p style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                  Fine-tune specimen parameters using dual sliders or direct numeric entry.
                </p>
              </div>

              <button
                onClick={handleReset}
                title="Reset to Titanium Ti-6Al-4V default"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  fontSize: "11px",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Property 1: Mass Density */}
            <PropertySlider
              id="input-density"
              label="Mass Density"
              symbol="ρ"
              unit="g/cm³"
              value={density}
              min={0.8}
              max={20.0}
              step={0.05}
              description="Mass per unit volume. Fundamental weight and specific strength determinant."
              typicalRanges={[
                { label: "Polymers", range: "0.9 – 2.1", color: "#38bdf8" },
                { label: "Composites", range: "1.3 – 2.2", color: "#10b981" },
                { label: "Ceramics", range: "2.2 – 6.0", color: "#f59e0b" },
                { label: "Metals", range: "2.7 – 19.3", color: "#cbd5e1" }
              ]}
              onChange={handlePropertyChange(setDensity)}
            />

            {/* Property 2: Tensile Strength */}
            <PropertySlider
              id="input-tensile"
              label="Ultimate Tensile Strength"
              symbol="σ_ts"
              unit="MPa"
              value={tensileStrength}
              min={10}
              max={2000}
              step={5}
              description="Maximum engineering stress withstood in tension before necking or rupture."
              typicalRanges={[
                { label: "Polymers", range: "20 – 120", color: "#38bdf8" },
                { label: "Ceramics", range: "30 – 380", color: "#f59e0b" },
                { label: "Metals", range: "100 – 1800", color: "#cbd5e1" },
                { label: "Composites", range: "300 – 1900", color: "#10b981" }
              ]}
              onChange={handlePropertyChange(setTensileStrength)}
            />

            {/* Property 3: Thermal Conductivity */}
            <PropertySlider
              id="input-thermal"
              label="Thermal Conductivity"
              symbol="k"
              unit="W/(m·K)"
              value={thermalConductivity}
              min={0.1}
              max={420.0}
              step={0.5}
              description="Rate of steady-state heat flux transport through specimen cross-section."
              typicalRanges={[
                { label: "Polymers", range: "0.15 – 0.45", color: "#38bdf8" },
                { label: "Composites", range: "0.4 – 10", color: "#10b981" },
                { label: "Ceramics", range: "1.5 – 140", color: "#f59e0b" },
                { label: "Metals", range: "15 – 400", color: "#cbd5e1" }
              ]}
              onChange={handlePropertyChange(setThermalConductivity)}
            />

            {/* Property 4: Electrical Conductivity (Logarithmic) */}
            <PropertySlider
              id="input-elec"
              label="Electrical Conductivity (log₁₀)"
              symbol="σ_e"
              unit="log₁₀ S/m"
              value={elecCondLog10}
              min={-14.0}
              max={8.0}
              step={0.1}
              description="Logarithmic charge transport spanning dielectric insulators to conductors."
              typicalRanges={[
                { label: "Polymers", range: "-14 to -7", color: "#38bdf8" },
                { label: "Ceramics", range: "-12 to -1", color: "#f59e0b" },
                { label: "Composites", range: "-8 to +3", color: "#10b981" },
                { label: "Metals", range: "+6 to +7.8", color: "#cbd5e1" }
              ]}
              valueDisplayFormatter={formatConductivityReadout}
              onChange={handlePropertyChange(setElecCondLog10)}
            />

            {/* Primary Action Button */}
            <div style={{ paddingTop: "8px" }}>
              <button
                id="btn-classify"
                onClick={handleClassify}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  background: loading 
                    ? "#1e293b" 
                    : "linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)",
                  border: "1px solid rgba(96, 165, 250, 0.4)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  transition: "all 0.15s ease"
                }}
              >
                <Play size={16} fill="#ffffff" />
                <span>{loading ? "Analyzing Material Physics..." : "Classify Material"}</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Results Display Card */}
          <div>
            <ResultCard result={result} loading={loading} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255, 255, 255, 0.06)",
        padding: "18px 24px",
        textAlign: "center",
        fontSize: "12px",
        color: "#475569"
      }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
          <span>AI-Based Classification of Engineering Materials • Random Forest Model (Scikit-Learn)</span>
          <span>Classes: Metals • Polymers • Ceramics • Composites</span>
        </div>
      </footer>
    </div>
  );
}
