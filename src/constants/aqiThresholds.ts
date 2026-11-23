import type { CpcbCategory, GrapStage, UsAqiCategory } from '../types/airQuality';

export interface Breakpoint {
  readonly cLow: number;
  readonly cHigh: number;
  readonly iLow: number;
  readonly iHigh: number;
}

/**
 * Official Indian CPCB NAQI (National Air Quality Index) Breakpoints.
 */
export const CPCB_BREAKPOINTS: Record<string, readonly Breakpoint[]> = {
  pm25: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 31, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 61, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 91, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 121, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 251, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 251, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 351, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 431, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  no2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 180, iLow: 101, iHigh: 200 },
    { cLow: 181, cHigh: 280, iLow: 201, iHigh: 300 },
    { cLow: 281, cHigh: 400, iLow: 301, iHigh: 400 },
    { cLow: 401, cHigh: 800, iLow: 401, iHigh: 500 },
  ],
  so2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 41, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 81, cHigh: 380, iLow: 101, iHigh: 200 },
    { cLow: 381, cHigh: 800, iLow: 201, iHigh: 300 },
    { cLow: 801, cHigh: 1600, iLow: 301, iHigh: 400 },
    { cLow: 1601, cHigh: 2000, iLow: 401, iHigh: 500 },
  ],
  co: [
    { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
    { cLow: 1.1, cHigh: 2.0, iLow: 51, iHigh: 100 },
    { cLow: 2.1, cHigh: 10.0, iLow: 101, iHigh: 200 },
    { cLow: 10.1, cHigh: 17.0, iLow: 201, iHigh: 300 },
    { cLow: 17.1, cHigh: 34.0, iLow: 301, iHigh: 400 },
    { cLow: 34.1, cHigh: 50.0, iLow: 401, iHigh: 500 },
  ],
  o3: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 51, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 101, cHigh: 168, iLow: 101, iHigh: 200 },
    { cLow: 169, cHigh: 208, iLow: 201, iHigh: 300 },
    { cLow: 209, cHigh: 748, iLow: 301, iHigh: 400 },
    { cLow: 749, cHigh: 1000, iLow: 401, iHigh: 500 },
  ],
};

export const CPCB_CATEGORIES: readonly {
  readonly min: number;
  readonly max: number;
  readonly label: CpcbCategory;
  readonly description: string;
  readonly colorClass: string;
  readonly badgeBg: string;
}[] = [
  {
    min: 0,
    max: 50,
    label: 'Good',
    description: 'Minimal health impact; air quality is satisfactory.',
    colorClass: 'text-emerald-700 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800',
  },
  {
    min: 51,
    max: 100,
    label: 'Satisfactory',
    description: 'Minor breathing discomfort to sensitive individuals.',
    colorClass: 'text-teal-700 dark:text-teal-400',
    badgeBg: 'bg-teal-100 dark:bg-teal-950/60 border-teal-300 dark:border-teal-800',
  },
  {
    min: 101,
    max: 200,
    label: 'Moderate',
    description: 'Breathing discomfort to people with lungs, asthma and heart diseases.',
    colorClass: 'text-amber-700 dark:text-amber-400',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800',
  },
  {
    min: 201,
    max: 300,
    label: 'Poor',
    description: 'Breathing discomfort to most people on prolonged exposure.',
    colorClass: 'text-orange-700 dark:text-orange-400',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/60 border-orange-300 dark:border-orange-800',
  },
  {
    min: 301,
    max: 400,
    label: 'Very Poor',
    description: 'Respiratory illness on prolonged exposure; severe impact on vulnerable.',
    colorClass: 'text-rose-700 dark:text-rose-400',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800',
  },
  {
    min: 401,
    max: 9999,
    label: 'Severe',
    description: 'Affects healthy people and seriously impacts those with existing diseases.',
    colorClass: 'text-purple-700 dark:text-purple-400',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800',
  },
];

export const GRAP_STAGES: readonly {
  readonly stage: GrapStage;
  readonly minAqi: number;
  readonly maxAqi: number;
  readonly title: string;
  readonly protocols: readonly string[];
}[] = [
  {
    stage: 'None',
    minAqi: 0,
    maxAqi: 200,
    title: 'Standard Monitoring',
    protocols: ['Regular dust suppression', 'Standard emissions vigilance'],
  },
  {
    stage: 'Stage I (Poor)',
    minAqi: 201,
    maxAqi: 300,
    title: 'Stage I Enforcement',
    protocols: [
      'Strict anti-idling in traffic & schools',
      'Water sprinkling on paved roads',
      'Enforce ban on open solid waste burning',
    ],
  },
  {
    stage: 'Stage II (Very Poor)',
    minAqi: 301,
    maxAqi: 400,
    title: 'Stage II Emergency',
    protocols: [
      'Halt diesel generator set usage except essential services',
      'Enhance parking fees to discourage private vehicle use',
      'Increase frequency of metro/bus services',
    ],
  },
  {
    stage: 'Stage III (Severe)',
    minAqi: 401,
    maxAqi: 450,
    title: 'Stage III Severe Measures',
    protocols: [
      'Ban on non-essential construction and demolition activities',
      'Restrictions on BS-III petrol and BS-IV diesel light motor vehicles',
      'Shift primary schools to hybrid / remote learning where applicable',
    ],
  },
  {
    stage: 'Stage IV (Severe+)',
    minAqi: 451,
    maxAqi: 9999,
    title: 'Stage IV Crisis Emergency',
    protocols: [
      'Stop entry of non-essential trucks into urban zones',
      'Halt all construction/demolition including public projects',
      '50% work-from-home mandate across public and private offices',
    ],
  },
];

export const US_AQI_CATEGORIES: readonly {
  readonly min: number;
  readonly max: number;
  readonly label: UsAqiCategory;
}[] = [
  { min: 0, max: 50, label: 'Good' },
  { min: 51, max: 100, label: 'Moderate' },
  { min: 101, max: 150, label: 'Unhealthy for Sensitive Groups' },
  { min: 151, max: 200, label: 'Unhealthy' },
  { min: 201, max: 300, label: 'Very Unhealthy' },
  { min: 301, max: 9999, label: 'Hazardous' },
];
