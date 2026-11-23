import React from 'react';

interface Props {
  readonly count?: number;
  readonly heightClass?: string;
  readonly className?: string;
}

/**
 * Pulsing accessible loading placeholder.
 */
export const LoadingSkeleton: React.FC<Props> = ({
  count = 3,
  heightClass = 'h-16',
  className = '',
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      role="status"
      aria-label="Loading content..."
      className={`space-y-3 animate-pulse ${className}`}
    >
      {items.map((i) => (
        <div
          key={i}
          className={`w-full bg-slate-200 dark:bg-slate-800 rounded-xl ${heightClass}`}
        />
      ))}
      <span className="sr-only">Loading, please wait...</span>
    </div>
  );
};
