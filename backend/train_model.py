"""
AI-Based Classification of Engineering Materials
Model Training & Synthetic Dataset Generation Pipeline
Author: Antigravity
"""

import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib

# Set deterministic seed for reproducibility
np.random.seed(42)

CLASSES = ["Metals", "Polymers", "Ceramics", "Composites"]

def generate_synthetic_materials_data(n_per_class: int = 750) -> pd.DataFrame:
    """
    Synthesize realistic materials dataset based on physical & mechanical distributions
    from Ashby Materials Selection Charts and standard engineering handbooks.
    
    Features:
    1. density: Density in g/cm^3
    2. tensile_strength: Ultimate Tensile Strength in MPa
    3. thermal_conductivity: Thermal Conductivity in W/(m*K)
    4. electrical_conductivity_log10: Log10 of electrical conductivity in S/m
    """
    records = []

    # 1. METALS
    # Characteristics: High density, high thermal & electrical conductivity, good tensile strength
    for _ in range(n_per_class):
        # Density: Bimodal around light metals (Al, Ti ~ 2.7-4.5) and heavy metals (Fe, Cu, Ni, W ~ 7.8-19.0)
        is_heavy = np.random.rand() > 0.35
        if is_heavy:
            density = np.random.normal(loc=8.2, scale=1.5)
            density = np.clip(density, 6.0, 19.3)
        else:
            density = np.random.normal(loc=3.5, scale=0.8)
            density = np.clip(density, 2.4, 5.0)

        tensile_strength = np.random.normal(loc=550, scale=280)
        tensile_strength = np.clip(tensile_strength, 90, 1850)

        thermal_conductivity = np.random.normal(loc=120, scale=75)
        thermal_conductivity = np.clip(thermal_conductivity, 14.0, 410.0)

        # High electrical conductivity: 10^6 to 10^7.8 S/m
        elec_log10 = np.random.normal(loc=6.9, scale=0.45)
        elec_log10 = np.clip(elec_log10, 5.8, 7.9)

        records.append({
            "density": round(float(density), 3),
            "tensile_strength": round(float(tensile_strength), 1),
            "thermal_conductivity": round(float(thermal_conductivity), 2),
            "electrical_conductivity_log10": round(float(elec_log10), 2),
            "material_class": "Metals"
        })

    # 2. POLYMERS
    # Characteristics: Low density (< 2.2), low thermal/electrical conductivity, low-medium tensile strength
    for _ in range(n_per_class):
        density = np.random.normal(loc=1.22, scale=0.25)
        density = np.clip(density, 0.88, 2.15)

        tensile_strength = np.random.normal(loc=58, scale=24)
        tensile_strength = np.clip(tensile_strength, 12, 135)

        thermal_conductivity = np.random.normal(loc=0.24, scale=0.08)
        thermal_conductivity = np.clip(thermal_conductivity, 0.10, 0.55)

        # Dielectrics / electrical insulators: 10^-14 to 10^-7 S/m
        elec_log10 = np.random.normal(loc=-11.5, scale=1.8)
        elec_log10 = np.clip(elec_log10, -15.0, -6.5)

        records.append({
            "density": round(float(density), 3),
            "tensile_strength": round(float(tensile_strength), 1),
            "thermal_conductivity": round(float(thermal_conductivity), 2),
            "electrical_conductivity_log10": round(float(elec_log10), 2),
            "material_class": "Polymers"
        })

    # 3. CERAMICS
    # Characteristics: Medium-high density, brittle (lower tensile strength), variable thermal conductivity, electrical insulator
    for _ in range(n_per_class):
        density = np.random.normal(loc=3.65, scale=0.85)
        density = np.clip(density, 2.1, 6.2)

        # Tensile strength is modest due to Griffith flaws & brittle fracture (compressive is much higher)
        tensile_strength = np.random.normal(loc=175, scale=80)
        tensile_strength = np.clip(tensile_strength, 30, 420)

        # Variable thermal conductivity (glasses ~ 1.5, Alumina ~ 30, SiC/AlN ~ 130)
        is_high_cond = np.random.rand() > 0.70
        if is_high_cond:
            thermal_conductivity = np.random.normal(loc=95, scale=30)
            thermal_conductivity = np.clip(thermal_conductivity, 45, 180)
        else:
            thermal_conductivity = np.random.normal(loc=18, scale=12)
            thermal_conductivity = np.clip(thermal_conductivity, 1.2, 45)

        elec_log10 = np.random.normal(loc=-8.0, scale=2.5)
        elec_log10 = np.clip(elec_log10, -13.0, -1.0)

        records.append({
            "density": round(float(density), 3),
            "tensile_strength": round(float(tensile_strength), 1),
            "thermal_conductivity": round(float(thermal_conductivity), 2),
            "electrical_conductivity_log10": round(float(elec_log10), 2),
            "material_class": "Ceramics"
        })

    # 4. COMPOSITES
    # Characteristics: Low-to-moderate density, high strength-to-weight ratio, low thermal conductivity, variable electrical
    for _ in range(n_per_class):
        density = np.random.normal(loc=1.65, scale=0.28)
        density = np.clip(density, 1.25, 2.45)

        tensile_strength = np.random.normal(loc=780, scale=320)
        tensile_strength = np.clip(tensile_strength, 260, 1850)

        thermal_conductivity = np.random.normal(loc=3.2, scale=2.2)
        thermal_conductivity = np.clip(thermal_conductivity, 0.35, 11.5)

        # Carbon fiber composites are slightly conductive, GFRP is insulating
        is_cfrp = np.random.rand() > 0.45
        if is_cfrp:
            elec_log10 = np.random.normal(loc=2.5, scale=1.2)
            elec_log10 = np.clip(elec_log10, 0.0, 4.2)
        else:
            elec_log10 = np.random.normal(loc=-8.5, scale=2.0)
            elec_log10 = np.clip(elec_log10, -13.0, -3.5)

        records.append({
            "density": round(float(density), 3),
            "tensile_strength": round(float(tensile_strength), 1),
            "thermal_conductivity": round(float(thermal_conductivity), 2),
            "electrical_conductivity_log10": round(float(elec_log10), 2),
            "material_class": "Composites"
        })

    df = pd.DataFrame(records)
    # Shuffle dataframe
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    return df

def train_and_export():
    print("Generating synthetic engineering materials dataset...")
    df = generate_synthetic_materials_data(n_per_class=750)
    print(f"Dataset generated: {len(df)} total samples.")
    print(df["material_class"].value_counts())

    feature_cols = [
        "density",
        "tensile_strength",
        "thermal_conductivity",
        "electrical_conductivity_log10"
    ]
    target_col = "material_class"

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Build Pipeline: StandardScaler + RandomForestClassifier
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=1
        ))
    ])

    print("\nTraining classification pipeline...")
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    cv_scores = cross_val_score(pipeline, X, y, cv=5)

    print(f"\n================ Model Performance ================")
    print(f"Test Accuracy: {acc * 100:.2f}%")
    print(f"5-Fold CV Accuracy: {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, digits=4))

    # Feature Importance from Random Forest
    rf_model = pipeline.named_steps["classifier"]
    importances = dict(zip(feature_cols, [round(float(v), 4) for v in rf_model.feature_importances_]))
    print("Feature Importances:", importances)

    # Compute property statistics per class for visualization reference
    stats = {}
    for cls_name in CLASSES:
        sub = df[df[target_col] == cls_name]
        stats[cls_name] = {}
        for col in feature_cols:
            stats[cls_name][col] = {
                "mean": round(float(sub[col].mean()), 2),
                "std": round(float(sub[col].std()), 2),
                "min": round(float(sub[col].min()), 2),
                "max": round(float(sub[col].max()), 2)
            }

    # Preset benchmarks for real-world engineering materials
    presets = [
        {
            "id": "ti-6al-4v",
            "name": "Titanium Ti-6Al-4V (Grade 5)",
            "category": "Metals",
            "density": 4.43,
            "tensile_strength": 950.0,
            "thermal_conductivity": 6.7,
            "electrical_conductivity_log10": 6.18,
            "description": "Widely used in aerospace and medical implants due to high specific strength and biocompatibility."
        },
        {
            "id": "al-6061-t6",
            "name": "Aluminum 6061-T6 Alloy",
            "category": "Metals",
            "density": 2.70,
            "tensile_strength": 310.0,
            "thermal_conductivity": 167.0,
            "electrical_conductivity_log10": 7.40,
            "description": "Precipitation-hardened aluminum alloy used in structural and automotive framing."
        },
        {
            "id": "aisi-316l",
            "name": "Stainless Steel AISI 316L",
            "category": "Metals",
            "density": 8.00,
            "tensile_strength": 580.0,
            "thermal_conductivity": 16.3,
            "electrical_conductivity_log10": 6.13,
            "description": "Austenitic chromium-nickel stainless steel with superior corrosion resistance."
        },
        {
            "id": "peek",
            "name": "Polyether Ether Ketone (PEEK)",
            "category": "Polymers",
            "density": 1.32,
            "tensile_strength": 100.0,
            "thermal_conductivity": 0.25,
            "electrical_conductivity_log10": -14.0,
            "description": "High-performance semi-crystalline engineering thermoplastic with superior thermal stability."
        },
        {
            "id": "polycarbonate",
            "name": "Polycarbonate (PC)",
            "category": "Polymers",
            "density": 1.20,
            "tensile_strength": 65.0,
            "thermal_conductivity": 0.20,
            "electrical_conductivity_log10": -13.0,
            "description": "Amorphous thermoplastic with optical transparency, high impact strength, and ductility."
        },
        {
            "id": "alumina-99",
            "name": "Alumina Ceramic (Al2O3 99.5%)",
            "category": "Ceramics",
            "density": 3.92,
            "tensile_strength": 260.0,
            "thermal_conductivity": 30.0,
            "electrical_conductivity_log10": -11.5,
            "description": "Technical ceramic with high hardness, dielectric insulation, and thermal chemical wear resistance."
        },
        {
            "id": "silicon-carbide",
            "name": "Silicon Carbide (SiC sintered)",
            "category": "Ceramics",
            "density": 3.15,
            "tensile_strength": 350.0,
            "thermal_conductivity": 120.0,
            "electrical_conductivity_log10": -2.0,
            "description": "Extreme hardness ceramic used in armor plates, mechanical seal faces, and power semiconductors."
        },
        {
            "id": "cfrp-unidirectional",
            "name": "Carbon Fiber Epoxy Composite (CFRP)",
            "category": "Composites",
            "density": 1.55,
            "tensile_strength": 1450.0,
            "thermal_conductivity": 5.4,
            "electrical_conductivity_log10": 2.8,
            "description": "High-modulus carbon fibers embedded in thermoset polymer matrix for lightweight structural stiffness."
        },
        {
            "id": "gfrp-e-glass",
            "name": "E-Glass / Epoxy Composite (GFRP)",
            "category": "Composites",
            "density": 1.95,
            "tensile_strength": 750.0,
            "thermal_conductivity": 0.45,
            "electrical_conductivity_log10": -11.0,
            "description": "Fiberglass reinforced polymer composite used widely in wind turbine blades and marine hulls."
        }
    ]

    # Save artifacts
    output_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(output_dir, exist_ok=True)

    model_path = os.path.join(output_dir, "material_classifier.joblib")
    joblib.dump(pipeline, model_path)
    print(f"\nPipeline model saved to: {model_path}")

    metadata = {
        "classes": CLASSES,
        "feature_names": feature_cols,
        "feature_descriptions": {
            "density": "Mass per unit volume (g/cm³). Fundamental physical property determining component weight.",
            "tensile_strength": "Ultimate tensile stress before structural necking/fracture (MPa).",
            "thermal_conductivity": "Rate of thermal energy transport through material gradient (W/m·K).",
            "electrical_conductivity_log10": "Logarithmic electrical conductivity (log10 S/m). Spans insulators to conductors."
        },
        "metrics": {
            "test_accuracy": round(float(acc), 4),
            "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
            "cv_accuracy_std": round(float(cv_scores.std()), 4),
            "feature_importances": importances
        },
        "class_statistics": stats,
        "presets": presets
    }

    metadata_path = os.path.join(output_dir, "dataset_metadata.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata and presets saved to: {metadata_path}")

    # Also save a sample CSV for user inspection
    csv_path = os.path.join(output_dir, "synthetic_materials_sample.csv")
    df.head(200).to_csv(csv_path, index=False)
    print(f"Sample dataset preview saved to: {csv_path}")

if __name__ == "__main__":
    train_and_export()
