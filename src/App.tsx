import React, { useState, Suspense, lazy } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  DollarSign,
  Clock,
  Briefcase,
  Wand2,
} from 'lucide-react';
import { EventProvider } from './context/EventContext';
import { useEventPlan } from './context/useEventPlan';
import type { ActiveTab } from './types';
import { Navbar } from './components/common/Navbar';
import { LiveAnnouncer } from './components/common/LiveAnnouncer';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';
import { OverviewDashboard } from './components/overview/OverviewDashboard';

// Code-splitting via React.lazy for bundle size optimization
const BudgetWidget = lazy(() =>
  import('./components/budget/BudgetWidget').then((mod) => ({ default: mod.BudgetWidget }))
);
const TimelineView = lazy(() =>
  import('./components/timeline/TimelineView').then((mod) => ({ default: mod.TimelineView }))
);
const VendorChecklist = lazy(() =>
  import('./components/vendors/VendorChecklist').then((mod) => ({ default: mod.VendorChecklist }))
);
const GenAiAssistant = lazy(() => import('./components/ai/GenAiAssistant'));

function MainContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const { liveAnnouncement } = useEventPlan();

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; testId: string }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
      testId: 'tab-overview',
    },
    {
      id: 'budget',
      label: 'Budget Tracker',
      icon: <DollarSign className="w-4 h-4" />,
      testId: 'tab-budget',
    },
    {
      id: 'timeline',
      label: 'Interactive Timeline',
      icon: <Clock className="w-4 h-4" />,
      testId: 'tab-timeline',
    },
    {
      id: 'vendors',
      label: 'Vendor Checklist',
      icon: <Briefcase className="w-4 h-4" />,
      testId: 'tab-vendors',
    },
    {
      id: 'genai',
      label: 'GenAI Studio',
      icon: <Wand2 className="w-4 h-4 text-brand-500" />,
      testId: 'tab-genai',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Live Announcer for screen readers */}
      <LiveAnnouncer message={liveAnnouncement} />

      {/* Main Accessible Header & Navigation */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Navigation Ribbon */}
      <nav
        aria-label="Event Planning Sections"
        className="bg-white border-b border-slate-200/80 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            role="tablist"
            aria-orientation="horizontal"
            className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 no-scrollbar"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  data-testid={tab.testId}
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Landmark Area */}
      <main
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <Suspense fallback={<LoadingSkeleton label={`Loading ${activeTab} section...`} />}>
          {activeTab === 'overview' && <OverviewDashboard onNavigateTab={setActiveTab} />}
          {activeTab === 'budget' && <BudgetWidget />}
          {activeTab === 'timeline' && <TimelineView />}
          {activeTab === 'vendors' && <VendorChecklist />}
          {activeTab === 'genai' && <GenAiAssistant />}
        </Suspense>
      </main>

      {/* Accessible Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>CelebrationCraft • Production-Ready GenAI Event Architect</span>
          </div>
          <div>
            Built with React, TypeScript, Tailwind CSS, Zod Validation, and DOMPurify XSS Sanitization.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <EventProvider>
      <MainContent />
    </EventProvider>
  );
}
