/// <reference types="vite/client" />
import 'vitest';

declare global {
  interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

declare module 'vitest' {
  interface Assertion<_T = unknown> {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
