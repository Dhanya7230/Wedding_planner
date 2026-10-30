import { useState, useCallback } from 'react';
import {
  Shield,
  Lightbulb,
  History,
  Info,
} from 'lucide-react';
import { useEventPlan } from '../../context/useEventPlan';
import type { AiPromptFormData } from '../../schemas/validation';
import type { AiSuggestionResponse } from '../../types';
import { generateEventIdeas } from '../../services/aiService';
import { GenAiPromptForm } from './GenAiPromptForm';
import { AiSuggestionCard } from './AiSuggestionCard';

export const GenAiAssistant: React.FC = () => {
  const { plan, applyAiActionItem, saveAiIdea } = useEventPlan();
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<AiSuggestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(
    async (formData: AiPromptFormData) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await generateEventIdeas({
          eventType: formData.eventType,
          theme: formData.theme,
          guestCount: formData.guestCount,
          budget: formData.budget,
          vibe: formData.vibe,
          location: formData.location,
          specialRequirements: formData.specialRequirements,
        });

        setCurrentSuggestion(response);
      } catch (err: unknown) {
        console.error('Error generating event concepts:', err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Unable to generate event concept. Please verify network and try again.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <section aria-labelledby="genai-heading" className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h2
          id="genai-heading"
          className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight"
        >
          GenAI Creative Concept Studio
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tailored event themes, color schemes, personalized touches, and day-of itineraries powered by intelligent LLM recommendations.
        </p>
      </div>

      {/* Production Security Architecture Callout Note */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs text-slate-600 flex items-start space-x-3">
        <Shield className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-800">
            Enterprise Security Notice:
          </span>
          <p>
            Client-side API keys are strictly configured via Vite environment variables (
            <code className="text-indigo-600 bg-slate-200/60 px-1 py-0.5 rounded">
              VITE_AI_API_KEY
            </code>
            ) or an authorized proxy (
            <code className="text-indigo-600 bg-slate-200/60 px-1 py-0.5 rounded">
              VITE_AI_API_URL
            </code>
            ). In production, requests should route through your authenticated backend proxy
            (e.g., <code className="text-indigo-600 font-mono">/api/generate-ideas</code>) with rate limiting
            to safeguard secrets against client extraction.
          </p>
        </div>
      </div>

      {/* Error alert if any */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2"
        >
          <Info className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Prompt Form */}
      <GenAiPromptForm
        initialValues={{
          eventType: plan.eventType,
          theme: plan.theme,
          guestCount: plan.guestCount,
          budget: plan.totalBudget,
          vibe: plan.vibe,
          location: plan.location,
          specialRequirements: plan.notes,
        }}
        isLoading={isLoading}
        onSubmit={handleGenerate}
      />

      {/* Active Generated Suggestion */}
      {currentSuggestion && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-900">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Latest Generated Concept</span>
          </div>
          <AiSuggestionCard
            suggestion={currentSuggestion}
            onApplyAction={applyAiActionItem}
            onSaveIdea={saveAiIdea}
          />
        </div>
      )}

      {/* Saved Concept History */}
      {plan.savedAiIdeas.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <History className="w-5 h-5 text-slate-400" />
            <span>Saved Concept Bookmarks ({plan.savedAiIdeas.length})</span>
          </h3>

          <div className="space-y-6">
            {plan.savedAiIdeas.map((saved, idx) => (
              <AiSuggestionCard
                key={idx}
                suggestion={saved}
                onApplyAction={applyAiActionItem}
                onSaveIdea={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
export default GenAiAssistant;
