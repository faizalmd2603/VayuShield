import { useState, useCallback, useRef } from 'react';
import { streamGeminiChat } from '../services/geminiService';
import type { CombinedAirTelemetry } from '../types/airQuality';
import { GeminiApiError } from '../types/errors';
import type { ChatMessage, GeminiModelName } from '../types/gemini';
import type { LifestyleProfile } from '../types/profile';

export interface UseGeminiChatResult {
  readonly messages: readonly ChatMessage[];
  readonly streamingChunk: string;
  readonly isStreaming: boolean;
  readonly error: string | null;
  readonly lastPrompt: string;
  readonly sendMessage: (
    userPrompt: string,
    telemetry: CombinedAirTelemetry,
    profile: LifestyleProfile
  ) => Promise<void>;
  readonly stopStreaming: () => void;
  readonly clearChat: () => void;
}

function createChatMessage(role: 'user' | 'model', content: string): ChatMessage {
  return {
    id: `msg-${Date.now()}-${role}`,
    role,
    content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

function resolveErrorMessage(err: unknown): string {
  if (err instanceof GeminiApiError) return err.message;
  return 'Error streaming Copilot response. Please retry.';
}

/**
 * Hook for streaming conversational interaction with VayuShield Smog Copilot.
 */
export function useGeminiChat(
  apiKey: string,
  model?: GeminiModelName
): UseGeminiChatResult {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [streamingChunk, setStreamingChunk] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState('');

  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (
      userPrompt: string,
      telemetry: CombinedAirTelemetry,
      profile: LifestyleProfile
    ): Promise<void> => {
      const trimmed = userPrompt.trim();
      if (!trimmed || !apiKey) return;
      setLastPrompt(trimmed);

      const userMsg = createChatMessage('user', trimmed);
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setStreamingChunk('');
      setIsStreaming(true);
      setError(null);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const fullResponse = await streamGeminiChat({
          apiKey,
          backupApiKey: import.meta.env.VITE_GEMINI_BACKUP_KEY,
          openRouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
          messages: nextMessages,
          telemetry,
          profile,
          model,
          onChunk: (chunk) => {
            setStreamingChunk((prev) => prev + chunk);
          },
          signal: controller.signal,
        });

        const modelMsg = createChatMessage('model', fullResponse);
        setMessages((prev) => [...prev, modelMsg]);
        setStreamingChunk('');
      } catch (err: unknown) {
        if (!controller.signal.aborted) {
          setError(resolveErrorMessage(err));
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [apiKey, messages, model]
  );

  const clearChat = useCallback((): void => {
    setMessages([]);
    setStreamingChunk('');
    setError(null);
  }, []);

  const stopStreaming = useCallback((): void => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return {
    messages,
    streamingChunk,
    isStreaming,
    error,
    lastPrompt,
    sendMessage,
    stopStreaming,
    clearChat,
  };
}
