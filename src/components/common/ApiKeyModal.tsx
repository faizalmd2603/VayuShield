import React, { useState, useEffect, useRef } from 'react';
import { verifyGeminiApiKey } from '../../services/geminiService';
import { AlertIcon, CheckIcon, KeyIcon } from '../icons/Icons';

interface Props {
  readonly isOpen: boolean;
  readonly currentKey: string;
  readonly onClose: () => void;
  readonly onSaveKey: (key: string) => void;
  readonly onClearKey: () => void;
}

const KeyStatusMessage: React.FC<{ readonly status: 'idle' | 'success' | 'failed' }> = ({ status }) => {
  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#00FFC2]/10 text-[#00FFC2] border border-[#00FFC2]/30 text-xs font-mono">
        <CheckIcon className="w-4 h-4 shrink-0 text-[#00FFC2]" />
        <span>Connection verified. Key active for this session.</span>
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs font-mono">
        <AlertIcon className="w-4 h-4 shrink-0 text-rose-500" />
        <span>Verification failed. Please check key validity or permissions.</span>
      </div>
    );
  }
  return null;
};

const ModalHeader: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[#00FFC2]">
      <KeyIcon className="w-4 h-4" />
    </div>
    <div>
      <h2 id="api-modal-title" className="text-base font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
        Google Gemini API Key
      </h2>
      <p className="text-xs font-mono text-neutral-400">Stored in session memory only (never localStorage)</p>
    </div>
  </div>
);

/**
 * Accessible configuration modal for Google Gemini API credentials.
 */
export const ApiKeyModal: React.FC<Props> = ({
  isOpen,
  currentKey,
  onClose,
  onSaveKey,
  onClearKey,
}) => {
  const [inputVal, setInputVal] = useState(currentKey);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setInputVal(currentKey);
    setVerifyStatus('idle');
    const timer = setTimeout(() => { inputRef.current?.focus(); }, 50);

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, currentKey, onClose]);

  const handleVerify = async (): Promise<void> => {
    if (!inputVal.trim()) return;
    setIsVerifying(true);
    setVerifyStatus('idle');
    const valid = await verifyGeminiApiKey(inputVal.trim());
    setIsVerifying(false);
    setVerifyStatus(valid ? 'success' : 'failed');
    if (valid) onSaveKey(inputVal.trim());
  };

  if (!isOpen) return null;

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="api-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
        <ModalHeader />
        <div className="space-y-2">
          <label htmlFor="gemini-key-input" className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            API Key
          </label>
          <input
            ref={inputRef} id="gemini-key-input" type="password" value={inputVal}
            onChange={(e) => { setInputVal(e.target.value); setVerifyStatus('idle'); }}
            placeholder="AIzaSy... or AQ.Ab8..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:border-[#00FFC2]"
          />
          <p className="text-[11px] font-mono text-neutral-400">
            Get key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#00FFC2] underline font-medium">Google AI Studio</a>.
          </p>
        </div>
        <KeyStatusMessage status={verifyStatus} />
        <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
          {currentKey ? (
            <button type="button" onClick={() => { onClearKey(); setInputVal(''); setVerifyStatus('idle'); }} className="text-xs font-mono text-rose-500 font-medium cursor-pointer hover:underline">
              Clear Key
            </button>
          ) : <div />}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 rounded-full cursor-pointer hover:text-white">Close</button>
            <button type="button" disabled={isVerifying || !inputVal.trim()} onClick={() => { void handleVerify(); }} className="px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold bg-[#00FFC2] hover:bg-[#00e6ae] text-black rounded-full disabled:opacity-40 cursor-pointer transition-colors shadow-sm shadow-[#00FFC2]/20">
              {isVerifying ? 'Verifying...' : 'Verify & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
