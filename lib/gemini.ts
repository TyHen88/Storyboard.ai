import { GoogleGenAI } from '@google/genai';

/**
 * Shared Gemini caller for the API routes with resilience against transient
 * failures: retries with exponential backoff on overload (503/429/500) and
 * falls back to an alternate model when the primary stays unavailable.
 */

const MODELS = ['gemini-3.5-flash', 'gemini-2.5-flash'];
const ATTEMPTS_PER_MODEL = 2;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const statusOf = (error: any): number | undefined =>
  error?.status ?? error?.error?.code ?? error?.code;

const isRetryable = (error: any) => {
  const s = statusOf(error);
  return s === 503 || s === 429 || s === 500;
};

export async function geminiGenerate(parts: any[], schema: object): Promise<any> {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let lastError: any;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: { parts },
          config: {
            responseMimeType: 'application/json',
            responseSchema: schema,
          },
        });
        if (!response.text) throw new Error('No response text from Gemini');
        return JSON.parse(response.text);
      } catch (error: any) {
        lastError = error;
        if (!isRetryable(error)) throw error;
        console.warn(`Gemini ${model} attempt ${attempt + 1} failed (${statusOf(error)}), retrying...`);
        await sleep(800 * (attempt + 1) + Math.random() * 400);
      }
    }
  }
  throw lastError;
}

/** Map a Gemini error to a user-facing message + HTTP status. */
export function friendlyGeminiError(error: any): { message: string; status: number } {
  const s = statusOf(error);
  if (s === 503 || s === 429) {
    return {
      status: 503,
      message: 'The AI model is overloaded right now. Please wait a few seconds and try again.',
    };
  }
  if (s === 400 || s === 401 || s === 403) {
    return {
      status: 500,
      message: 'AI request was rejected — check that GEMINI_API_KEY is set correctly.',
    };
  }
  return { status: 500, message: error?.message || 'AI request failed. Please try again.' };
}
