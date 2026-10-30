import { useState } from 'react';
import { Sparkles, Wand2, RefreshCw } from 'lucide-react';
import { aiPromptSchema, type AiPromptFormData } from '../../schemas/validation';
import type { EventType } from '../../types';

interface GenAiPromptFormProps {
  initialValues: {
    eventType: EventType;
    theme: string;
    guestCount: number;
    budget: number;
    vibe: string;
    location: string;
    specialRequirements?: string;
  };
  isLoading: boolean;
  onSubmit: (data: AiPromptFormData) => void;
}

export const GenAiPromptForm: React.FC<GenAiPromptFormProps> = ({
  initialValues,
  isLoading,
  onSubmit,
}) => {
  const [theme, setTheme] = useState(initialValues.theme || '');
  const [guestCount, setGuestCount] = useState<number | string>(initialValues.guestCount || 50);
  const [budget, setBudget] = useState<number | string>(initialValues.budget || 5000);
  const [vibe, setVibe] = useState(initialValues.vibe || '');
  const [location, setLocation] = useState(initialValues.location || '');
  const [specialRequirements, setSpecialRequirements] = useState(initialValues.specialRequirements || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prevValues, setPrevValues] = useState(initialValues);

  if (
    prevValues.eventType !== initialValues.eventType ||
    prevValues.theme !== initialValues.theme ||
    prevValues.guestCount !== initialValues.guestCount ||
    prevValues.budget !== initialValues.budget ||
    prevValues.vibe !== initialValues.vibe ||
    prevValues.location !== initialValues.location ||
    prevValues.specialRequirements !== initialValues.specialRequirements
  ) {
    setPrevValues(initialValues);
    setTheme(initialValues.theme || '');
    setGuestCount(initialValues.guestCount || 50);
    setBudget(initialValues.budget || 5000);
    setVibe(initialValues.vibe || '');
    setLocation(initialValues.location || '');
    setSpecialRequirements(initialValues.specialRequirements || '');
  }

  // Curated inspiration presets based on event type
  const presets: Record<EventType, { label: string; theme: string; vibe: string }[]> = {
    wedding: [
      {
        label: 'Romantic Botanical Garden',
        theme: 'Enchanted Glasshouse Florals',
        vibe: 'Warm candlelight, cascading roses, acoustic string quartet, and champagne towers',
      },
      {
        label: 'Modern Industrial Chic',
        theme: 'Urban Loft Minimalism',
        vibe: 'Exposed brick, monochrome greenery, modern jazz trio, and craft mixology bar',
      },
      {
        label: 'Coastal Sunset Bohemian',
        theme: 'Mediterranean Seaside Romance',
        vibe: 'Barefoot luxury, driftwoods, linen drapery, sunset toasts, and seafood paella',
      },
    ],
    birthday: [
      {
        label: 'Retro 80s Neon Sunset',
        theme: 'Electric Vaporwave Rooftop',
        vibe: 'Neon signage, disco house DJ, 360 slow-mo video booth, and retro cocktail shooters',
      },
      {
        label: 'Great Gatsby Speakeasy',
        theme: 'Roaring 1920s Art Deco',
        vibe: 'Feather centerpieces, jazz swing band, champagne towers, and secret password entry',
      },
      {
        label: 'Boho Sunset Picnic',
        theme: 'Low-Table Moroccan Lounge',
        vibe: 'Plush floor cushions, fairy lights, acoustic guitar, and artisan charcuterie boards',
      },
    ],
    community: [
      {
        label: 'Sustainable Harvest Fair',
        theme: 'Zero-Waste Community Harvest',
        vibe: 'Local farmer produce, live folk bands, kids craft village, and compost education',
      },
      {
        label: 'Cultural Arts & Food Fest',
        theme: 'Neighborhood World Heritage',
        vibe: 'Multicultural food trucks, street mural painting, interactive dance workshops',
      },
      {
        label: 'Starlight Outdoor Cinema',
        theme: 'Movies Under the Stars',
        vibe: 'Giant inflatable projector, gourmet popcorn bar, community blanket seating',
      },
    ],
  };

  const applyPreset = (preset: { theme: string; vibe: string }) => {
    setTheme(preset.theme);
    setVibe(preset.vibe);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      eventType: initialValues.eventType,
      theme,
      guestCount: Number(guestCount) || 0,
      budget: Number(budget) || 0,
      vibe,
      location,
      specialRequirements,
    };

    const validation = aiPromptSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    onSubmit(validation.data);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <span>AI Event Ideation Engine</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Craft customized themes, personalized signature touches, and timeline activities using generative AI.
          </p>
        </div>

        {/* Live Loading Announcement Region */}
        <div aria-live="polite" className="text-xs font-medium text-brand-600">
          {isLoading && (
            <span className="flex items-center space-x-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Synthesizing creative concepts...</span>
            </span>
          )}
        </div>
      </div>

      {/* Preset Inspirations */}
      <div>
        <span className="text-xs font-semibold text-slate-500 block mb-2">
          Quick Inspiration Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets[initialValues.eventType].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl border border-brand-200/60 font-medium transition-colors disabled:opacity-50"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Theme / Concept */}
        <div>
          <label htmlFor="ai-theme" className="block text-xs font-semibold text-slate-700 mb-1">
            Event Concept / Working Theme <span className="text-rose-500">*</span>
          </label>
          <input
            id="ai-theme"
            data-testid="ai-theme-input"
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            disabled={isLoading}
            placeholder="e.g., Midnight Masquerade, Solar Garden Party, Retro Vaporwave"
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
              errors.theme ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
            } focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100`}
            required
          />
          {errors.theme && <p className="text-xs text-rose-600 mt-1">{errors.theme}</p>}
        </div>

        {/* Guest Count & Budget (2 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ai-guests" className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Guest Count <span className="text-rose-500">*</span>
            </label>
            <input
              id="ai-guests"
              data-testid="ai-guests-input"
              type="number"
              min="1"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              disabled={isLoading}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                errors.guestCount ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100`}
              required
            />
            {errors.guestCount && <p className="text-xs text-rose-600 mt-1">{errors.guestCount}</p>}
          </div>

          <div>
            <label htmlFor="ai-budget" className="block text-xs font-semibold text-slate-700 mb-1">
              Estimated Budget Target ($) <span className="text-rose-500">*</span>
            </label>
            <input
              id="ai-budget"
              data-testid="ai-budget-input"
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              disabled={isLoading}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                errors.budget ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100`}
              required
            />
            {errors.budget && <p className="text-xs text-rose-600 mt-1">{errors.budget}</p>}
          </div>
        </div>

        {/* Location & Desired Vibe */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ai-location" className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Venue Setting <span className="text-rose-500">*</span>
            </label>
            <input
              id="ai-location"
              data-testid="ai-location-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
              placeholder="e.g., Austin botanical conservatory, Chicago rooftop, Public park"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                errors.location ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100`}
              required
            />
            {errors.location && <p className="text-xs text-rose-600 mt-1">{errors.location}</p>}
          </div>

          <div>
            <label htmlFor="ai-vibe" className="block text-xs font-semibold text-slate-700 mb-1">
              Desired Atmosphere / Vibe <span className="text-rose-500">*</span>
            </label>
            <input
              id="ai-vibe"
              data-testid="ai-vibe-input"
              type="text"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              disabled={isLoading}
              placeholder="e.g., Warm & intimate, high-energy party, eco-friendly family fun"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                errors.vibe ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100`}
              required
            />
            {errors.vibe && <p className="text-xs text-rose-600 mt-1">{errors.vibe}</p>}
          </div>
        </div>

        {/* Special Requirements */}
        <div>
          <label htmlFor="ai-requirements" className="block text-xs font-semibold text-slate-700 mb-1">
            Special Notes / Dietary / Constraints (Optional)
          </label>
          <textarea
            id="ai-requirements"
            data-testid="ai-requirements-input"
            rows={2}
            value={specialRequirements}
            onChange={(e) => setSpecialRequirements(e.target.value)}
            disabled={isLoading}
            placeholder="e.g., Allergen friendly, strict 10 PM sound curfew, dog friendly, zero plastic"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none disabled:bg-slate-100"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            data-testid="generate-ideas-btn"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 via-brand-500 to-rose-500 hover:from-brand-700 hover:to-rose-600 shadow-md shadow-brand-500/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Personalized Ideas...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Event Concept & Ideas</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
