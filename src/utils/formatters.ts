/**
 * Formatting and Localization Utilities for Environmental Metrics.
 */

/**
 * Formats an AQI value with integer precision.
 */
export function formatAqi(aqi: number): string {
  if (isNaN(aqi) || aqi < 0) return '—';
  return Math.round(aqi).toString();
}

/**
 * Formats a PM2.5 or PM10 concentration reading with standard units.
 */
export function formatConcentration(value: number, unit = 'µg/m³'): string {
  if (isNaN(value) || value < 0) return `— ${unit}`;
  return `${Math.round(value)} ${unit}`;
}

/**
 * Formats greenhouse gas mass into kilograms of CO2 equivalent.
 */
export function formatCo2e(kg: number): string {
  if (isNaN(kg) || kg < 0) return '0.0 kg CO₂e';
  return `${kg.toFixed(1)} kg CO₂e`;
}

/**
 * Formats an ISO date-time string into a human-readable 12-hour or 24-hour time.
 */
export function formatTimeHour(isoString: string): string {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Formats percentage with clamp [0, 100].
 */
export function formatPercentage(val: number): string {
  const safe = Math.max(0, Math.min(100, Math.round(val)));
  return `${safe}%`;
}
