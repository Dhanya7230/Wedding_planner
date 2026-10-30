import type { AiPromptInput, AiSuggestionResponse } from '../types';

/**
 * Pure functions for GenAI Prompt Formatting and Response Parsing
 * Cleanly decouples prompt generation and structure verification for easy unit testing.
 */

/**
 * Formats user event planning parameters into an optimized system/user prompt for LLM
 */
export function formatEventPrompt(input: AiPromptInput): {
  systemPrompt: string;
  userPrompt: string;
} {
  const systemPrompt = `You are an elite, world-class event planner and creative director specializing in luxury weddings, milestone birthdays, and vibrant community festivals.
Your goal is to provide deeply tailored, creative, practical, and budget-conscious event concepts.
You must always output your response in strict JSON format following this exact schema:
{
  "summary": "Brief executive vision statement (2-3 sentences)",
  "conceptTitle": "Catchy concept title",
  "palette": ["#Hex1", "#Hex2", "#Hex3", "#Hex4"],
  "themeDetails": "Detailed decor, floral, and atmospheric concept description",
  "signatureTouches": ["Personalized idea 1", "Personalized idea 2", "Personalized idea 3", "Personalized idea 4"],
  "scheduleSuggestions": [
    { "time": "e.g., 04:00 PM", "activity": "Activity Name", "description": "Brief description" }
  ],
  "budgetOptimizationTips": ["Smart cost-saving tip 1", "High-impact budget allocation tip 2"],
  "actionableAdditions": [
    {
      "id": "item-1",
      "title": "Action title",
      "type": "timeline" | "budget" | "vendor",
      "description": "Specific detail",
      "estimatedCost": 500,
      "category": "Decor & Florals"
    }
  ]
}`;

  const userPrompt = `Please design an unforgettable concept for the following event:
- Event Type: ${input.eventType.toUpperCase()}
- Concept/Theme: ${input.theme}
- Estimated Guest Count: ${input.guestCount} guests
- Total Budget: $${input.budget.toLocaleString()}
- Desired Vibe/Atmosphere: ${input.vibe}
- Location / Setting: ${input.location}
- Special Notes/Constraints: ${input.specialRequirements || 'None specified'}`;

  return { systemPrompt, userPrompt };
}

/**
 * Safely parses and validates the LLM JSON response or markdown-wrapped JSON
 */
export function parseAiResponse(rawContent: string): AiSuggestionResponse {
  try {
    // Strip markdown code block fences if present (e.g. ```json ... ```)
    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleaned);

    return {
      summary: parsed.summary || 'Custom event vision created for your special celebration.',
      conceptTitle: parsed.conceptTitle || 'Bespoke Celebration Concept',
      palette: Array.isArray(parsed.palette) ? parsed.palette : ['#d94c7f', '#ebdcbf', '#6d4c31', '#f5eee3'],
      themeDetails: parsed.themeDetails || 'An exquisite curation tailored to your guest count and aesthetic preferences.',
      signatureTouches: Array.isArray(parsed.signatureTouches) ? parsed.signatureTouches : [],
      scheduleSuggestions: Array.isArray(parsed.scheduleSuggestions) ? parsed.scheduleSuggestions : [],
      budgetOptimizationTips: Array.isArray(parsed.budgetOptimizationTips) ? parsed.budgetOptimizationTips : [],
      actionableAdditions: Array.isArray(parsed.actionableAdditions) ? parsed.actionableAdditions : [],
      rawMarkdown: rawContent,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    // Fallback if model output isn't raw JSON
    return {
      summary: 'Custom creative recommendations generated based on your inputs.',
      conceptTitle: 'Tailored Event Inspiration',
      palette: ['#d94c7f', '#ebdcbf', '#6d4c31', '#f5eee3'],
      themeDetails: rawContent,
      signatureTouches: [
        'Welcome mocktail/cocktail hour personalized to your hosts',
        'Custom interactive photo installation for lasting memories',
        'Ambient acoustic accompaniment transition to upbeat evening sets'
      ],
      scheduleSuggestions: [
        { time: '05:00 PM', activity: 'Guest Welcome & Refreshments', description: 'Warm greeting with curated acoustic playlist' },
        { time: '06:30 PM', activity: 'Main Program / Dinner', description: 'Curated dining experience with personalized toasts' },
        { time: '08:30 PM', activity: 'Celebration & Dancing', description: 'High-energy celebration and interactive moments' }
      ],
      budgetOptimizationTips: [
        'Prioritize floral focal points where photos are taken rather than decorating every empty corner.',
        'Bundle photography and videography under one creative team to negotiate package discounts.'
      ],
      actionableAdditions: [
        {
          id: `ai-gen-${Date.now()}-1`,
          title: 'Custom Photo Backdrop Installation',
          type: 'budget',
          description: 'Custom photo station matching the theme palette',
          estimatedCost: 450,
          category: 'Decor & Florals'
        },
        {
          id: `ai-gen-${Date.now()}-2`,
          title: 'Finalize Signature Welcome Drinks',
          type: 'timeline',
          description: 'Coordinate with catering team on two personalized signature drinks',
          dueDateOffsetDays: 14
        }
      ],
      rawMarkdown: rawContent,
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Intelligent Mock GenAI Engine
 * Generates context-aware, rich suggestions when no API key is configured.
 */
export function generateOfflineAiSuggestions(input: AiPromptInput): AiSuggestionResponse {
  const isWedding = input.eventType === 'wedding';
  const isBirthday = input.eventType === 'birthday';

  if (isWedding) {
    return {
      summary: `An enchanting ${input.vibe.toLowerCase()} wedding celebration in ${input.location} designed for ${input.guestCount} guests with an intentional balance of romance, elegance, and memory-making.`,
      conceptTitle: `Celestial Garden Romance: "${input.theme}"`,
      palette: ['#d94c7f', '#f7d2e0', '#dfc699', '#460c20'],
      themeDetails: `Embrace a modern romantic aesthetic with cascading ivory florals, warm amber candlelight, and textural brushed-gold accents. The layout incorporates intimate lounge vignettes for ${input.guestCount} guests alongside a focal floral arch framing the ceremony and sweetheart table.`,
      signatureTouches: [
        `"His & Hers" signature craft cocktails inspired by your journey: "Blushing Prosecco Spritz" & "Smoky Bourbon Old Fashioned".`,
        'Audio Guestbook using a vintage rotary phone where loved ones leave voice recorded toasts and blessings.',
        'Custom handwritten wax-sealed thank-you notes waiting at each guest place setting.',
        'Midnight gourmet snack surprise: Miniature artisanal sliders and warm churro bites passed on the dance floor.',
      ],
      scheduleSuggestions: [
        { time: '04:00 PM', activity: 'Ceremony Begins', description: 'Live string quartet plays acoustic renditions of indie classics' },
        { time: '04:45 PM', activity: 'Champagne & Cocktails', description: 'Passed hors d’oeuvres with interactive oyster shucking' },
        { time: '06:15 PM', activity: 'Grand Entrance & First Dance', description: 'Low-fog cloud effect across the polished floor' },
        { time: '07:00 PM', activity: 'Plated Dinner & Speeches', description: 'Curated 3-course menu with synchronized table service' },
        { time: '08:45 PM', activity: 'Dance Floor Opens & Cake Cut', description: 'Live brass section joins the DJ to elevate the dance energy' },
        { time: '11:00 PM', activity: 'Sparkler Farewell Tunnel', description: 'Guests line the stone pathway with smokeless sparklers' },
      ],
      budgetOptimizationTips: [
        `Repurpose ceremony aisle arrangements as head table centerpieces during cocktail hour to save up to $800.`,
        `Choose seasonal local blooms (ranunculus, garden roses, and greenery) instead of imported peonies to stretch your floral budget by 30%.`,
        `Digital RSVP portal paired with luxury printed save-the-dates cuts paper and postage expenses without sacrificing initial tactile elegance.`,
      ],
      actionableAdditions: [
        {
          id: `ai-wedding-${Date.now()}-1`,
          title: 'Rent Vintage Audio Guestbook',
          type: 'vendor',
          description: 'Book rotary phone audio guestbook vendor to capture heartfelt guest voice notes',
          estimatedCost: 350,
          category: 'Music & Entertainment'
        },
        {
          id: `ai-wedding-${Date.now()}-2`,
          title: 'Repurpose Ceremony Floral Arrangements',
          type: 'timeline',
          description: 'Designate coordinator to relocate altar florals to dinner head table during cocktail hour',
          dueDateOffsetDays: 1
        },
        {
          id: `ai-wedding-${Date.now()}-3`,
          title: 'Late Night Passed Snack Bites',
          type: 'budget',
          description: 'Add mini sliders and churro bites catering tier for late-night dancers',
          estimatedCost: 650,
          category: 'Catering & Bar'
        }
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  if (isBirthday) {
    return {
      summary: `A high-vibe, unforgettable ${input.theme} celebration in ${input.location} for ${input.guestCount} guests, featuring immersive retro-chic decor and vibrant interactive experiences.`,
      conceptTitle: `Electric Starlight: "${input.theme}" Experience`,
      palette: ['#c43365', '#d1ad71', '#1e293b', '#fdf4f7'],
      themeDetails: `A fusion of neon glow accents, velvet textures, and custom personalized photo backdrops designed for effortless social sharing and guest immersion.`,
      signatureTouches: [
        'Glam 360-degree rotating slow-motion video booth with instant AirDrop sharing.',
        'Custom LED neon sign featuring host nickname that doubles as home keepsake after the event.',
        'Interactive dessert wall featuring artisanal macarons, gourmet cake-pops, and espresso martini shooters.',
        'Curated collaborative Spotify playlist where invited guests voted on dance tracks.',
      ],
      scheduleSuggestions: [
        { time: '07:00 PM', activity: 'VIP Red Carpet Arrival', description: 'Step & Repeat photo moment with welcome bubbly' },
        { time: '08:00 PM', activity: 'Interactive Grazing Station', description: 'Gourmet tapas & specialty mixology station' },
        { time: '09:15 PM', activity: 'Celebratory Toast & Cake Cutting', description: 'Showstopper tiered cake with sparkler candles' },
        { time: '09:45 PM', activity: 'Dance Party & DJ Set', description: 'High-energy playlist with laser & light production' },
      ],
      budgetOptimizationTips: [
        'A statement balloon garland and rented LED sign create 90% of the visual impact for a fraction of full-room drapery costs.',
        'Opt for gourmet food stations or heavy appetizers instead of formal seated dining to save $25/head while encouraging mingling.',
      ],
      actionableAdditions: [
        {
          id: `ai-bday-${Date.now()}-1`,
          title: 'Book 360-Video Photo Booth',
          type: 'vendor',
          description: 'Hire 360-degree slow motion video booth vendor with custom overlay graphics',
          estimatedCost: 400,
          category: 'Photography & Video'
        },
        {
          id: `ai-bday-${Date.now()}-2`,
          title: 'Order Custom LED Neon Sign',
          type: 'budget',
          description: 'Personalized neon phrase for backdrop focal point',
          estimatedCost: 220,
          category: 'Decor & Florals'
        }
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  // Community Event
  return {
    summary: `An inspiring, highly organized community gathering in ${input.location} uniting ${input.guestCount} participants with inclusive activities, local talent, and memorable community impact.`,
    conceptTitle: `Unity & Harmony: "${input.theme}" Festival`,
    palette: ['#059669', '#0284c7', '#d97706', '#f8fafc'],
    themeDetails: `Spacious outdoor festival configuration featuring distinct zones: Kids & Family Fun Zone, Artisan Maker Pavilion, Main Stage Performance Area, and Local Food Truck Alley.`,
    signatureTouches: [
      'Interactive Community Art Wall where all attendees contribute a painted brushstroke to a permanent commemorative mural.',
      'Local Maker & Small Business marketplace highlighting neighborhood artisans and non-profits.',
      'Zero-waste hydration stations offering branded reusable cups to eliminate single-use plastics.',
      'Cultural showcase spotlighting neighborhood youth ensembles and heritage performers.',
    ],
    scheduleSuggestions: [
      { time: '10:00 AM', activity: 'Festival Gates & Marketplace Open', description: 'Welcome announcements and artisan pavilion opens' },
      { time: '11:30 AM', activity: 'Community Opening Ceremony', description: 'Local leaders welcome and youth performance' },
      { time: '01:00 PM', activity: 'Chef Demonstrations & Food Tasting', description: 'Local culinary highlights and food truck competition' },
      { time: '03:00 PM', activity: 'Headline Musical Ensemble', description: 'Main stage community concert' },
      { time: '05:00 PM', activity: 'Mural Unveiling & Closing Remarks', description: 'Group photo and volunteer appreciation' },
    ],
    budgetOptimizationTips: [
      'Partner with local businesses for in-kind sponsorship (water stations, printing, PA equipment) in exchange for banner logo visibility.',
      'Establish a volunteer perks program with student groups to save substantially on logistics staffing costs.',
    ],
    actionableAdditions: [
      {
        id: `ai-comm-${Date.now()}-1`,
        title: 'Reserve Park Permit & Sound Waivers',
        type: 'timeline',
        description: 'Submit municipal paperwork and sound amplification licenses to city council',
        dueDateOffsetDays: 45
      },
      {
        id: `ai-comm-${Date.now()}-2`,
        title: 'Community Mural Canvas & Paint Supplies',
        type: 'budget',
        description: 'Heavy duty primed canvas, non-toxic outdoor paints, and brushes for collaborative mural',
        estimatedCost: 350,
        category: 'Decor & Florals'
      }
    ],
    generatedAt: new Date().toISOString(),
  };
}
