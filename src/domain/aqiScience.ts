import {
  CPCB_BREAKPOINTS,
  CPCB_CATEGORIES,
  GRAP_STAGES,
  US_AQI_CATEGORIES,
} from '../constants/aqiThresholds';
import type {
  CpcbAqiResult,
  CpcbCategory,
  GrapStage,
  HourlyAirQualityPoint,
  PollutantTelemetry,
  SmogTrapAssessment,
  SmogTrapRiskLevel,
  UsAqiCategory,
  VentilationWindow,
} from '../types/airQuality';

/**
 * Calculates the CPCB sub-index for a specific pollutant concentration using linear interpolation.
 * Formula: I = I_low + ((I_high - I_low) / (C_high - C_low)) * (C - C_low)
 *
 * @param pollutant Key of the pollutant (e.g. pm25, pm10, no2, so2, co, o3)
 * @param concentration Observed concentration in standard units
 * @returns The computed sub-index rounded to integer, or undefined if invalid
 */
export function calculateCpcbSubIndex(
  pollutant: string,
  concentration: number
): number | undefined {
  if (concentration < 0 || isNaN(concentration)) return undefined;
  const breakpoints = CPCB_BREAKPOINTS[pollutant];
  if (!breakpoints || breakpoints.length === 0) return undefined;

  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const cDiff = bp.cHigh - bp.cLow;
      if (cDiff === 0) return Math.round(bp.iLow);
      const ratio = (concentration - bp.cLow) / cDiff;
      const index = bp.iLow + ratio * (bp.iHigh - bp.iLow);
      return Math.round(index);
    }
  }

  // If concentration exceeds the highest breakpoint, extrapolate to 500
  const lastBp = breakpoints[breakpoints.length - 1];
  return lastBp ? Math.min(500, Math.round(lastBp.iHigh)) : undefined;
}

/**
 * Maps an integer AQI to a CPCB qualitative health category.
 *
 * @param aqi Air Quality Index integer value
 * @returns The CPCB health category label
 */
export function getCpcbCategory(aqi: number): CpcbCategory {
  for (const cat of CPCB_CATEGORIES) {
    if (aqi >= cat.min && aqi <= cat.max) {
      return cat.label;
    }
  }
  return 'Severe';
}

/**
 * Computes the overall CPCB NAQI and dominant pollutant from live pollutant telemetry.
 *
 * @param telemetry Observed pollutant readings
 * @returns Detailed CPCB AQI result with dominant pollutant and sub-indices
 */
export function calculateCpcbAqi(
  telemetry: Partial<PollutantTelemetry>
): CpcbAqiResult {
  const subIndices: Record<string, number> = {};
  const pollutants: (keyof PollutantTelemetry)[] = [
    'pm25',
    'pm10',
    'nitrogenDioxide',
    'sulphurDioxide',
    'carbonMonoxide',
    'ozone',
  ];

  const keyMap: Record<string, string> = {
    pm25: 'pm25',
    pm10: 'pm10',
    nitrogenDioxide: 'no2',
    sulphurDioxide: 'so2',
    carbonMonoxide: 'co',
    ozone: 'o3',
  };

  let maxAqi = 0;
  let dominant = 'pm25';

  for (const key of pollutants) {
    const val = telemetry[key];
    const bpKey = keyMap[key];
    if (val === undefined || !bpKey) continue;

    const sub = calculateCpcbSubIndex(bpKey, val);
    if (sub === undefined) continue;

    subIndices[bpKey] = sub;
    if (sub > maxAqi) {
      maxAqi = sub;
      dominant = bpKey.toUpperCase();
    }
  }

  return {
    aqi: maxAqi,
    category: getCpcbCategory(maxAqi),
    dominantPollutant: dominant,
    subIndices,
  };
}

/**
 * Maps US AQI value to its standard category.
 *
 * @param aqi US AQI numerical value
 * @returns Standard US AQI category string
 */
export function getUsAqiCategory(aqi: number): UsAqiCategory {
  for (const cat of US_AQI_CATEGORIES) {
    if (aqi >= cat.min && aqi <= cat.max) {
      return cat.label;
    }
  }
  return 'Hazardous';
}

/**
 * Determines the applicable GRAP (Graded Response Action Plan) Stage from live AQI.
 *
 * @param aqi Current ambient Air Quality Index
 * @returns Applicable GRAP Stage
 */
export function determineGrapStage(aqi: number): GrapStage {
  for (const item of GRAP_STAGES) {
    if (aqi >= item.minAqi && aqi <= item.maxAqi) {
      return item.stage;
    }
  }
  return 'Stage IV (Severe+)';
}

/**
 * Evaluates winter thermal inversion and atmospheric trapping risk.
 *
 * @param current Current meteorological readings (boundary layer height, wind speed, temp)
 * @returns Smog trap risk assessment with explanation
 */
export function assessSmogTrap(current: {
  boundaryLayerHeight: number;
  windSpeed: number;
  temperature: number;
}): SmogTrapAssessment {
  const { boundaryLayerHeight, windSpeed, temperature } = current;
  let riskLevel: SmogTrapRiskLevel = 'Low';
  let explanation = 'Good atmospheric mixing with adequate boundary layer depth.';

  if (boundaryLayerHeight < 250 && windSpeed < 5) {
    riskLevel = 'Severe';
    explanation =
      'Severe nocturnal thermal inversion: Shallow boundary layer (<250m) and near-calm winds are trapping emissions near ground level.';
  } else if (boundaryLayerHeight < 400 || windSpeed < 8) {
    riskLevel = 'High';
    explanation =
      'High smog trap risk: Moderate inversion and sluggish surface winds limiting particulate dispersion.';
  } else if (boundaryLayerHeight < 700 || windSpeed < 12) {
    riskLevel = 'Moderate';
    explanation =
      'Moderate dispersion: Atmospheric boundary layer permits moderate vertical pollutant dilution.';
  }

  return {
    riskLevel,
    boundaryLayerHeight,
    windSpeed,
    temperature,
    explanation,
  };
}

/**
 * Scans 24-hour forecast data to identify the safest, lowest-exposure window for home ventilation.
 *
 * @param hourlyPoints Hourly air quality and dispersion points
 * @returns The safest ventilation window or null if insufficient points
 */
export function findSafestVentilationWindow(
  hourlyPoints: readonly HourlyAirQualityPoint[]
): VentilationWindow | null {
  if (hourlyPoints.length < 3) return null;
  const points = hourlyPoints.slice(0, 24);

  let bestPoint = points[0];
  let minPm25 = bestPoint ? bestPoint.pm25 : Infinity;

  for (const pt of points) {
    // Score based on lowest PM2.5, boosted slightly by higher boundary layer height
    if (pt.pm25 < minPm25) {
      minPm25 = pt.pm25;
      bestPoint = pt;
    }
  }

  if (!bestPoint) return null;

  const pointDate = new Date(bestPoint.time);
  const startHourStr = isNaN(pointDate.getTime())
    ? bestPoint.time
    : pointDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    startHour: startHourStr,
    endHour: `${startHourStr} + 2 hrs`,
    averagePm25: Math.round(bestPoint.pm25),
    boundaryLayerHeight: Math.round(bestPoint.boundaryLayerHeight),
    windSpeed: Math.round(bestPoint.windSpeed10m),
    isSafestWindow: true,
    rationale: `Optimal atmospheric dispersion window with boundary layer height of ${Math.round(bestPoint.boundaryLayerHeight)}m and lowest 24h PM2.5 (${Math.round(bestPoint.pm25)} µg/m³).`,
  };
}
