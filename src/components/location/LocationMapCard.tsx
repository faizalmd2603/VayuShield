import React, { useEffect, useState } from 'react';
import { ExternalLinkIcon, MapPinIcon } from '../icons/Icons';
import { fetchSerpApiMapLocation, getGoogleSatelliteUrl, type SerpApiMapResult } from '../../services/mapService';
import type { GeoLocation } from '../../types/airQuality';

interface Props {
  readonly location: GeoLocation;
}

const MapHeaderBar: React.FC<{
  readonly location: GeoLocation;
  readonly satUrl: string;
}> = ({ location, satUrl }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
    <div className="flex items-center gap-2">
      <MapPinIcon className="w-4 h-4 text-[#00FFC2]" />
      <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">
        [ SATELLITE VIEW // GOOGLE MAPS INTELLIGENCE ]
      </h2>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700">
        {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
      </span>
      <a
        href={satUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#00FFC2]/10 hover:bg-[#00FFC2]/20 text-[#00FFC2] border border-[#00FFC2]/30 text-xs font-mono font-medium transition-colors"
        aria-label="Open Satellite View in Google Maps"
      >
        <span>Satellite View</span>
        <ExternalLinkIcon className="w-3 h-3" />
      </a>
    </div>
  </div>
);

const MapThumbnail: React.FC<{ readonly thumbnail: string; readonly title: string }> = ({ thumbnail, title }) => (
  <div className="relative rounded-xl overflow-hidden aspect-video md:aspect-auto md:h-28 border border-neutral-200 dark:border-neutral-800 bg-neutral-950">
    <img src={thumbnail} alt={`Satellite view of ${title}`} className="w-full h-full object-cover" loading="lazy" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    <span className="absolute bottom-1.5 left-2 text-[9px] font-mono uppercase text-white/90 bg-black/60 px-1.5 py-0.5 rounded">
      AERIAL SENSOR GRID
    </span>
  </div>
);

const MapInfoPanel: React.FC<{
  readonly title: string;
  readonly location: GeoLocation;
  readonly isLoading: boolean;
  readonly description?: string;
  readonly hasThumbnail: boolean;
}> = ({ title, location, isLoading, description, hasThumbnail }) => (
  <div className={`${hasThumbnail ? 'md:col-span-2' : 'md:col-span-3'} space-y-1.5 font-mono text-xs`}>
    <div className="flex items-baseline gap-2">
      <span className="text-sm font-bold text-neutral-900 dark:text-white">{title}</span>
      <span className="text-neutral-500 text-[11px]">{location.admin1 ? `${location.admin1}, ` : ''}{location.country}</span>
    </div>
    <p className="text-neutral-600 dark:text-neutral-400 font-sans leading-relaxed text-xs">
      {isLoading ? 'Synchronizing aerial telemetry and ground-level station lock...' : description ?? `Atmospheric telemetry and inversion ceilings streaming for ${location.name}. Planetary boundary layer models active.`}
    </p>
  </div>
);

/**
 * Satellite imagery and geospatial intelligence card powered by SerpAPI & Google Maps.
 */
export const LocationMapCard: React.FC<Props> = ({ location }) => {
  const [mapData, setMapData] = useState<SerpApiMapResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    const query = location.admin1 ? `${location.name}, ${location.admin1}` : location.name;
    void fetchSerpApiMapLocation(query, controller.signal)
      .then((data) => { setMapData(data); })
      .finally(() => { setIsLoading(false); });

    return () => { controller.abort(); };
  }, [location.name, location.admin1]);

  const satUrl = mapData?.satelliteUrl ?? getGoogleSatelliteUrl(location.latitude, location.longitude);

  return (
    <section
      aria-label="Satellite Imagery and Geolocation Intelligence"
      className="p-5 rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 shadow-sm backdrop-blur-md hover:border-[#00FFC2]/40 transition-colors space-y-4"
    >
      <MapHeaderBar location={location} satUrl={satUrl} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {mapData?.thumbnail && <MapThumbnail thumbnail={mapData.thumbnail} title={location.name} />}
        <MapInfoPanel
          title={mapData?.title ?? location.name}
          location={location}
          isLoading={isLoading}
          description={mapData?.description}
          hasThumbnail={Boolean(mapData?.thumbnail)}
        />
      </div>
    </section>
  );
};
