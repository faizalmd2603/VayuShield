import '@testing-library/jest-dom';
import * as matchers from 'vitest-axe/matchers';
import { expect } from 'vitest';

expect.extend(matchers);

// Provide default fallback environment variables for headless CI / isolated environments
if (typeof process !== 'undefined') {
  process.env.VITE_SERPAPI_KEY = process.env.VITE_SERPAPI_KEY ?? 'mock_ci_serpapi_key';
  process.env.VITE_GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY ?? 'mock_ci_gemini_key';
}

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}
