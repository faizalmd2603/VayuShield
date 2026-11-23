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
        className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
          isUser
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-black rounded-br-xs font-sans font-medium'
            : 'bg-white dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-xs'
        }`}
      >
        <SafeMarkdown content={msg.content} />
      </div>
      <span className="text-[10px] font-mono text-neutral-400 mt-1 px-1">{msg.timestamp}</span>
    </div>
  );
};

const EmptyChatPrompt: React.FC<{
  readonly locationName: string;
  readonly chips: readonly string[];
  readonly onSelectChip: (text: string) => void;
}> = ({ locationName, chips, onSelectChip }) => (
  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-neutral-500">
    <div className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-800 flex items-center justify-center text-[#00FFC2]">
      <SparklesIcon className="w-5 h-5" />
    </div>
    <div className="space-y-1">
      <p className="text-xs font-mono uppercase tracking-widest text-neutral-400">
        [ LIVE CONVERSATIONAL GROUNDING ]
      </p>
      <p className="text-xs max-w-sm font-sans text-neutral-600 dark:text-neutral-400">
        Ask any question grounded in live {locationName} telemetry and household profile.
      </p>
    </div>
    <div className="flex flex-wrap justify-center gap-2 max-w-md pt-1">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => {
            onSelectChip(chip);
          }}
          className="px-3.5 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs text-left transition-colors cursor-pointer"
        >
          {chip}
        </button>
      ))}
    </div>
  </div>
);

const CopilotStreamingBanner: React.FC<{ readonly onStop: () => void }> = ({ onStop }) => (
  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#00FFC2]/10 border border-[#00FFC2]/30 text-[#00FFC2] text-xs font-mono">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[#00FFC2] animate-ping" />
      <span>Synthesizing live atmospheric telemetry &amp; copilot stream...</span>
    </div>
    <button
      type="button"
      onClick={onStop}
      className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 hover:text-white cursor-pointer underline"
    >
      Cancel
    </button>
  </div>
);

const CopilotErrorBanner: React.FC<{
  readonly error: string;
  readonly lastPrompt?: string;
  readonly onRetry?: () => void;
}> = ({ error, lastPrompt, onRetry }) => (
  <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 text-xs font-mono flex items-center justify-between gap-2">
    <div className="flex items-center gap-2">
      <AlertIcon className="w-4 h-4 shrink-0" />
      <span>{error}</span>
    </div>
    {lastPrompt && onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="px-3 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-mono text-[10px] uppercase tracking-wider cursor-pointer transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

const CopilotInputForm: React.FC<{
  readonly inputVal: string;
  readonly isStreaming: boolean;
  readonly onChangeInput: (val: string) => void;
  readonly onSubmit: (e: React.SyntheticEvent) => void;
  readonly onStop: () => void;
}> = ({ inputVal, isStreaming, onChangeInput, onSubmit, onStop }) => (
  <form
    onSubmit={onSubmit}
    className="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800"
  >
    <input
      type="text"
      value={inputVal}
      onChange={(e) => {
        onChangeInput(e.target.value);
      }}
      placeholder="Ask Smog Copilot about routines, CADR, school commutes, RWA protocols..."
      className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-full border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/60 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-[#00FFC2] cursor-text"
    />
    {isStreaming ? (
      <button
        type="button"
        onClick={onStop}
        className="flex items-center gap-1.5 px-4 py-3 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 dark:text-rose-400 border border-rose-500/30 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer shrink-0 transition-colors"
        title="Stop response generation"
      >
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
        <span>Stop</span>
      </button>
    ) : (
      <button
        type="submit"
        disabled={!inputVal.trim()}
        className="px-5 py-3 rounded-full bg-[#00FFC2] hover:bg-[#00e6ae] disabled:opacity-40 text-black font-mono font-bold text-xs uppercase tracking-wider cursor-pointer shrink-0 transition-all shadow-md shadow-[#00FFC2]/20"
      >
        Send
      </button>
    )}
  </form>
);

/**
 * Real-time SSE streaming Smog Copilot with multi-turn context memory in NK Studio aesthetic.
 */
export const SmogCopilotChat: React.FC<Props> = ({ apiKey, telemetry, profile, selectedModel }) => {
  const [inputVal, setInputVal] = useState('');
  const {
    messages,
    streamingChunk,
    isStreaming,
    error,
    lastPrompt,
    sendMessage,
    stopStreaming,
    clearChat,
  } = useGeminiChat(apiKey, selectedModel);

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
    <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4 flex flex-col h-[580px] backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2.5">
          <SparklesIcon className="w-4 h-4 text-[#00FFC2]" />
          <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-neutral-950 dark:text-white">
            Streaming Smog Copilot
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
            {selectedModel}
          </span>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearChat();
            }}
            className="text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white cursor-pointer"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-sm">
        {messages.length === 0 && !streamingChunk && (
          <EmptyChatPrompt
            locationName={telemetry.location.name}
            chips={dynamicChips}
            onSelectChip={handleSend}
          />
        )}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} />
        ))}
        {streamingChunk && (
          <div className="flex flex-col items-start">
            <div className="max-w-[85%] rounded-2xl p-4 bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-xs text-xs sm:text-sm">
              <SafeMarkdown content={streamingChunk} />
            </div>
          </div>
        )}
        {error && (
          <CopilotErrorBanner
            error={error}
            lastPrompt={lastPrompt}
            onRetry={() => {
              void sendMessage(lastPrompt, telemetry, profile);
            }}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {isStreaming && <CopilotStreamingBanner onStop={stopStreaming} />}

      <CopilotInputForm
        inputVal={inputVal}
        isStreaming={isStreaming}
        onChangeInput={setInputVal}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputVal);
        }}
        onStop={stopStreaming}
      />
    </div>
  );
};
