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
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-xs font-medium">
        <CheckIcon className="w-4 h-4 shrink-0 text-emerald-600" />
        <span>Connection verified. Key active for this session.</span>
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 text-xs font-medium">
        <AlertIcon className="w-4 h-4 shrink-0 text-rose-600" />
        <span>Verification failed. Please check key validity or permissions.</span>
      </div>
    );
  }
  return null;
};

const ModalHeader: React.FC = () => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
      <KeyIcon className="w-5 h-5" />
    </div>
    <div>
      <h2 id="api-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
        Google Gemini API Key
      </h2>
      <p className="text-xs text-slate-500">Stored in session memory only (never localStorage)</p>
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
    <div role="dialog" aria-modal="true" aria-labelledby="api-modal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <ModalHeader />
        <div className="space-y-2">
          <label htmlFor="gemini-key-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            API Key
          </label>
          <input
            ref={inputRef} id="gemini-key-input" type="password" value={inputVal}
            onChange={(e) => { setInputVal(e.target.value); setVerifyStatus('idle'); }}
            placeholder="AIzaSy..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
          />
          <p className="text-xs text-slate-500">
            Get key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline font-medium">Google AI Studio</a>.
          </p>
        </div>
        <KeyStatusMessage status={verifyStatus} />
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          {currentKey ? (
            <button type="button" onClick={() => { onClearKey(); setInputVal(''); setVerifyStatus('idle'); }} className="text-xs text-rose-600 font-medium cursor-pointer">
              Disconnect & Clear
            </button>
          ) : <div />}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer">Close</button>
            <button type="button" disabled={isVerifying || !inputVal.trim()} onClick={() => { void handleVerify(); }} className="px-4 py-1.5 text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white rounded-lg disabled:opacity-50 cursor-pointer">
              {isVerifying ? 'Verifying...' : 'Verify & Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
