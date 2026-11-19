import { AqiCategory, HourlyAqiPoint, OutdoorWindow, PollutantType } from '@/types/aqi';
import { UserActivity, UserSensitivity } from '@/types/user';

export interface ActivityGuidance {
  activity: UserActivity;
  activityLabel: string;
  suitability: 'Safe' | 'Acceptable' | 'Caution' | 'Avoid';
  recommendedIntensity: 'Normal' | 'Moderate' | 'Light / Indoor Only' | 'Cancel / Reschedule';
  specificAdvice: string[];
  bestTimeSuggestion: string;
}

export interface HealthAdvisoryReport {
  summaryTitle: string;
  pollutionSummary: string;
  mainConcern: string;
  advisoryText: string;
  sensitivityImpact: string;
  maskRecommendation: {
    needed: boolean;
    type: string;
    rationale: string;
  };
  indoorVentilation: {
    action: 'Open Windows Freely' | 'Ventilate Briefly during Clean Hours' | 'Keep Windows Closed' | 'Seal Openings & Run HEPA';
    description: string;
  };
  activityGuidance: ActivityGuidance;
  forecastWarning: string | null;
  bestOutdoorWindows: OutdoorWindow[];
  medicalDisclaimer: string;
}

export const MEDICAL_DISCLAIMER =
  'Medical & Health Disclaimer: AirAware AI provides public-health risk advisories based on environmental air quality observations and established epidemiological benchmarks (CPCB, WHO, ICMR). These insights do not constitute medical diagnosis, personalized clinical advice, or treatment plans. Individuals with chronic asthma, COPD, cardiovascular conditions, or acute symptoms should consult qualified healthcare practitioners.';

const ACTIVITY_LABELS: Record<UserActivity, string> = {
  walking: 'Walking & Strolling',
  running: 'Running & Jogging',
  cycling: 'Cycling',
  outdoor_sports: 'Outdoor Sports & Games',
  school_commute: 'School Commuting & Playgrounds',
  daily_commuting: 'Daily Work Transit & Commuting',
};

/**
 * Computes deterministic, scientifically-grounded health and activity recommendations.
 */
export function generateHealthAdvisory(params: {
  aqi: number;
  category: AqiCategory;
  dominantPollutant: PollutantType | null;
  activity: UserActivity;
  sensitivity: UserSensitivity;
  hourlyForecast?: HourlyAqiPoint[];
  locationName?: string;
}): HealthAdvisoryReport {
  const { aqi, category, dominantPollutant, activity, sensitivity, hourlyForecast = [], locationName = 'your area' } =
    params;

  // 1. Dominant pollutant context
  let mainConcern = '';
  switch (dominantPollutant) {
    case 'pm2_5':
      mainConcern =
        'Fine particulates (PM2.5) are the dominant pollutant. Because these particles are small enough to enter blood vessels and reach lung alveoli, prolonged inhalation carries cardiovascular and pulmonary stress.';
      break;
    case 'pm10':
      mainConcern =
        'Coarse suspended dust (PM10) is the leading contributor. High PM10 causes upper respiratory discomfort, nasal congestion, eye irritation, and persistent throat tickle.';
      break;
    case 'nitrogen_dioxide':
      mainConcern =
        'Nitrogen Dioxide (NO₂) is the primary driver, indicating dense vehicular combustion or thermal emissions. It causes bronchial hyperreactivity and inflamed airways.';
      break;
    case 'sulphur_dioxide':
      mainConcern =
        'Sulphur Dioxide (SO₂) is elevated. This reactive acidic gas can trigger sudden bronchoconstriction and chest tightness in individuals with airway sensitivity.';
      break;
    case 'carbon_monoxide':
      mainConcern =
        'Carbon Monoxide (CO) levels are prominent, reducing blood oxygen-carrying capability. Ensure proper air exchange and avoid idling engine exposure.';
      break;
    case 'ozone':
      mainConcern =
        'Ground-level Ozone (O₃) is elevated due to photochemical smog. Ozone induces airway oxidative stress and chest discomfort, typically peaking during sunny afternoons.';
      break;
    default:
      mainConcern =
        'General atmospheric pollution is present. Overall particulate and gaseous levels determine exposure risks.';
  }

  // 2. Summary & Health Advisory by Category
  let summaryTitle = '';
  let pollutionSummary = '';
  let advisoryText = '';

  switch (category) {
    case 'Good':
      summaryTitle = `Ideal Air Quality in ${locationName}`;
      pollutionSummary = `Air quality is clean (AQI ${aqi}). Atmospheric dispersion is favorable and pollutant levels pose minimal risk.`;
      advisoryText =
        'Air conditions are safe for outdoor recreation, sports, and all daily activities. No protective gear required.';
      break;

    case 'Satisfactory':
      summaryTitle = `Acceptable Air Conditions in ${locationName}`;
      pollutionSummary = `Air quality is satisfactory (AQI ${aqi}). Most citizens can enjoy normal activities without hindrance.`;
      advisoryText =
        'The general public can engage in regular outdoor exertion. Exceptionally sensitive individuals may experience slight respiratory irritation.';
      break;

    case 'Moderately Polluted':
      summaryTitle = `Moderate Pollution Observed in ${locationName}`;
      pollutionSummary = `Pollution is elevated (AQI ${aqi}). Sensitive groups should observe proactive caution during peak hours.`;
      advisoryText =
        'Children, older adults, and individuals with respiratory issues should moderate continuous intense outdoor exertion. Take occasional breaks indoors.';
      break;

    case 'Poor':
      summaryTitle = `Unhealthy Air Conditions in ${locationName}`;
      pollutionSummary = `Air quality is poor (AQI ${aqi}), with elevated ambient concentrations of ${dominantPollutant ? dominantPollutant.replace('_', ' ') : 'particulates'}.`;
      advisoryText =
        'Prolonged outdoor exertion may cause breathing discomfort, fatigue, and throat dryness. Healthy individuals should reduce high-intensity training, while vulnerable groups should remain indoors.';
      break;

    case 'Very Poor':
      summaryTitle = `Hazardous Smog Warning in ${locationName}`;
      pollutionSummary = `Severe pollution levels (AQI ${aqi}) pose clear risks of acute respiratory distress and systemic inflammation.`;
      advisoryText =
        'All citizens should significantly curtail prolonged outdoor presence. Vulnerable groups must avoid all strenuous physical activities outside. Certified N95 respirators are advised for necessary commutes.';
      break;

    case 'Severe':
      summaryTitle = `Critical Pollution Emergency in ${locationName}`;
      pollutionSummary = `Emergency air pollution levels (AQI ${aqi}) detected. The atmosphere is heavily laden with toxic particulate matter.`;
      advisoryText =
        'Serious health hazards exist even during light physical exertion. Keep windows sealed, activate air filtration, and completely avoid non-emergency outdoor exposure.';
      break;
  }

  // 3. Sensitivity Profile Impact
  let sensitivityImpact = '';
  switch (sensitivity) {
    case 'children':
      sensitivityImpact =
        'Children have higher respiratory rates relative to body mass and developing lung architecture. In current air conditions, prioritize indoor recreation and avoid early morning or late night outdoor playtime.';
      break;
    case 'older_adults':
      sensitivityImpact =
        'Older adults face increased risks of blood pressure fluctuations and cardiac stress during particulate surges. Keep morning walks brief or shift them indoors with gentle stretching.';
      break;
    case 'respiratory_cardiac':
      sensitivityImpact =
        'High vulnerability: Airway inflammation can precipitate acute asthma attacks or cardiac ischemia. Keep prescribed inhalers/medication readily accessible and avoid dusty or congested transit corridors.';
      break;
    case 'general':
      sensitivityImpact =
        'Healthy adults can tolerate brief outdoor presence, but sustained aerobic exertion should be moderated to reduce cumulative lung burden.';
      break;
  }

  // 4. Mask Recommendation
  let maskRecommendation = {
    needed: false,
    type: 'None',
    rationale: 'Ambient air is clean; natural breathing is uninhibited.',
  };

  if (category === 'Severe' || category === 'Very Poor') {
    maskRecommendation = {
      needed: true,
      type: 'N95 / FFP2 / KN95 Certified Respirator',
      rationale:
        'Standard cloth or surgical masks do not filter sub-micron particles. A properly sealed N95 respirator is essential to prevent particulate penetration.',
    };
  } else if (category === 'Poor') {
    if (sensitivity !== 'general') {
      maskRecommendation = {
        needed: true,
        type: 'N95 or FFP2 Mask',
        rationale:
          'Recommended for vulnerable individuals, outdoor workers, and commuters on congested thoroughfares.',
      };
    } else {
      maskRecommendation = {
        needed: false,
        type: 'Optional N95 for long commutes',
        rationale: 'Not strictly required for brief transit, but recommended if spending >1 hour near heavy traffic.',
      };
    }
  } else if (category === 'Moderately Polluted' && sensitivity === 'respiratory_cardiac') {
    maskRecommendation = {
      needed: true,
      type: 'N95 / FFP2 Mask',
      rationale: 'Preventative measure to avoid triggering acute bronchial spasms in diagnosed asthmatics.',
    };
  }

  // 5. Indoor Ventilation Advice
  let indoorVentilation: HealthAdvisoryReport['indoorVentilation'] = {
    action: 'Open Windows Freely',
    description: 'Natural fresh air circulation is beneficial. Ventilate living and work spaces throughout the day.',
  };

  if (category === 'Severe') {
    indoorVentilation = {
      action: 'Seal Openings & Run HEPA',
      description:
        'Keep all doors and windows tightly closed. Run HEPA air purifiers continuously on auto or high mode. Avoid burning candles, incense, or frying foods.',
    };
  } else if (category === 'Very Poor') {
    indoorVentilation = {
      action: 'Keep Windows Closed',
      description:
        'Avoid outdoor air infiltration during temperature inversions. Utilize indoor HEPA filtration and wet-mop floors to suppress settled dust.',
    };
  } else if (category === 'Poor' || category === 'Moderately Polluted') {
    indoorVentilation = {
      action: 'Ventilate Briefly during Clean Hours',
      description:
        'Open windows only for 15-20 minutes during midday when solar heating promotes convective mixing, then reseal.',
    };
  }

  // 6. Activity-Specific Guidance
  const activityGuidance = evaluateActivityGuidance(activity, category, sensitivity);

  // 7. Forecast Trends & Warnings
  let forecastWarning: string | null = null;
  const bestOutdoorWindows: OutdoorWindow[] = [];

  if (hourlyForecast.length > 0) {
    const upcoming = hourlyForecast.slice(0, 12);
    const firstAqi = upcoming[0]?.aqi ?? aqi;
    const maxUpcoming = Math.max(...upcoming.map((p) => p.aqi));
    const minUpcoming = Math.min(...upcoming.map((p) => p.aqi));

    if (maxUpcoming >= firstAqi + 40 && maxUpcoming > 200) {
      forecastWarning = `Warning: Pollution is projected to surge by +${maxUpcoming - firstAqi} AQI points over the coming hours. Complete essential outdoor activities immediately or reschedule indoors.`;
    } else if (minUpcoming <= firstAqi - 40 && firstAqi > 150) {
      forecastWarning = `Positive Trend: Atmospheric conditions are expected to improve later today (AQI dropping towards ${minUpcoming}). Consider deferring outdoor plans to the clearer window.`;
    }

    // Identify 3-hour windows
    for (let i = 0; i <= upcoming.length - 3; i += 3) {
      const windowPoints = upcoming.slice(i, i + 3);
      if (windowPoints.length === 3) {
        const avg = Math.round(windowPoints.reduce((acc, p) => acc + p.aqi, 0) / 3);
        const winCategory = windowPoints[1].category;
        let suitability: OutdoorWindow['suitability'] = 'Acceptable';
        let reason = 'Moderate atmospheric conditions.';

        if (avg <= 50) {
          suitability = 'Ideal';
          reason = 'Cleanest ambient window for exercise and leisure.';
        } else if (avg <= 100) {
          suitability = 'Ideal';
          reason = 'Favorable air quality for all age groups.';
        } else if (avg <= 200) {
          suitability = 'Acceptable';
          reason = 'Manageable for healthy adults; sensitive groups should limit exertion.';
        } else if (avg <= 300) {
          suitability = 'Caution';
          reason = 'Elevated particulate load; shorten outdoor duration.';
        } else {
          suitability = 'Avoid';
          reason = 'Unhealthy smog; reschedule non-essential outdoor presence.';
        }

        const startT = windowPoints[0].formattedTime;
        const endT = windowPoints[2].formattedTime;

        bestOutdoorWindows.push({
          startTime: windowPoints[0].time,
          endTime: windowPoints[2].time,
          formattedTimeRange: `${startT} - ${endT}`,
          avgAqi: avg,
          category: winCategory,
          suitability,
          recommendedActivities:
            suitability === 'Ideal'
              ? ['Jogging', 'Cycling', 'Outdoor Sports', 'Walking']
              : suitability === 'Acceptable'
              ? ['Moderate Walking', 'Transit Commutes', 'Light Outdoor Chores']
              : suitability === 'Caution'
              ? ['Essential Errands', 'Short Walking with Mask']
              : ['Indoor Workouts Only'],
          reason,
        });
      }
    }
  }

  return {
    summaryTitle,
    pollutionSummary,
    mainConcern,
    advisoryText,
    sensitivityImpact,
    maskRecommendation,
    indoorVentilation,
    activityGuidance,
    forecastWarning,
    bestOutdoorWindows,
    medicalDisclaimer: MEDICAL_DISCLAIMER,
  };
}

function evaluateActivityGuidance(
  activity: UserActivity,
  category: AqiCategory,
  sensitivity: UserSensitivity
): ActivityGuidance {
  const label = ACTIVITY_LABELS[activity];
  let suitability: ActivityGuidance['suitability'] = 'Safe';
  let recommendedIntensity: ActivityGuidance['recommendedIntensity'] = 'Normal';
  const advice: string[] = [];
  let bestTime = 'Anytime during daytime hours.';

  const isSensitive = sensitivity !== 'general';

  if (category === 'Good') {
    suitability = 'Safe';
    recommendedIntensity = 'Normal';
    advice.push('Optimal conditions for high-intensity training and aerobic workouts.');
    advice.push('Take advantage of pristine air quality for long outdoor sessions.');
    bestTime = 'All day conditions are clean and favorable.';
  } else if (category === 'Satisfactory') {
    suitability = 'Safe';
    recommendedIntensity = 'Normal';
    advice.push('Safe for running, walking, and sports for healthy individuals.');
    if (isSensitive) {
      advice.push('Sensitive individuals should stay well-hydrated and monitor comfort.');
    }
    bestTime = 'Favorable throughout morning and afternoon.';
  } else if (category === 'Moderately Polluted') {
    suitability = isSensitive ? 'Caution' : 'Acceptable';
    recommendedIntensity = isSensitive ? 'Moderate' : 'Normal';
    if (activity === 'running' || activity === 'outdoor_sports') {
      advice.push('Avoid pushing for personal endurance maximums; keep heart rate moderate.');
      advice.push('Move workouts away from heavy traffic corridors to leafy parks.');
    } else if (activity === 'school_commute') {
      advice.push('Schools should replace prolonged outdoor sports with sheltered gym activities.');
    } else if (activity === 'daily_commuting') {
      advice.push('Keep transit vehicle windows closed; activate cabin filtration.');
    } else {
      advice.push('Keep walking pace moderate and take regular hydration breaks.');
    }
    bestTime = 'Midday to late afternoon (11 AM - 4 PM) when atmospheric mixing is highest.';
  } else if (category === 'Poor') {
    suitability = isSensitive ? 'Avoid' : 'Caution';
    recommendedIntensity = isSensitive ? 'Light / Indoor Only' : 'Moderate';
    advice.push('Significantly reduce prolonged outdoor stamina workouts.');
    advice.push('High breathing rates inhale 10-20× more particulate matter directly into lungs.');
    if (activity === 'school_commute') {
      advice.push('Ensure students commute with protective N95 masks and avoid playground sports.');
    } else if (activity === 'daily_commuting') {
      advice.push('Wear an N95 mask on two-wheelers, auto-rickshaws, and open transit.');
    } else {
      advice.push('Substitute outdoor running with indoor treadmill, yoga, or calisthenics.');
    }
    bestTime = 'Defer strenuous sessions until air quality improves.';
  } else if (category === 'Very Poor') {
    suitability = 'Avoid';
    recommendedIntensity = 'Light / Indoor Only';
    advice.push('Avoid all outdoor aerobic running, cycling, and competitive sports.');
    advice.push('Shift exercise to sealed indoor facilities equipped with HEPA filtration.');
    advice.push('If outdoor commute is unavoidable, wear a properly fitted N95 respirator.');
    if (activity === 'school_commute') {
      advice.push('Outdoor assemblies and sports should be suspended.');
    }
    bestTime = 'Keep outdoor transit strictly to necessary travel.';
  } else {
    // Severe
    suitability = 'Avoid';
    recommendedIntensity = 'Cancel / Reschedule';
    advice.push('CRITICAL EMERGENCY: Severe particulate hazards present outdoors.');
    advice.push('Any outdoor physical exercise poses immediate respiratory stress.');
    advice.push('Stay indoors with air purifiers; seal windows and doors against infiltration.');
    bestTime = 'Strictly indoor shelter; do not exercise outdoors.';
  }

  return {
    activity,
    activityLabel: label,
    suitability,
    recommendedIntensity,
    specificAdvice: advice,
    bestTimeSuggestion: bestTime,
  };
}
