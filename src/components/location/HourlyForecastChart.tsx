import React, { useState } from 'react';
import type { HourlyAirQualityPoint } from '../../types/airQuality';
import { formatTimeHour } from '../../utils/formatters';

interface Props {
  readonly hourly: readonly HourlyAirQualityPoint[];
}

const ForecastTable: React.FC<{ readonly points: readonly HourlyAirQualityPoint[] }> = ({ points }) => (
  <div className="max-h-60 overflow-y-auto">
    <table className="w-full text-xs text-left text-slate-700 dark:text-slate-300">
      <caption className="sr-only">Detailed hourly forecast metrics</caption>
      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase sticky top-0">
        <tr>
          <th className="py-2 px-3">Time</th>
          <th className="py-2 px-3">PM2.5 (µg/m³)</th>
          <th className="py-2 px-3">PM10 (µg/m³)</th>
          <th className="py-2 px-3">Boundary Layer (m)</th>
          <th className="py-2 px-3">Wind (km/h)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {points.map((pt) => (
          <tr key={pt.time}>
            <td className="py-2 px-3 font-medium">{formatTimeHour(pt.time)}</td>
            <td className="py-2 px-3">{pt.pm25}</td>
            <td className="py-2 px-3">{pt.pm10}</td>
            <td className="py-2 px-3">{pt.boundaryLayerHeight}m</td>
            <td className="py-2 px-3">{pt.windSpeed10m}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * Pure SVG 48-Hour Forecast Visualization with accessible data table alternative.
 */
export const HourlyForecastChart: React.FC<Props> = ({ hourly }) => {
  const [showTable, setShowTable] = useState(false);
  const points = hourly.slice(0, 24);

  if (points.length === 0) return null;
  const maxVal = Math.max(100, ...points.map((p) => p.pm25));
  const svgW = 800;
  const svgH = 180;
  const padX = 40;
  const padY = 25;

  const getPt = (idx: number, val: number): { x: number; y: number } => ({
    x: Math.round(padX + (idx / (points.length - 1)) * (svgW - 2 * padX)),
    y: Math.round(svgH - padY - (val / maxVal) * (svgH - 2 * padY)),
  });

  const pathD = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getPt(idx, p.pm25).x} ${getPt(idx, p.pm25).y}`)
    .join(' ');

  return (
    <section aria-label="Hourly Air Quality Forecast" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            24-Hour PM2.5 Trajectory
          </h3>
          <p className="text-xs text-slate-500">Hourly particulate concentration (µg/m³)</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowTable((prev) => !prev); }}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          aria-expanded={showTable}
        >
          {showTable ? 'Show Graphical Chart' : 'Show Screen-Reader Table'}
        </button>
      </div>

      {!showTable ? (
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} role="img" aria-label="24-hour PM2.5 trend graph" className="w-full h-44 text-sky-600 dark:text-sky-400">
            <title>24-Hour PM2.5 Hourly Trend</title>
            <desc>A continuous line graph plotting live hourly PM2.5 concentration.</desc>
            <path d={pathD} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, idx) => {
              if (idx % 3 !== 0 && idx !== points.length - 1) return null;
              const pt = getPt(idx, p.pm25);
              return (
                <g key={p.time}>
                  <circle cx={pt.x} cy={pt.y} r={4} fill="currentColor" />
                  <text x={pt.x} y={pt.y - 8} textAnchor="middle" fontSize={10} fill="currentColor" fontWeight="bold">{p.pm25}</text>
                  <text x={pt.x} y={svgH - 8} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.6}>{formatTimeHour(p.time)}</text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <ForecastTable points={points} />
      )}
    </section>
  );
};
