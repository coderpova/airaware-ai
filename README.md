# AirAware AI

> **Tagline:** Understand Your Air. Protect Your Tomorrow.  
> **Challenge:** Challenge 6 — Urban Air Quality Assistant  

AirAware AI is an intelligent, explainable urban air quality intelligence platform designed to translate atmospheric chemistry data into actionable decisions for citizens, daily commuters, schoolchildren, outdoor athletes, and vulnerable groups.

---

## 1. Problem Statement & Core Questions Answered

Urban air pollution is an acute public health hazard across metropolitan corridors. However, raw sensor metrics ($\mu g/m^3$) and arbitrary index numbers often leave citizens confused about practical actions. 

AirAware AI answers five vital questions:

1. **How polluted is the air around me?**  
   Evaluates live atmospheric conditions using India's official Central Pollution Control Board (CPCB) National Air Quality Index (NAQI) categories: Good (0–50), Satisfactory (51–100), Moderately Polluted (101–200), Poor (201–300), Very Poor (301–400), and Severe (401–500).
2. **Which pollutants are causing the pollution?**  
   Computes individual sub-indices for PM2.5, PM10, NO2, SO2, CO, and O3 to isolate the dominant contributor.
3. **How will air quality change over the next few hours?**  
   Generates a 48-hour hourly trend and 5-day predictive trajectory based on numerical dispersion simulations.
4. **What precautions should I take?**  
   Provides context-aware guidance detailing certified N95 mask usage, indoor HEPA filtration, and ventilation timing.
5. **When and where should I plan outdoor activities?**  
   Calculates optimal 3-hour outdoor windows for running, walking, cycling, or school commutes while flagging forecasted peak pollution spikes.

---

## 2. Technology Stack

- **Frontend Framework:** Next.js 16 (App Router) with React 19
- **Language:** TypeScript in strict mode
- **Styling:** Tailwind CSS 4 with custom color tokens matching official CPCB hazard tiers
- **Data Visualizations:** Recharts for hourly AQI trajectories and particulate comparisons
- **Interactive Mapping:** Leaflet and React-Leaflet with OpenStreetMap tiles
- **Icons:** Lucide React
- **Validation:** Zod schemas for query boundaries, coordinates, and sanitization
- **State & Preferences:** Resilient localStorage persistence (zero login required, privacy-first)
- **Testing Suite:** Vitest, React Testing Library, and jsdom

---

## 3. Core Features

### A. Live Air Quality Dashboard (`/`)
- Dynamic gauge rendering CPCB AQI (0–500 scale) with color-coded and non-color icon badges.
- Live concentrations and sub-indices for PM2.5, PM10, NO2, SO2, CO, and O3.
- Transparent label distinguishing model-based estimates from CAAQMS physical monitoring towers.
- Comparative display showing US EPA AQI and European CAQI for international context without conflating them with CPCB NAQI.
- Drawer modal explaining CPCB piecewise linear interpolation and averaging periods.

### B. Interactive City Search & Geocoding
- Search by city, district, or locality name using Open-Meteo Geocoding.
- One-click GPS geolocation detection using the browser Geolocation API with user permission.
- Instant access chips for major Indian metropolitan hubs: Delhi, Noida, Greater Noida, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, and Lucknow.

### C. Air Quality Forecast & Trend Engine (`/forecast`)
- 48-hour interactive hourly AQI trajectory with CPCB threshold reference markers.
- Particulate matter comparison graph (PM2.5 vs PM10) benchmarked against India NAAQS 24-hour limits (60 $\mu g/m^3$ for PM2.5, 100 $\mu g/m^3$ for PM10).
- 5-day daily outlook with minimum, maximum, and average anticipated AQI values.
- Automated detection of expected peak pollution hours.

### D. Pollution Intelligence
- Dedicated breakdown for each key pollutant: PM2.5, PM10, NO2, SO2, CO, and O3.
- Details emission sources, biological mechanisms, why citizens should care, and protective actions.
- Automatically flags dominant pollutant when sufficient data coverage is available.

### E. AI Health & Activity Assistant (`/assistant`)
- Contextual health advisory engine adapting to 6 routine activities:
  - Walking & Errands
  - Running / Jogging
  - Cycling
  - Outdoor Sports & Games
  - School Commute (Children)
  - Daily Work Transit (Commuters)
- Tailored for 4 vulnerability tiers:
  - General Population
  - Children & Adolescents
  - Older Adults (60+)
  - People with Respiratory / Cardiac Sensitivity
- Clear recommendations on certified N95 respirators, indoor ventilation strategies, and conservative public health advisories.
- Mandatory medical disclaimer included on every report.

### F. Smart Pollution Alert Center
- Real-time in-app alerts for Poor (> 200), Very Poor (> 300), and Severe (> 400) conditions.
- Sudden spike warnings when forecast models project a surge of $\ge +40$ AQI points within 6 hours.
- Configurable user thresholds and optional browser desktop push notifications.

### G. Interactive Pollution Map (`/map`)
- OpenStreetMap exploration with custom color-coded pins representing current regional AQI.
- Clickable pins revealing detailed particulate breakdown, dominant driver, and health status.
- Map legend and explicit model attribution disclosure.

### H. Multi-City Comparison (`/compare`)
- Side-by-side comparison of 2 or 3 cities.
- Comparative bar charts illustrating AQI, PM2.5, and PM10 concentrations.
- Highlight badge identifying the cleanest location among selected cities.

### I. Understand Your Air (`/education`)
- Educational portal explaining how AQI is calculated, why PM2.5 differs from PM10, how winter inversions trap pollutants, and a practical citizen exposure checklist.

### J. User Preferences (`/settings`)
- Set default home location, routine activity, sensitivity category, and custom notification thresholds.
- Data stored strictly in browser local storage with zero server-side tracking.

---

## 4. Scientific CPCB Calculation Methodology

AirAware AI implements the official Central Pollution Control Board (CPCB) National Air Quality Index formulation:

### Linear Interpolation Formula
$$I_p = \frac{I_{HI} - I_{LO}}{B_{HI} - B_{LO}} \cdot (C_p - B_{LO}) + I_{LO}$$

Where:
- $C_p$ is pollutant concentration.
- $B_{HI}$ and $B_{LO}$ are the breakpoint concentrations enclosing $C_p$.
- $I_{HI}$ and $I_{LO}$ are the corresponding AQI sub-index limits.

### CPCB Breakpoints Matrix

| Category | AQI Range | PM2.5 (24h, $\mu g/m^3$) | PM10 (24h, $\mu g/m^3$) | NO2 (24h, $\mu g/m^3$) | SO2 (24h, $\mu g/m^3$) | CO (8h, $mg/m^3$) | O3 (8h, $\mu g/m^3$) |
|---|---|---|---|---|---|---|---|
| Good | 0–50 | 0–30 | 0–50 | 0–40 | 0–40 | 0–1.0 | 0–50 |
| Satisfactory | 51–100 | 31–60 | 51–100 | 41–80 | 41–80 | 1.1–2.0 | 51–100 |
| Moderately Polluted | 101–200 | 61–90 | 101–250 | 81–180 | 81–380 | 2.1–10.0 | 101–168 |
| Poor | 201–300 | 91–120 | 251–350 | 181–280 | 381–800 | 10.1–17.0 | 169–208 |
| Very Poor | 301–400 | 121–250 | 351–430 | 281–400 | 801–1600 | 17.1–34.0 | 209–748 |
| Severe | 401–500 | 251–380 | 431–500 | 401–500 | 1601–2000 | 34.1–50.0 | 749–1000 |

### Aggregation Rules
- Overall AQI is the maximum of individual sub-indices: $AQI = \max(I_1, I_2, \dots, I_n)$.
- Dominant pollutant is the pollutant with the highest sub-index.
- CPCB Station Requirement: At least 3 monitored parameters, with at least one being PM2.5 or PM10. If not met, the index is marked as an estimate.

---

## 5. Getting Started

### Prerequisites
- Node.js version 18.18 or higher (Node.js 20+ recommended)
- npm version 9 or higher

### Installation
```bash
git clone https://github.com/your-username/airaware-ai.git
cd airaware-ai
npm install
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Building for Production
```bash
npm run build
npm start
```

### Running Test Suite
```bash
# Run unit and integration tests
npm test

# Run linter
npm run lint
```

---

## 6. Security & Accessibility Auditing

### Security Guardrails
- **Input Sanitization:** Search queries are sanitized against XSS patterns and clamped to safe character limits.
- **Coordinate Boundary Checks:** Latitude (-90 to 90) and Longitude (-180 to 180) are strictly validated via Zod schemas.
- **Trusted External Origins:** Server-side proxy calls only official Open-Meteo endpoints.
- **Zero Exposed Secrets:** The application runs on open public data without hardcoded tokens or leaked keys.
- **Privacy First:** User location is obtained only after explicit browser prompt and is never stored on a remote server.

### WCAG 2.2 AA Accessibility
- High text-to-background contrast meeting AA criteria.
- Non-color visual cues: Every category pairs color with textual category names and distinct Lucide icons (ShieldCheck, AlertTriangle, AlertOctagon, etc.).
- Accessible table views for screen readers paired with interactive charts.
- Visible keyboard focus indicators and semantic navigation elements.

---

## 7. Suggested 2–3 Minute Demo Video Script

- **[0:00 - 0:30] Introduction & Problem:** Introduce AirAware AI, the 5 core questions citizens ask, and demonstrate live CPCB AQI computation for Delhi with dominant pollutant identification.
- **[0:30 - 1:00] Data Accuracy & Methodology:** Open the CPCB Methodology modal to showcase the linear interpolation formula and explain the honest distinction between ground CAAQMS stations and Copernicus atmospheric dispersion models.
- **[1:00 - 1:40] AI Health Assistant:** Demonstrate switching between a general runner and an asthmatic child commuter, showing how N95 mask recommendations, indoor ventilation, and exercise timing update dynamically.
- **[1:40 - 2:10] Forecast & Activity Windows:** Review the 48-hour hourly trend, particulate dynamics (PM2.5 vs PM10), and the optimal 3-hour outdoor windows.
- **[2:10 - 2:40] Map & Multi-City Compare:** Explore the interactive Leaflet map across Indian cities and compare Delhi vs Bengaluru vs Mumbai.
- **[2:40 - 3:00] Conclusion:** Highlight zero login requirements, local preference storage, and test coverage.

---

## 8. Data Attribution & Transparency

- Atmospheric chemistry simulation data provided by **Open-Meteo Air Quality API** under open data terms, utilizing the **Copernicus Atmosphere Monitoring Service (CAMS)** and global atmospheric models.
- Geocoding services powered by **Open-Meteo Geocoding API**.
- Calculation standards and breakpoints reference the **Central Pollution Control Board (CPCB)**, Ministry of Environment, Forest and Climate Change, Government of India.
