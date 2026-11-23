import React from 'react';
import { useLocationSearch } from '../../hooks/useLocationSearch';
import type { GeoLocation } from '../../types/airQuality';
import { GpsIcon, SearchIcon } from '../icons/Icons';

interface Props {
  readonly onSelectLocation: (loc: GeoLocation) => void;
  readonly selectedLocation: GeoLocation | null;
}

/**
 * Debounced geocoding search input and GPS positioning bar.
 */
export const LocationSearchBar: React.FC<Props> = ({
  onSelectLocation,
  selectedLocation,
}) => {
  const {
    query,
    setQuery,
    candidates,
    isSearching,
    isGpsLocating,
    error,
    fetchGpsLocation,
    clearSearch,
  } = useLocationSearch(onSelectLocation);

  const placeholder = selectedLocation
    ? `${selectedLocation.name}, ${selectedLocation.country}`
    : 'Search any city globally (e.g. New Delhi, Beijing, London, Lahore)...';

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <SearchIcon className="w-4 h-4 text-neutral-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); }}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 text-sm rounded-full border border-neutral-300 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-[#00FFC2] focus:ring-1 focus:ring-[#00FFC2] shadow-sm transition-all"
            aria-label="Search city or locality"
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              <div className="w-3.5 h-3.5 border-2 border-[#00FFC2] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => { void fetchGpsLocation(); }}
          disabled={isGpsLocating}
          className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-mono tracking-wider uppercase border border-neutral-300 dark:border-neutral-800 hover:border-[#00FFC2] transition-colors cursor-pointer shrink-0"
          aria-label="Use browser GPS location"
        >
          <GpsIcon className={`w-3.5 h-3.5 text-[#00FFC2] ${isGpsLocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Use GPS</span>
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-rose-500 px-3 font-mono" role="alert">
          {error}
        </p>
      )}

      {candidates.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-2 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800/80">
          {candidates.map((loc) => (
            <li key={`${loc.name}-${loc.latitude}-${loc.longitude}`}>
              <button
                type="button"
                onClick={() => {
                  onSelectLocation(loc);
                  clearSearch();
                }}
                className="w-full text-left px-5 py-3 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/60 flex items-center justify-between text-neutral-800 dark:text-neutral-200 cursor-pointer transition-colors"
              >
                <span className="font-semibold">{loc.name}</span>
                <span className="text-xs font-mono text-neutral-400">
                  {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
