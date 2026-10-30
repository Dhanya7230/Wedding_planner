import { useState } from 'react';
import {
  Sparkles,
  Palette,
  Clock,
  DollarSign,
  PlusCircle,
  Check,
  Bookmark,
} from 'lucide-react';
import type { AiActionItem, AiSuggestionResponse } from '../../types';
import { sanitizeHtml } from '../../utils/sanitizer';
import { formatCurrency } from '../../utils/budgetCalculations';

interface AiSuggestionCardProps {
  suggestion: AiSuggestionResponse;
  onApplyAction: (action: AiActionItem) => void;
  onSaveIdea: (suggestion: AiSuggestionResponse) => void;
}

export const AiSuggestionCard: React.FC<AiSuggestionCardProps> = ({
  suggestion,
  onApplyAction,
  onSaveIdea,
}) => {
  const [appliedActionIds, setAppliedActionIds] = useState<Set<string>>(new Set());
  const [isSaved, setIsSaved] = useState(false);

  const handleApply = (action: AiActionItem) => {
    onApplyAction(action);
    setAppliedActionIds((prev) => new Set(prev).add(action.id));
  };

  const handleSave = () => {
    onSaveIdea(suggestion);
    setIsSaved(true);
  };

  // Securely sanitize text to guarantee zero XSS execution
  const sanitizedSummary = sanitizeHtml(suggestion.summary);
  const sanitizedThemeDetails = sanitizeHtml(suggestion.themeDetails);

  return (
    <article
      data-testid="ai-suggestion-card"
      className="p-6 sm:p-8 bg-white rounded-2xl border border-brand-200/80 shadow-lg shadow-brand-500/5 space-y-8 animate-slide-up"
    >
      {/* Header: Title, Executive Summary, Save button */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Event Concept</span>
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-2">
            {suggestion.conceptTitle}
          </h3>
          <div
            className="text-sm text-slate-600 mt-2 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaved}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            isSaved
              ? 'bg-emerald-100 text-emerald-800 cursor-default'
              : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
          }`}
        >
          {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          <span>{isSaved ? 'Saved to Plan' : 'Bookmark Concept'}</span>
        </button>
      </div>

      {/* Color Palette Swatches */}
      {suggestion.palette && suggestion.palette.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <Palette className="w-4 h-4 text-brand-500" />
            <span>Curated Color Harmony</span>
          </h4>
          <div className="flex flex-wrap items-center gap-3">
            {suggestion.palette.map((color, index) => (
              <div key={index} className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <div
                  className="w-7 h-7 rounded-lg shadow-inner border border-black/10"
                  style={{ backgroundColor: color }}
                  aria-label={`Color swatch ${color}`}
                />
                <span className="text-xs font-mono font-medium text-slate-700 uppercase pr-1">
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theme & Decor Concept */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Atmospheric Decor & Styling Details
        </h4>
        <div
          className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/60 text-sm text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizedThemeDetails }}
        />
      </div>

      {/* Signature Touches */}
      {suggestion.signatureTouches && suggestion.signatureTouches.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Personalized Signature Touches
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suggestion.signatureTouches.map((touch, i) => (
              <div
                key={i}
                className="flex items-start space-x-3 p-3.5 bg-brand-50/40 rounded-xl border border-brand-100"
              >
                <div className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-snug">{touch}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Schedule Timeline */}
      {suggestion.scheduleSuggestions && suggestion.scheduleSuggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Recommended Event Day Itinerary</span>
          </h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {suggestion.scheduleSuggestions.map((item, idx) => (
              <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center gap-2 hover:bg-slate-50/60">
                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-700 sm:w-28 text-center flex-shrink-0">
                  {item.time}
                </span>
                <div className="flex-1">
                  <h5 className="text-xs font-bold text-slate-800">{item.activity}</h5>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Budget Optimization Tips */}
      {suggestion.budgetOptimizationTips && suggestion.budgetOptimizationTips.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Smart Budget Optimization Strategies</span>
          </h4>
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
            {suggestion.budgetOptimizationTips.map((tip, i) => (
              <div key={i} className="flex items-start space-x-2 text-xs sm:text-sm text-emerald-900">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Additions: 1-Click Apply to Event Plan */}
      {suggestion.actionableAdditions && suggestion.actionableAdditions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Directly Actionable Additions
            </h4>
            <span className="text-[11px] text-slate-400">
              Apply suggestions directly to your live plan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestion.actionableAdditions.map((action) => {
              const isApplied = appliedActionIds.has(action.id);
              return (
                <div
                  key={action.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {action.type === 'budget'
                          ? 'Add to Budget'
                          : action.type === 'timeline'
                          ? 'Add to Timeline'
                          : 'Add to Vendors'}
                      </span>
                      {action.estimatedCost && (
                        <span className="text-xs font-bold text-slate-800">
                          {formatCurrency(action.estimatedCost)}
                        </span>
                      )}
                    </div>
                    <h5 className="text-xs font-bold text-slate-900">{action.title}</h5>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {action.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApply(action)}
                    disabled={isApplied}
                    className={`w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isApplied
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-white border border-slate-300 text-slate-700 hover:border-brand-500 hover:text-brand-600 shadow-sm'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Added to Plan!</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add to My {action.type}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
};
