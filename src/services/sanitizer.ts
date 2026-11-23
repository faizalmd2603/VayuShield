/**
 * Security and Prompt Input Sanitization Service.
 * Protects against prompt injection attacks, XSS vectors, and oversized inputs.
 */

const SUSPICIOUS_PROMPT_PATTERNS: readonly RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /system\s*:\s*/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /you\s+are\s+now\s+(an|a)\s+unrestricted/i,
  /jailbreak/i,
  /DAN\s+mode/i,
];

/**
 * Strips HTML tags, script elements, and dangerous control characters from user text.
 *
 * @param input Raw untrusted string
 * @returns Cleaned text
 */
export function stripHtmlAndControls(input: string): string {
  // Remove HTML tags
  const noHtml = input.replace(/<[^>]*>/g, '');
  // Remove control characters (except standard newlines and tabs)
  const cleanedChars: string[] = [];
  for (let i = 0; i < noHtml.length; i++) {
    const code = noHtml.charCodeAt(i);
    // 9 = tab, 10 = line feed, 13 = carriage return, >= 32 = standard printable characters
    if (code >= 32 || code === 9 || code === 10 || code === 13) {
      const ch = noHtml[i];
      if (ch) cleanedChars.push(ch);
    }
  }
  return cleanedChars.join('').trim();
}

/**
 * Neutralizes potential prompt injection patterns while preserving semantic meaning.
 *
 * @param input Sanitized text
 * @returns Safe text safe for model context injection
 */
export function neutralizePromptInjection(input: string): string {
  let safe = input;
  for (const pattern of SUSPICIOUS_PROMPT_PATTERNS) {
    if (pattern.test(safe)) {
      safe = safe.replace(pattern, '[sanitized_prompt_marker]');
    }
  }
  return safe;
}

/**
 * Validates, strips, and limits user prompt input for LLM calls.
 *
 * @param input Raw text from user
 * @param maxLength Maximum allowed character count (default 1000)
 * @returns Cleaned and bounded string
 */
export function sanitizeUserInput(input: string, maxLength = 1000): string {
  const stripped = stripHtmlAndControls(input);
  const neutralized = neutralizePromptInjection(stripped);
  return neutralized.slice(0, maxLength).trim();
}
