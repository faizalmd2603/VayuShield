import React, { useState, useRef, useEffect } from 'react';
import { useGeminiChat } from '../../hooks/useGeminiChat';
import type { CombinedAirTelemetry } from '../../types/airQuality';
import type { ChatMessage, GeminiModelName } from '../../types/gemini';
import type { LifestyleProfile } from '../../types/profile';
import { SafeMarkdown } from '../common/SafeMarkdown';
import { AlertIcon, SparklesIcon } from '../icons/Icons';

interface Props {
  readonly apiKey: string;
  readonly telemetry: CombinedAirTelemetry;
  readonly profile: LifestyleProfile;
  readonly selectedModel: GeminiModelName;
}

const ChatBubble: React.FC<{ readonly msg: ChatMessage }> = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl p-3.5 ${
          isUser
            ? 'bg-sky-600 text-white rounded-br-xs'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
        }`}
      >
        <SafeMarkdown content={msg.content} />
      </div>
      <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
    </div>
  );
};

const EmptyChatPrompt: React.FC<{
  readonly locationName: string;
  readonly chips: readonly string[];
  readonly onSelectChip: (text: string) => void;
}> = ({ locationName, chips, onSelectChip }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-500">
    <SparklesIcon className="w-8 h-8 text-sky-400 opacity-60" />
    <p className="text-xs max-w-sm">Ask any question grounded in live {locationName} AQI.</p>
    <div className="flex flex-wrap justify-center gap-1.5 max-w-md pt-2">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => { onSelectChip(chip); }}
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs text-left transition-colors cursor-pointer"
        >
          {chip}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Real-time SSE streaming Smog Copilot with multi-turn context memory.
 */
export const SmogCopilotChat: React.FC<Props> = ({
  apiKey,
  telemetry,
  profile,
  selectedModel,
}) => {
  const [inputVal, setInputVal] = useState('');
  const { messages, streamingChunk, isStreaming, error, sendMessage, clearChat } =
    useGeminiChat(apiKey, selectedModel);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingChunk]);

  const handleSend = (text: string): void => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    setInputVal('');
    void sendMessage(trimmed, telemetry, profile);
  };

  const dynamicChips = [
    `Can children exercise outdoors in ${telemetry.location.name} right now?`,
    `How does the current ${telemetry.smogTrap.riskLevel} smog trap affect commutes?`,
    `Our RWA has GRAP ${telemetry.grapStage} active. What protocols must we enforce?`,
  ];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col h-[580px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-sky-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Streaming Smog Copilot</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
            {selectedModel}
          </span>
        </div>
        {messages.length > 0 && (
          <button type="button" onClick={() => { clearChat(); }} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
            Clear History
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-sm">
        {messages.length === 0 && !streamingChunk && (
          <EmptyChatPrompt locationName={telemetry.location.name} chips={dynamicChips} onSelectChip={handleSend} />
        )}
        {messages.map((msg) => <ChatBubble key={msg.id} msg={msg} />)}
        {streamingChunk && (
          <div className="flex flex-col items-start">
            <div className="max-w-[85%] rounded-2xl p-3.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs">
              <SafeMarkdown content={streamingChunk} />
            </div>
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 text-xs flex items-center gap-2">
            <AlertIcon className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(inputVal); }}
        className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800"
      >
        <input
          type="text" value={inputVal} onChange={(e) => { setInputVal(e.target.value); }}
          placeholder="Ask Smog Copilot about routines, CADR, school commutes, RWA protocols..."
          disabled={isStreaming}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
        />
        <button
          type="submit" disabled={isStreaming || !inputVal.trim()}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm cursor-pointer shrink-0"
        >
          {isStreaming ? 'Streaming...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
