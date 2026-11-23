/**
 * Air Quality and Meteorological Telemetry Types.
 */

export interface GeoLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly name: string;
  readonly admin1?: string;
  readonly country: string;
  readonly timezone?: string;
}

export interface PollutantTelemetry {
  readonly usAqi: number;
  readonly europeanAqi: number;
  readonly pm25: number;
  readonly pm10: number;
  readonly carbonMonoxide: number;
  readonly nitrogenDioxide: number;
  readonly sulphurDioxide: number;
  readonly ozone: number;
  readonly dust: number;
  readonly uvIndex: number;
}

export interface HourlyAirQualityPoint {
  readonly time: string;
  readonly usAqi: number;
  readonly pm25: number;
  readonly pm10: number;
  readonly nitrogenDioxide: number;
  readonly ozone: number;
  readonly temperature2m: number;
  readonly relativeHumidity2m: number;
  readonly windSpeed10m: number;
  readonly boundaryLayerHeight: number;
}

export type UsAqiCategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous';

export type CpcbCategory = 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';

export type GrapStage =
  'None' | 'Stage I (Poor)' | 'Stage II (Very Poor)' | 'Stage III (Severe)' | 'Stage IV (Severe+)';

export interface CpcbAqiResult {
  readonly aqi: number;
  readonly category: CpcbCategory;
  readonly dominantPollutant: string;
  readonly subIndices: {
    readonly pm25?: number;
    readonly pm10?: number;
    readonly no2?: number;
    readonly so2?: number;
    readonly co?: number;
    readonly o3?: number;
  };
}

export type SmogTrapRiskLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export interface SmogTrapAssessment {
  readonly riskLevel: SmogTrapRiskLevel;
  readonly boundaryLayerHeight: number;
  readonly windSpeed: number;
  readonly temperature: number;
  readonly explanation: string;
}

export interface VentilationWindow {
  readonly startHour: string;
  readonly endHour: string;
  readonly averagePm25: number;
  readonly boundaryLayerHeight: number;
  readonly windSpeed: number;
  readonly isSafestWindow: boolean;
  readonly rationale: string;
}

export interface CombinedAirTelemetry {
  readonly location: GeoLocation;
  readonly currentPollutants: PollutantTelemetry;
  readonly hourlyForecast: readonly HourlyAirQualityPoint[];
  readonly cpcbAqi: CpcbAqiResult;
  readonly grapStage: GrapStage;
  readonly smogTrap: SmogTrapAssessment;
  readonly safestVentilation: VentilationWindow | null;
  readonly lastUpdated: string;
}
