"""
FastAPI Backend for AI-Based Engineering Materials Classification
Serves scikit-learn Random Forest model with physics-guided explanations.
Author: Antigravity
"""

import os
import json
import math
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import numpy as np
import pandas as pd
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "material_classifier.joblib")
METADATA_PATH = os.path.join(MODEL_DIR, "dataset_metadata.json")

# In-memory model and metadata caches
model_pipeline = None
metadata_cache: Dict[str, Any] = {}

# Comprehensive Engineering Characteristics Knowledge Base
MATERIAL_PROFILES = {
    "Metals": {
        "title": "Metals & Alloys",
        "tagline": "Crystalline structures held by delocalized metallic bonding with high electron mobility.",
        "atomic_structure": "Close-packed crystalline lattices (FCC, BCC, HCP) surrounded by a 'sea of electrons', allowing rapid momentum and energy transfer.",
        "mechanical_profile": "High tensile strength, moderate to high ductility, high fracture toughness, and substantial plastic deformation capacity.",
        "thermal_electrical_profile": "High thermal conductivity (typically 15 – 400 W/m·K) and excellent electrical conductivity (typically 10^6 – 10^8 S/m).",
        "key_advantages": [
            "Superior structural stiffness and load-bearing capacity",
            "Predictable ductile yield behavior before catastrophic fracture",
            "Excellent thermal dissipation and electrical current carriage",
            "Wide temperature operating range and machinability/weldability"
        ],
        "design_limitations": [
            "Susceptible to environmental oxidation, galvanic and pitting corrosion",
            "Relatively high mass density, increasing inertial loads",
            "Prone to cyclic fatigue failure at notch concentrations"
        ],
        "typical_applications": [
            "Aerospace structural spars, bulkheads, and turbine disks (Titanium, Nickel superalloys)",
            "Automotive chassis frames, suspension uprights, and powertrain blocks (Steel, Al alloys)",
            "High-voltage power transmission lines and heat exchangers (Copper, Aluminum)",
            "Civil infrastructure, bridges, and seismic load frames (Structural Steels)"
        ],
        "representative_materials": ["Titanium Grade 5 (Ti-6Al-4V)", "Aluminum 6061-T6", "Stainless Steel 316L", "Oxygen-Free Copper C10100", "Inconel 718"]
    },
    "Polymers": {
        "title": "Polymers & Thermoplastics",
        "tagline": "Long-chain macromolecular hydrocarbons joined by covalent backbones and van der Waals intermolecular forces.",
        "atomic_structure": "Linear, branched, or crosslinked macromolecular chains. Low crystal density with significant amorphous volume.",
        "mechanical_profile": "Low mass density (0.9 – 2.2 g/cm³), moderate tensile strength, high elongation at break, but low elastic modulus and creep sensitivity.",
        "thermal_electrical_profile": "Extremely low thermal conductivity (0.1 – 0.5 W/m·K) and excellent electrical resistivity (dielectric insulators, 10^-14 – 10^-7 S/m).",
        "key_advantages": [
            "Ultra-lightweight structural efficiency with low mass density",
            "Inherent resistance to chemical attack, acids, and atmospheric oxidation",
            "High electrical insulation breakdown threshold and low dielectric loss",
            "Economical net-shape manufacturing via injection molding and extrusion"
        ],
        "design_limitations": [
            "Restricted continuous operating temperatures (rarely exceeding 250°C)",
            "Viscoelastic time-dependent deformation (creep) under sustained loads",
            "Susceptibility to UV radiation photodegradation and solvent swelling"
        ],
        "typical_applications": [
            "Electrical wire insulation, connector housings, and circuit substrates (PTFE, PVC, PEEK)",
            "Impact-resistant safety visors, architectural glazing, and enclosures (Polycarbonate, PMMA)",
            "High-pressure chemical piping, valves, and seal rings (PTFE, PVDF, HDPE)",
            "Low-friction tribological bushings and lightweight gears (Nylon PA66, POM Delrin)"
        ],
        "representative_materials": ["Polyetheretherketone (PEEK)", "Polycarbonate (PC)", "Polytetrafluoroethylene (PTFE/Teflon)", "Nylon 6,6 (Polyamide)", "Ultra-High Molecular Weight PE (UHMWPE)"]
    },
    "Ceramics": {
        "title": "Engineering Ceramics",
        "tagline": "Inorganic, non-metallic compounds governed by strong ionic and covalent atomic bonds.",
        "atomic_structure": "Rigid ionic-covalent crystal frameworks without free dislocation movement, providing exceptional atomic binding energy.",
        "mechanical_profile": "Extremely high hardness and compressive strength, but low tensile strength and high flaw-sensitivity leading to brittle catastrophic fracture.",
        "thermal_electrical_profile": "Variable thermal conductivity (1.5 W/m·K in vitreous glasses to 150+ W/m·K in SiC/AlN), and electrical insulation to semi-conduction.",
        "key_advantages": [
            "Exceptional refractory threshold with operating temperatures exceeding 1400°C",
            "Supreme surface hardness and abrasive wear resistance",
            "Complete chemical inertness in aggressively oxidative and acidic environments",
            "Low coefficient of thermal expansion and high dimensional stability"
        ],
        "design_limitations": [
            "Zero plastic yield margin; sensitive to micro-cracks and tensile stress concentrations",
            "Extremely difficult and costly to machine after sintering (requires diamond grinding)",
            "Susceptible to thermal shock fractures during rapid temperature transients"
        ],
        "typical_applications": [
            "Ballistic armor strike plates and anti-wear liners (Silicon Carbide, Boron Carbide)",
            "High-voltage dielectric insulators and spark plug cores (Alumina Al2O3)",
            "High-temperature thermal barrier coatings on turbine blades (Yttria-Stabilized Zirconia)",
            "Power electronic ceramic heat sinks and semiconductor substrates (Aluminum Nitride AlN)"
        ],
        "representative_materials": ["Technical Alumina (Al2O3 99.5%)", "Sintered Silicon Carbide (SiC)", "Hot-Pressed Silicon Nitride (Si3N4)", "Yttria-Stabilized Zirconia (YSZ)", "Fused Silica"]
    },
    "Composites": {
        "title": "Advanced Engineering Composites",
        "tagline": "Multiphase tailored systems combining high-strength reinforcing fibers with a continuous matrix.",
        "atomic_structure": "Macroscopically heterogeneous combination of high-modulus fibers (carbon, glass, aramid) embedded in thermoset resin, metal, or ceramic matrices.",
        "mechanical_profile": "Extraordinary strength-to-weight and stiffness-to-weight ratios, directional anisotropic load tailoring, and exceptional fatigue tolerance.",
        "thermal_electrical_profile": "Low through-thickness thermal conduction, low-to-moderate electrical conductivity depending on fiber constitution (CFRP is semi-conductive, GFRP is insulating).",
        "key_advantages": [
            "Tailorable anisotropic properties aligned with specific principal stress trajectories",
            "Outstanding fatigue endurance ratio far surpassing conventional metals",
            "High vibrational damping capacity reducing resonance harmonics",
            "Impervious to galvanic corrosion when paired with non-conductive matrices"
        ],
        "design_limitations": [
            "High raw material and autoclave/curing manufacturing processing expense",
            "Vulnerable to interlaminar delamination under transverse out-of-plane impacts",
            "Complex non-destructive evaluation (NDE) inspection requirements"
        ],
        "typical_applications": [
            "Primary commercial aerospace fuselage and wing skins (Boeing 787 / Airbus A350 CFRP)",
            "Utility-scale wind turbine rotor blades and marine hulls (Glass Fiber Reinforced Vinyl Ester)",
            "Formula 1 monocoque survival cells and motorsport suspension pushrods",
            "High-pressure composite overwrapped pressure vessels (COPVs for hydrogen storage)"
        ],
        "representative_materials": ["Unidirectional Carbon Fiber Epoxy (CFRP)", "Woven E-Glass / Epoxy (GFRP)", "Kevlar Aramid Epoxy", "Carbon-Carbon (C/C) Brake Rotors", "Silicon Carbide CMC Matrix"]
    }
}

def load_model_and_metadata():
    global model_pipeline, metadata_cache
    if model_pipeline is None and os.path.exists(MODEL_PATH):
        try:
            model_pipeline = joblib.load(MODEL_PATH)
            print(f"[Backend] Successfully loaded ML model from {MODEL_PATH}")
        except Exception as e:
            print(f"[Backend] Error loading model: {e}")

    if not metadata_cache and os.path.exists(METADATA_PATH):
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                metadata_cache = json.load(f)
            print(f"[Backend] Loaded metadata cache with {len(metadata_cache.get('presets', []))} presets.")
        except Exception as e:
            print(f"[Backend] Error loading metadata: {e}")

# Initial load at import time
load_model_and_metadata()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure model & metadata are loaded
    load_model_and_metadata()
    yield
    print("[Backend] Shutting down.")

app = FastAPI(
    title="Engineering Materials AI Classification Service",
    description="Physics-informed classification engine for Metals, Polymers, Ceramics, and Composites.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class MaterialInput(BaseModel):
    density: float = Field(
        ...,
        ge=0.5,
        le=25.0,
        description="Mass density in g/cm³ (typically 0.8 to 20.0)"
    )
    tensile_strength: float = Field(
        ...,
        ge=1.0,
        le=3500.0,
        description="Ultimate Tensile Strength in MPa"
    )
    thermal_conductivity: float = Field(
        ...,
        ge=0.01,
        le=500.0,
        description="Thermal Conductivity in W/(m·K)"
    )
    electrical_conductivity: Optional[float] = Field(
        default=None,
        description="Raw electrical conductivity in S/m (e.g. 1e-12 to 6e7). If omitted, electrical_conductivity_log10 must be provided."
    )
    electrical_conductivity_log10: Optional[float] = Field(
        default=None,
        ge=-16.0,
        le=9.0,
        description="Log10 of electrical conductivity in S/m (e.g. -14 to +8)"
    )

    @field_validator("electrical_conductivity_log10", mode="before")
    def resolve_conductivity(cls, v, values):
        return v

    def get_log10_conductivity(self) -> float:
        if self.electrical_conductivity_log10 is not None:
            return float(self.electrical_conductivity_log10)
        if self.electrical_conductivity is not None:
            val = float(self.electrical_conductivity)
            if val <= 0:
                return -16.0
            return float(math.log10(val))
        # Default neutral fallback if neither is supplied
        return 0.0

class PredictionResponse(BaseModel):
    predicted_class: str
    confidence: float
    probabilities: Dict[str, float]
    input_values: Dict[str, float]
    characteristics: Dict[str, Any]
    classification_reasoning: str
    comparison_with_class_averages: Dict[str, Dict[str, float]]

@app.get("/")
def read_root():
    return {
        "service": "AI-Based Classification of Engineering Materials",
        "status": "operational",
        "model_loaded": model_pipeline is not None,
        "classes": ["Metals", "Polymers", "Ceramics", "Composites"]
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "ok" if model_pipeline is not None else "degraded",
        "model_loaded": model_pipeline is not None,
        "version": "1.0.0"
    }

@app.get("/api/metadata")
def get_metadata():
    if not metadata_cache:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Metadata not yet initialized. Please run train_model.py."
        )
    return metadata_cache

def synthesize_reasoning(
    predicted_class: str,
    density: float,
    tensile: float,
    thermal: float,
    elec_log10: float,
    confidence: float
) -> str:
    """
    Synthesize transparent physics-based explanation for why the ML model
    classified the specimen into the given category.
    """
    conf_pct = round(confidence * 100, 1)

    if predicted_class == "Metals":
        return (
            f"The model classifies this specimen as a Metallic Alloy ({conf_pct}% confidence). "
            f"Key driving indicators include an elevated electrical conductivity of 10^{elec_log10:.1f} S/m "
            f"and high thermal transport ({thermal:.1f} W/m·K), which are definitive hallmarks of free electron gas lattices. "
            f"Combined with a substantial density of {density:.2f} g/cm³ and high tensile yield resistance ({tensile:.1f} MPa), "
            f"the specimen aligns strongly with standard metallics."
        )
    elif predicted_class == "Polymers":
        return (
            f"The model classifies this specimen as a Polymer ({conf_pct}% confidence). "
            f"The primary signature is its ultra-low mass density of {density:.2f} g/cm³, coupled with an extremely high electrical "
            f"resistivity (conductivity 10^{elec_log10:.1f} S/m) and minimal thermal conduction ({thermal:.2f} W/m·K). "
            f"These traits reflect covalent carbon-chain backbones devoid of free valence charge carriers."
        )
    elif predicted_class == "Ceramics":
        return (
            f"The model identifies this specimen as an Engineering Ceramic ({conf_pct}% confidence). "
            f"The pairing of moderate-to-high density ({density:.2f} g/cm³) with strong electrical insulation (10^{elec_log10:.1f} S/m) "
            f"and moderate tensile resistance ({tensile:.1f} MPa) matches rigid ionic-covalent crystals that exhibit "
            f"sensitivity to tensile crack propagation."
        )
    elif predicted_class == "Composites":
        return (
            f"The model classifies this specimen as an Advanced Composite ({conf_pct}% confidence). "
            f"This is driven by an exceptional strength-to-weight ratio: a remarkable tensile capability of {tensile:.1f} MPa "
            f"achieved at a low density of only {density:.2f} g/cm³. The modest thermal conductivity ({thermal:.2f} W/m·K) "
            f"further confirms a multi-phase fiber-matrix construction."
        )
    return f"Specimen classified as {predicted_class} with {conf_pct}% model confidence."

@app.post("/api/predict", response_model=PredictionResponse)
def predict_material(payload: MaterialInput):
    global model_pipeline
    if model_pipeline is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded. Please verify train_model.py has executed."
        )

    elec_log10 = payload.get_log10_conductivity()

    # Feature vector matching training columns
    feature_df = pd.DataFrame([{
        "density": payload.density,
        "tensile_strength": payload.tensile_strength,
        "thermal_conductivity": payload.thermal_conductivity,
        "electrical_conductivity_log10": elec_log10
    }])

    try:
        predicted_class = str(model_pipeline.predict(feature_df)[0])
        probabilities_raw = model_pipeline.predict_proba(feature_df)[0]
        classes_order = model_pipeline.classes_

        prob_dict = {
            str(cls_name): round(float(prob), 4)
            for cls_name, prob in zip(classes_order, probabilities_raw)
        }
        confidence = float(prob_dict[predicted_class])

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

    # Fetch rich characteristics
    profile = MATERIAL_PROFILES.get(predicted_class, {
        "title": predicted_class,
        "tagline": "Classified engineering material",
        "atomic_structure": "Standard material lattice",
        "mechanical_profile": "Standard mechanical profile",
        "thermal_electrical_profile": "Standard conductivity",
        "key_advantages": [],
        "design_limitations": [],
        "typical_applications": [],
        "representative_materials": []
    })

    # Compare inputs with class averages if available
    class_stats = metadata_cache.get("class_statistics", {}).get(predicted_class, {})
    comparison = {}
    inputs_map = {
        "density": payload.density,
        "tensile_strength": payload.tensile_strength,
        "thermal_conductivity": payload.thermal_conductivity,
        "electrical_conductivity_log10": elec_log10
    }

    for prop_key, input_val in inputs_map.items():
        if prop_key in class_stats:
            stat = class_stats[prop_key]
            mean_val = stat.get("mean", 0.0)
            std_val = stat.get("std", 1.0)
            z_score = (input_val - mean_val) / (std_val if std_val > 0 else 1.0)
            comparison[prop_key] = {
                "input_value": input_val,
                "class_mean": mean_val,
                "class_std": std_val,
                "z_score": round(float(z_score), 2)
            }
        else:
            comparison[prop_key] = {
                "input_value": input_val,
                "class_mean": 0.0,
                "class_std": 0.0,
                "z_score": 0.0
            }

    reasoning = synthesize_reasoning(
        predicted_class=predicted_class,
        density=payload.density,
        tensile=payload.tensile_strength,
        thermal=payload.thermal_conductivity,
        elec_log10=elec_log10,
        confidence=confidence
    )

    return PredictionResponse(
        predicted_class=predicted_class,
        confidence=confidence,
        probabilities=prob_dict,
        input_values=inputs_map,
        characteristics=profile,
        classification_reasoning=reasoning,
        comparison_with_class_averages=comparison
    )

# Static file mounting for unified full-stack single-service hosting (e.g. Render / Railway)
FRONTEND_DIST = os.path.join(os.path.dirname(BASE_DIR), "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="static_frontend")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
