import React, { useEffect, useState } from 'react';
import { ExternalLinkIcon, MapPinIcon } from '../icons/Icons';
import {
  fetchSerpApiMapLocation,
  getGoogleSatelliteUrl,
  type SerpApiMapResult,
} from '../../services/mapService';
import type { GeoLocation } from '../../types/airQuality';

interface Props {
  readonly location: GeoLocation;
}

type MapViewMode = 'interactive' | 'satellite';

interface HeaderProps {
  readonly location: GeoLocation;
  readonly satUrl: string;
  readonly mode: MapViewMode;
  readonly onSetMode: (m: MapViewMode) => void;
}

const MapHeaderBar: React.FC<HeaderProps> = ({ location, satUrl, mode, onSetMode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
    <div className="flex items-center gap-2">
      <MapPinIcon className="w-4 h-4 text-[#00FFC2]" />
      <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">
        [ GEOSPATIAL INTELLIGENCE // IN-APP MAP VIEW ]
      </h2>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
        {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
      </span>
      <div className="flex items-center bg-neutral-100 dark:bg-neutral-800/90 rounded-lg p-0.5 border border-neutral-200 dark:border-neutral-700">
        <button
          type="button"
          onClick={() => {
            onSetMode('interactive');
          }}
          className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors ${
            mode === 'interactive'
              ? 'bg-[#00FFC2] text-neutral-950 font-bold shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
          aria-pressed={mode === 'interactive'}
        >
          Interactive Map
        </button>
        <button
          type="button"
          onClick={() => {
            onSetMode('satellite');
          }}
          className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors ${
            mode === 'satellite'
              ? 'bg-[#00FFC2] text-neutral-950 font-bold shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
          aria-pressed={mode === 'satellite'}
        >
          Satellite Sensor
        </button>
      </div>

      <a
        href={satUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 text-[11px] font-mono transition-colors"
        aria-label="Open in Google Maps fullscreen"
      >
        <span>Google Maps</span>
        <ExternalLinkIcon className="w-3 h-3" />
      </a>
    </div>
  </div>
);

const InteractiveMapFrame: React.FC<{ readonly location: GeoLocation }> = ({ location }) => {
  const { latitude: lat, longitude: lon, name } = location;
  const dLon = 0.045;
  const dLat = 0.035;
  const bbox = `${(lon - dLon).toFixed(4)}%2C${(lat - dLat).toFixed(4)}%2C${(lon + dLon).toFixed(4)}%2C${(lat + dLat).toFixed(4)}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(4)}%2C${lon.toFixed(4)}`;

  return (
    <div className="relative rounded-xl overflow-hidden h-64 sm:h-72 md:h-80 border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950">
      <iframe
        title={`Interactive live map of ${name}`}
        src={embedUrl}
        className="w-full h-full border-0"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
      <div className="absolute top-2 right-2 bg-neutral-950/80 backdrop-blur-md px-2 py-1 rounded border border-neutral-700 text-[10px] font-mono text-[#00FFC2] pointer-events-none">
        LIVE IN-APP MAP • PIN LOCKED
      </div>
    </div>
  );
};

const SatelliteViewFrame: React.FC<{
  readonly thumbnail?: string;
  readonly title: string;
  readonly location: GeoLocation;
}> = ({ thumbnail, title, location }) => (
  <div className="relative rounded-xl overflow-hidden h-64 sm:h-72 md:h-80 border border-neutral-200 dark:border-neutral-800 bg-neutral-950 flex items-center justify-center">
    {thumbnail ? (
      <>
        <img
          src={thumbnail}
          alt={`Satellite aerial capture of ${title}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
      </>
    ) : (
      <div className="text-center p-6 space-y-2">
        <MapPinIcon className="w-8 h-8 text-[#00FFC2] mx-auto animate-pulse" />
        <p className="font-mono text-xs text-neutral-400">
          Synchronizing high-res satellite feed for {title}...
        </p>
      </div>
    )}
    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-white/90 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-neutral-800">
      <span>AERIAL SATELLITE SENSOR GRID</span>
      <span>
        {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
      </span>
    </div>
  </div>
);

const MapFooterMeta: React.FC<{
  readonly location: GeoLocation;
  readonly title: string;
  readonly description?: string;
}> = ({ location, title, description }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-2 text-xs font-mono text-neutral-600 dark:text-neutral-400">
    <div className="flex items-center gap-2">
      <span className="font-bold text-neutral-900 dark:text-neutral-100">{title}</span>
      <span className="text-neutral-400">•</span>
      <span>
        {location.admin1 ? `${location.admin1}, ` : ''}
        {location.country}
      </span>
    </div>
    <div className="flex items-center gap-3 text-[11px]">
      <span className="text-[#00FFC2] font-mono">STATUS: SYNCED</span>
      <span className="text-neutral-500">
        {description ?? 'Planetary boundary layer & dispersion ceiling models active.'}
      </span>
    </div>
  </div>
);

/**
 * In-app interactive map viewport & satellite imagery intelligence card.
 */
export const LocationMapCard: React.FC<Props> = ({ location }) => {
  const [mapData, setMapData] = useState<SerpApiMapResult | null>(null);
  const [mode, setMode] = useState<MapViewMode>('interactive');

  useEffect(() => {
    const controller = new AbortController();
    const query = location.admin1 ? `${location.name}, ${location.admin1}` : location.name;

    void fetchSerpApiMapLocation(query, controller.signal).then((data) => {
      setMapData(data);
    });

    return () => {
      controller.abort();
    };
  }, [location.name, location.admin1]);

  const satUrl =
    mapData?.satelliteUrl ?? getGoogleSatelliteUrl(location.latitude, location.longitude);

  return (
    <section
      aria-label="In-App Geospatial Intelligence and Satellite View"
      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 shadow-sm backdrop-blur-md hover:border-[#00FFC2]/40 transition-colors space-y-3"
    >
      <MapHeaderBar location={location} satUrl={satUrl} mode={mode} onSetMode={setMode} />
      {mode === 'interactive' ? (
        <InteractiveMapFrame location={location} />
      ) : (
        <SatelliteViewFrame
          thumbnail={mapData?.thumbnail}
          title={mapData?.title ?? location.name}
          location={location}
        />
      )}
      <MapFooterMeta
        location={location}
        title={mapData?.title ?? location.name}
        description={mapData?.description}
      />
    </section>
  );
};
