# AI-Based Classification of Engineering Materials

A full-stack machine learning web application that predicts and classifies engineering materials into **Metals**, **Polymers**, **Ceramics**, or **Composites** based on their physical and mechanical properties.

Built with a **FastAPI + scikit-learn** backend and a **React + Vite** frontend styled with **strict dark minimalist glassmorphism and neumorphism** (zero purple gradients, zero gimmicky animations, precision industrial instrument aesthetic).

---

## 📁 Directory Structure

```text
Neel Project/
├── backend/
│   ├── main.py                     # FastAPI backend application & inference routes
│   ├── train_model.py              # Synthetic dataset generator & Random Forest pipeline training
│   ├── requirements.txt            # Python dependencies
│   └── models/
│       ├── material_classifier.joblib  # Trained scikit-learn pipeline (Scaler + Random Forest)
│       ├── dataset_metadata.json       # Population statistics, feature bounds & material presets
│       └── synthetic_materials_sample.csv # Sample dataset export for inspection
├── frontend/
│   ├── index.html                  # HTML entry point with Google Fonts (Inter, JetBrains Mono)
│   ├── package.json                # React & frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   └── src/
│       ├── App.jsx                 # Core application layout, state & API integration
│       ├── index.css               # Design system: Strict dark glassmorphic/neumorphic tokens
│       ├── main.jsx                # React root mount
│       ├── components/
│       │   ├── Header.jsx          # Header with live model accuracy badge & server ping
│       │   ├── PresetBar.jsx       # Quick benchmark chips for real engineering materials
│       │   ├── PropertySlider.jsx  # Dual range-slider + synced numeric input with bounds
│       │   └── ResultCard.jsx      # Glassmorphic prediction card, probability charts & reasoning
│       └── data/
│           └── fallbackPresets.js  # Offline reference benchmarks (Ti-6Al-4V, CFRP, PEEK, etc.)
└── README.md                       # Comprehensive system documentation
```

---

## ⚙️ Physical & Mechanical Features

The classifier uses 4 core physical and mechanical descriptors grounded in materials science (Ashby Selection Charts):

| Feature | Symbol | Units | Typical Range | Materials Science Significance |
| :--- | :---: | :---: | :---: | :--- |
| **Mass Density** | $\rho$ | $\text{g/cm}^3$ | 0.8 – 20.0 | Specific weight; distinguishes lightweight polymers ($\sim 1$) and composites ($\sim 1.5$) from heavy metals ($\sim 7 - 19$). |
| **Ultimate Tensile Strength** | $\sigma_{ts}$ | $\text{MPa}$ | 10 – 2000 | Peak engineering tensile stress before rupture. Distinguishes high-strength alloys and CFRP from brittle ceramics. |
| **Thermal Conductivity** | $k$ | $\text{W/(m}\cdot\text{K)}$ | 0.1 – 450 | Rate of heat transport. High in metals ($15 - 400$), intermediate in technical ceramics ($1.5 - 140$), minimal in polymers ($0.2$). |
| **Electrical Conductivity** | $\sigma_e$ | $\log_{10}\text{ S/m}$ | $-14$ to $+8$ | Order-of-magnitude charge transport. Dielectric polymers ($-14$ to $-7$), semiconductors/CFRP ($-2$ to $+3$), metals ($+6$ to $+7.8$). |

---

## 🔬 Classification Categories

1. **Metals & Alloys** (e.g., Titanium Ti-6Al-4V, Aluminum 6061-T6, AISI 316L Stainless Steel):
   - Crystalline lattice held by delocalized metallic bonding.
   - High electrical and thermal conductivity, high density, ductile yield before fracture.
2. **Polymers & Thermoplastics** (e.g., PEEK, Polycarbonate, PTFE, Nylon 6,6):
   - Covalent macromolecular chains with weak intermolecular van der Waals forces.
   - Ultra-low mass density, extremely high electrical insulation, low thermal conductivity.
3. **Engineering Ceramics** (e.g., Alumina $\text{Al}_2\text{O}_3$, Sintered Silicon Carbide $\text{SiC}$):
   - Strong ionic and covalent bonding without free dislocation motion.
   - Extreme surface hardness and compressive strength, sensitive to tensile flaws, refractory threshold $>1400^\circ\text{C}$.
4. **Advanced Composites** (e.g., Carbon Fiber Epoxy CFRP, E-Glass Epoxy GFRP):
   - Multiphase system combining high-modulus reinforcing fibers within a supporting matrix.
   - High strength-to-weight ratio, anisotropic load tailoring, exceptional fatigue resistance.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+ (tested with Python 3.11 – 3.14)
- Node.js 18+ & npm

### 2. Backend Setup
From the repository root:
```bash
# Optional: create virtual environment
python -m venv venv
venv\Scripts\activate       # On Windows
# source venv/bin/activate  # On macOS/Linux

# Install backend dependencies
pip install -r backend/requirements.txt

# Train or re-train the ML classification pipeline
python backend/train_model.py

# Start the FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend will start at `http://127.0.0.1:8000`. You can inspect interactive OpenAPI documentation at `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://127.0.0.1:5173`.

---

## 📡 API Reference

### Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "status": "ok",
  "model_loaded": true,
  "version": "1.0.0"
}
```

### Material Metadata & Presets
- **Endpoint**: `GET /api/metadata`
- **Description**: Returns dataset statistics, feature bounds, accuracy metrics, and standard engineering presets.

### Predict Material Class
- **Endpoint**: `POST /api/predict`
- **Request Body**:
```json
{
  "density": 4.43,
  "tensile_strength": 950.0,
  "thermal_conductivity": 6.7,
  "electrical_conductivity_log10": 6.18
}
```
- **Response**:
```json
{
  "predicted_class": "Metals",
  "confidence": 0.998,
  "probabilities": {
    "Metals": 0.998,
    "Polymers": 0.000,
    "Ceramics": 0.001,
    "Composites": 0.001
  },
  "characteristics": {
    "title": "Metals & Alloys",
    "atomic_structure": "Close-packed crystalline lattices surrounded by a delocalized electron gas...",
    "mechanical_profile": "High tensile strength, moderate to high ductility, high fracture toughness...",
    "typical_applications": [
      "Aerospace structural spars, bulkheads, and turbine disks (Titanium, Nickel superalloys)",
      "Automotive chassis frames, suspension uprights, and powertrain blocks"
    ]
  },
  "classification_reasoning": "The model classifies this specimen as a Metallic Alloy (99.8% confidence). Key driving indicators include an elevated electrical conductivity...",
  "comparison_with_class_averages": { ... }
}
```

---

## 🎨 UI/UX Design System Notes
- **Strict Dark Palette**: Built on carbon/obsidian backgrounds (`#08090c`, `#0f1218`) with crisp titanium silver and subtle ice-azure accents.
- **Glassmorphism**: Backdrop blur (`backdrop-filter: blur(16px)`), frosted translucent overlays, and 1px borders (`rgba(255, 255, 255, 0.08)`).
- **Neumorphism**: Inset shadow wells for sliders and inputs (`box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.7)`), raised surface elevations for result cards.
- **Strict Design Adherence**: Zero purple gradients, zero cursor animations, and zero gimmicks for a sleek, mission-critical engineering console aesthetic.
