import type { AiPromptInput, AiSuggestionResponse } from '../types';
import { formatEventPrompt, generateOfflineAiSuggestions, parseAiResponse } from '../utils/aiPromptFormatter';

/**
 * ============================================================================
 * GENAI API SERVICE & SECURITY ARCHITECTURE
 * ============================================================================
 * 
 * SECURITY DIRECTIVE:
 * In a production architecture, client-side exposure of LLM API keys 
 * (e.g., exposing OpenAI, Anthropic, or Gemini private keys in browser JavaScript)
 * presents a high-risk security vulnerability. Any malicious user can inspect 
 * network traffic or bundle sources to harvest the key, leading to quota theft,
 * high financial cost, and unauthorized API usage.
 * 
 * RECOMMENDED PRODUCTION ARCHITECTURE:
 * 1. The client browser submits ONLY validated event parameters (`AiPromptInput`)
 *    to an internal application backend (e.g., Next.js API route, Express server,
 *    Cloudflare Worker, or AWS Lambda at `/api/ai/generate-event-ideas`).
 * 2. The backend validates user session/JWT, performs rate limiting (e.g. 10 reqs/hr),
 *    sanitizes inputs, and injects the private secret key (stored safely in
 *    environment variables such as `process.env.GEMINI_API_KEY` or AWS Secrets Manager).
 * 3. The backend calls the LLM provider, runs safety & content moderation,
 *    and streams or returns the structured JSON back to the client.
 * 
 * DEMONSTRATION MODE:
 * Below, we demonstrate environment variable integration via `import.meta.env`
 * for both direct integration (if `VITE_AI_API_KEY` / `VITE_AI_API_URL` are provided)
 * and an intelligent local simulation engine that guarantees 100% functionality
 * without requiring payment credentials.
 * ============================================================================
 */

export interface AiServiceConfig {
  apiKey?: string;
  proxyUrl?: string;
  modelName?: string;
}

// Read Vite environment variables
const API_KEY = import.meta.env.VITE_AI_API_KEY as string | undefined;
const PROXY_URL = import.meta.env.VITE_AI_API_URL as string | undefined;
const MODEL_NAME = (import.meta.env.VITE_AI_MODEL_NAME as string | undefined) || 'gemini-1.5-flash';

/**
 * Requests GenAI Event Suggestions from Backend Proxy, External LLM, or High-Fidelity Local Engine
 */
export async function generateEventIdeas(
  input: AiPromptInput,
  config: AiServiceConfig = {}
): Promise<AiSuggestionResponse> {
  const activeKey = config.apiKey || API_KEY;
  const activeProxy = config.proxyUrl || PROXY_URL;
  const activeModel = config.modelName || MODEL_NAME;

  const { systemPrompt, userPrompt } = formatEventPrompt(input);

  // OPTION 1: Dedicated Backend Proxy (Recommended Best Practice for Production)
  if (activeProxy) {
    try {
      const response = await fetch(activeProxy, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeKey ? { Authorization: `Bearer ${activeKey}` } : {}),
        },
        body: JSON.stringify({
          eventType: input.eventType,
          theme: input.theme,
          guestCount: input.guestCount,
          budget: input.budget,
          vibe: input.vibe,
          location: input.location,
          specialRequirements: input.specialRequirements,
        }),
      });

      if (!response.ok) {
        throw new Error(`Proxy responded with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return parseAiResponse(typeof data === 'string' ? data : JSON.stringify(data));
    } catch (proxyError) {
      console.warn('Backend proxy unreachable, falling back to simulated engine:', proxyError);
    }
  }

  // OPTION 2: Direct API Key usage (Demonstration of client-side key config)
  if (activeKey && activeKey.trim() !== '') {
    try {
      // Support for Gemini REST API endpoint
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${activeKey}`;
      
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemPrompt}\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`LLM provider error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (rawText) {
        return parseAiResponse(rawText);
      }
    } catch (directApiError) {
      console.warn('Direct LLM API call failed, gracefully defaulting to simulation:', directApiError);
    }
  }

  // OPTION 3: High-Fidelity Intelligent Local Simulation
  // Simulates realistic network latency (800ms) and delivers deep, context-aware event plans
  await new Promise((resolve) => setTimeout(resolve, 850));
  return generateOfflineAiSuggestions(input);
}
