/**
 * Domain and Application Error Types.
 * Provides a structured error hierarchy for transparent error reporting.
 */

export type GeminiErrorCode =
  | 'INVALID_KEY'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'SCHEMA_INVALID'
  | 'NETWORK_OFFLINE'
  | 'ABORTED';

export type LocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'GEOCODING_FAILED';

/**
 * Base Application Error.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly recoverable: boolean;

  public constructor(message: string, code = 'APP_ERROR', recoverable = true) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.recoverable = recoverable;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Network connection and fetch errors.
 */
export class NetworkError extends AppError {
  public readonly status?: number;

  public constructor(message: string, status?: number) {
    super(message, 'NETWORK_ERROR', true);
    this.name = 'NetworkError';
    this.status = status;
  }
}

/**
 * Geolocation and Geocoding lookup errors.
 */
export class LocationError extends AppError {
  public readonly locationCode: LocationErrorCode;

  public constructor(message: string, locationCode: LocationErrorCode) {
    super(message, `LOCATION_${locationCode}`, true);
    this.name = 'LocationError';
    this.locationCode = locationCode;
  }
}

/**
 * Google Gemini API specific errors with explicit codes.
 */
export class GeminiApiError extends AppError {
  public readonly geminiCode: GeminiErrorCode;

  public constructor(
    message: string,
    geminiCode: GeminiErrorCode,
    recoverable = true
  ) {
    super(message, `GEMINI_${geminiCode}`, recoverable);
    this.name = 'GeminiApiError';
    this.geminiCode = geminiCode;
  }
}
