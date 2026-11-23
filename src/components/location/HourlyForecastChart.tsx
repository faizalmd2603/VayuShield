import React, { useState } from 'react';
import type { HourlyAirQualityPoint } from '../../types/airQuality';
import { formatTimeHour } from '../../utils/formatters';

interface Props {
  readonly hourly: readonly HourlyAirQualityPoint[];
}

const ForecastTable: React.FC<{ readonly points: readonly HourlyAirQualityPoint[] }> = ({ points }) => (
  <div className="max-h-60 overflow-y-auto">
    <table className="w-full text-xs text-left text-neutral-700 dark:text-neutral-300 font-mono">
      <caption className="sr-only">Detailed hourly forecast metrics</caption>
      <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-400 uppercase sticky top-0">
        <tr>
          <th className="py-2.5 px-3">Time</th>
          <th className="py-2.5 px-3">PM2.5 (µg/m³)</th>
          <th className="py-2.5 px-3">PM10 (µg/m³)</th>
          <th className="py-2.5 px-3">Boundary Layer (m)</th>
          <th className="py-2.5 px-3">Wind (km/h)</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {points.map((pt) => (
          <tr key={pt.time}>
            <td className="py-2 px-3 font-medium">{formatTimeHour(pt.time)}</td>
            <td className="py-2 px-3 text-[#00FFC2] font-bold">{pt.pm25}</td>
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
    <section aria-label="Hourly Air Quality Forecast" className="p-6 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 backdrop-blur-md hover:border-[#00FFC2]/50 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">
            [ 02 // 24-HOUR PM2.5 DISPERSION TRAJECTORY ]
          </h3>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">HOURLY PARTICULATE DENSITY (µg/m³)</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowTable((prev) => !prev); }}
          className="text-xs font-mono tracking-wider uppercase px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-[#00FFC2] text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
          aria-expanded={showTable}
        >
          {showTable ? 'Graphical Curve' : 'Screen-Reader Table'}
        </button>
      </div>

      {!showTable ? (
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} role="img" aria-label="24-hour PM2.5 trend graph" className="w-full h-44 text-[#00FFC2]">
            <title>24-Hour PM2.5 Hourly Trend</title>
            <desc>A continuous line graph plotting live hourly PM2.5 concentration.</desc>
            <path d={pathD} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, idx) => {
              if (idx % 3 !== 0 && idx !== points.length - 1) return null;
              const pt = getPt(idx, p.pm25);
              return (
                <g key={p.time}>
                  <circle cx={pt.x} cy={pt.y} r={4} fill="#00FFC2" />
                  <text x={pt.x} y={pt.y - 8} textAnchor="middle" fontSize={11} fill="currentColor" fontWeight="bold" fontFamily="monospace">{p.pm25}</text>
                  <text x={pt.x} y={svgH - 8} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.6} fontFamily="monospace">{formatTimeHour(p.time)}</text>
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
