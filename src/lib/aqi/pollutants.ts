import { PollutantType } from '@/types/aqi';

export interface PollutantStaticMetadata {
  id: PollutantType;
  name: string;
  chemicalFormula: string;
  unit: string;
  averagingHours: number;
  cpcbStandard: number; // Indian 24h standard or 8h standard
  meaning: string;
  sources: string[];
  healthEffects: string[];
  whyCitizensCare: string;
  citizenAction: string;
}

export const POLLUTANTS_METADATA: Record<PollutantType, PollutantStaticMetadata> = {
  pm2_5: {
    id: 'pm2_5',
    name: 'Fine Particulate Matter (PM2.5)',
    chemicalFormula: 'PM2.5',
    unit: 'µg/m³',
    averagingHours: 24,
    cpcbStandard: 60, // 24-hr standard: 60 µg/m³ (NAAQS India)
    meaning:
      'Microscopic airborne particles less than 2.5 microns in diameter — approximately 30 times thinner than a human hair.',
    sources: [
      'Vehicular combustion & diesel exhausts',
      'Coal-fired thermal power plants & industrial emissions',
      'Biomass burning, stubble burning & firewood',
      'Secondary photochemical reactions from sulfur and nitrogen gases',
    ],
    healthEffects: [
      'Penetrates deep into alveolar gas-exchange regions of the lungs',
      'Enters bloodstream, causing systemic arterial inflammation',
      'Exacerbates asthma, COPD, bronchitis, and cardiac arrhythmias',
      'Linked to reduced lung function in growing children and elevated stroke risk',
    ],
    whyCitizensCare:
      'Because PM2.5 particles bypass the nasal passages and enter blood vessels, it is the single most lethal urban air pollutant in India and worldwide.',
    citizenAction:
      'Wear a well-fitted certified N95 or FFP2 respirator outdoors; seal window gaps during peak inversions; run HEPA air filtration indoors.',
  },
  pm10: {
    id: 'pm10',
    name: 'Coarse Particulate Matter (PM10)',
    chemicalFormula: 'PM10',
    unit: 'µg/m³',
    averagingHours: 24,
    cpcbStandard: 100, // 24-hr standard: 100 µg/m³ (NAAQS India)
    meaning:
      'Inhalable dust and suspended particles measuring between 2.5 and 10 microns in aerodynamic diameter.',
    sources: [
      'Road dust resuspension and unpaved pathways',
      'Construction, demolition, and stone-crushing sites',
      'Soil dust, agricultural field tilling, and sand dust',
      'Mechanical friction from vehicular tire and brake wear',
    ],
    healthEffects: [
      'Deposits in upper respiratory tract and trachea',
      'Causes throat irritation, persistent coughing, and sneezing fits',
      'Triggers allergic rhinitis and worsens seasonal asthma',
      'Reduces physical exercise tolerance and increases airway resistance',
    ],
    whyCitizensCare:
      'High PM10 creates pervasive urban smog and directly attacks upper respiratory pathways, causing discomfort and persistent coughs.',
    citizenAction:
      'Reduce strenuous outdoor exercise near high-traffic or construction zones; use anti-dust face coverings and wet-sweep home surfaces.',
  },
  nitrogen_dioxide: {
    id: 'nitrogen_dioxide',
    name: 'Nitrogen Dioxide',
    chemicalFormula: 'NO₂',
    unit: 'µg/m³',
    averagingHours: 24,
    cpcbStandard: 80, // 24-hr standard: 80 µg/m³ (NAAQS India)
    meaning:
      'A pungent, reddish-brown toxic gas formed during high-temperature fuel combustion in the presence of atmospheric nitrogen.',
    sources: [
      'Automotive internal combustion engines, especially diesel fleets',
      'Thermal power generation and metallurgical industries',
      'Industrial boilers, furnaces, and petroleum refineries',
      'Unvented domestic gas stoves and kerosene heaters',
    ],
    healthEffects: [
      'Inflames airway epithelial lining and causes bronchial hyperreactivity',
      'Increases susceptibility to respiratory bacterial and viral infections',
      'Heightens childhood asthma severity and hospital emergency admissions',
      'Reacts photochemically with VOCs in sunlight to produce secondary ground ozone',
    ],
    whyCitizensCare:
      'Elevated NO2 indicates heavy vehicular congestion and directly impairs lung resistance, making every breath more irritating on daily commutes.',
    citizenAction:
      'Avoid standing near idling vehicles or congested transit bottlenecks; keep car windows rolled up with AC set to cabin air recirculation.',
  },
  sulphur_dioxide: {
    id: 'sulphur_dioxide',
    name: 'Sulphur Dioxide',
    chemicalFormula: 'SO₂',
    unit: 'µg/m³',
    averagingHours: 24,
    cpcbStandard: 80, // 24-hr standard: 80 µg/m³ (NAAQS India)
    meaning:
      'A colorless, reactive gas with a sharp, suffocating odor originating from the combustion of sulfur-bearing fossil fuels.',
    sources: [
      'Coal and heavy fuel oil combustion in thermal power stations',
      'Oil refineries, metal smelting, and chemical manufacturing plants',
      'Diesel combustion with high sulfur content (heavy commercial vehicles)',
      'Brick kilns and paper manufacturing facilities',
    ],
    healthEffects: [
      'Triggers bronchoconstriction and chest tightness within minutes in asthmatics',
      'Severely irritates mucous membranes of eyes, nose, and throat',
      'Contributes to atmospheric sulfate aerosol formation (secondary PM2.5)',
      'Combines with moisture in the air to cause acid rain and vegetation damage',
    ],
    whyCitizensCare:
      'Even brief spikes in SO2 can cause acute respiratory spasms and acute asthma episodes for outdoor workers and runners.',
    citizenAction:
      'Avoid outdoor activities downwind of thermal power plants or industrial clusters; seek immediate shelter if experiencing sudden throat stinging.',
  },
  carbon_monoxide: {
    id: 'carbon_monoxide',
    name: 'Carbon Monoxide',
    chemicalFormula: 'CO',
    unit: 'mg/m³',
    averagingHours: 8,
    cpcbStandard: 2.0, // 8-hr standard: 2.0 mg/m³ (NAAQS India)
    meaning:
      'An odorless, colorless, and highly poisonous gas produced by the incomplete combustion of carbonaceous fuels.',
    sources: [
      'Incomplete combustion in poorly tuned motor vehicles and congested corridors',
      'Biomass fires, wood-burning chulhas, and coal braziers',
      'Defective gas water heaters and poorly ventilated kerosene heaters',
      'Tobacco smoke and solid waste incineration',
    ],
    healthEffects: [
      'Binds to hemoglobin with 200× the affinity of oxygen, forming carboxyhemoglobin (COHb)',
      'Critically impairs cellular oxygen delivery to vital organs like the brain and heart',
      'Causes dizziness, headaches, impaired coordination, and mental confusion',
      'Poses severe risks to pregnant women, developing fetuses, and coronary patients',
    ],
    whyCitizensCare:
      'Because it has no smell or visible color, carbon monoxide silently robs your blood and brain of vital oxygen.',
    citizenAction:
      'Ensure adequate cross-ventilation when using gas heaters; never burn charcoal indoors; avoid idling car engines inside enclosed garages.',
  },
  ozone: {
    id: 'ozone',
    name: 'Ground-Level Ozone',
    chemicalFormula: 'O₃',
    unit: 'µg/m³',
    averagingHours: 8,
    cpcbStandard: 100, // 8-hr standard: 100 µg/m³ (NAAQS India)
    meaning:
      'A powerful secondary oxidant gas created at ground level when NOx and volatile organic compounds (VOCs) react under intense sunlight.',
    sources: [
      'Secondary photochemical reactions between traffic exhaust NOx and industrial VOCs',
      'Evaporation from solvent manufacturing, paints, and fuel storage facilities',
      'Biogenic hydrocarbon emissions catalyzed by intense solar radiation',
    ],
    healthEffects: [
      'Chemically burns airway tissues, causing acute cellular oxidative stress',
      'Causes painful coughing, throat burning, and severe reduction in lung capacity',
      'Aggravates chronic pulmonary conditions and triggers frequent asthma attacks',
      'Reduces agricultural crop yields and damages natural forest foliage',
    ],
    whyCitizensCare:
      'Unlike primary emissions that peak at night or winter mornings, ozone spikes on hot, sunny afternoons, directly threatening daytime outdoor sports.',
    citizenAction:
      'Schedule strenuous outdoor workouts and school sports during early mornings before 10 AM or after sunset when sunlight-driven ozone generation halts.',
  },
};
