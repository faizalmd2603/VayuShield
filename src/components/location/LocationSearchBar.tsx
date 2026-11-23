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
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); }}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition-colors"
            aria-label="Search city or locality"
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => { void fetchGpsLocation(); }}
          disabled={isGpsLocating}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer shrink-0"
          aria-label="Use browser GPS location"
        >
          <GpsIcon className={`w-4 h-4 ${isGpsLocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Use GPS</span>
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 px-1" role="alert">
          {error}
        </p>
      )}

      {candidates.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          {candidates.map((loc) => (
            <li key={`${loc.name}-${loc.latitude}-${loc.longitude}`}>
              <button
                type="button"
                onClick={() => {
                  onSelectLocation(loc);
                  clearSearch();
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <span className="font-medium">{loc.name}</span>
                <span className="text-xs text-slate-400">
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
