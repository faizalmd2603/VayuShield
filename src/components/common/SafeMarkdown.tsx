import React from 'react';

interface Props {
  readonly content: string;
  readonly className?: string;
}

/**
 * Safely parses bold inline text without innerHTML.
 */
function renderInlineBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

/**
 * Safe markdown renderer using standard React nodes.
 */
export const SafeMarkdown: React.FC<Props> = ({ content, className = '' }) => {
  const lines = content.split('\n');

  return (
    <div className={`space-y-2 text-sm leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-sky-500 select-none">•</span>
              <p className="flex-1">{renderInlineBold(trimmed.slice(2))}</p>
            </div>
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h4
              key={idx}
              className="text-base font-semibold text-slate-800 dark:text-slate-100 pt-1"
            >
              {trimmed.slice(4)}
            </h4>
          );
        }

        return <p key={idx}>{renderInlineBold(trimmed)}</p>;
      })}
    </div>
  );
};
