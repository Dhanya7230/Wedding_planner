import { useState } from 'react';
import {
  Sparkles,
  Heart,
  Cake,
  Users,
  Download,
  Upload,
  RotateCcw,
  DollarSign,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import { useEventPlan } from '../../context/useEventPlan';
import type { EventType } from '../../types';
import { formatCurrency } from '../../utils/budgetCalculations';
import { Modal } from './Modal';

interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: any) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const {
    plan,
    budgetSummary,
    switchEventType,
    resetToDefaults,
    exportPlanAsJson,
    importPlanFromJson,
  } = useEventPlan();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Compute completed timeline milestones
  const completedMilestones = plan.timeline.filter((t) => t.isCompleted).length;
  const totalMilestones = plan.timeline.length;

  const eventTypes: { type: EventType; label: string; icon: React.ReactNode }[] = [
    { type: 'wedding', label: 'Wedding', icon: <Heart className="w-4 h-4 text-rose-500" /> },
    { type: 'birthday', label: 'Birthday', icon: <Cake className="w-4 h-4 text-amber-500" /> },
    { type: 'community', label: 'Community', icon: <Users className="w-4 h-4 text-emerald-500" /> },
  ];

  const handleExport = () => {
    const dataStr = exportPlanAsJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${plan.eventType}-celebration-plan.json`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(null);
    const success = importPlanFromJson(importJsonText);
    if (success) {
      setIsImportModalOpen(false);
      setImportJsonText('');
    } else {
      setImportError('Invalid plan file format. Please check the JSON syntax.');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-rose-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
              <Sparkles className="w-6 h-6 animate-pulse-subtle" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold font-serif tracking-tight text-slate-900">
                  CelebrationCraft
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-100 text-brand-800">
                  GenAI v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Intelligent Event & Wedding Architect
              </p>
            </div>
          </div>

          {/* Event Type Switcher (Wedding / Birthday / Community) */}
          <div
            role="group"
            aria-label="Event Type Selector"
            className="hidden md:flex items-center bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/60 shadow-inner"
          >
            {eventTypes.map(({ type, label, icon }) => {
              const isActive = plan.eventType === type;
              return (
                <button
                  key={type}
                  type="button"
                  data-testid={`event-type-${type}`}
                  onClick={() => switchEventType(type)}
                  aria-pressed={isActive}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Header Controls (Quick Summary & Actions) */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Remaining budget chip */}
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${
                budgetSummary.isOverBudget
                  ? 'bg-rose-50 border-rose-200 text-rose-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
              title="Remaining Available Budget"
            >
              <DollarSign className="w-4 h-4" />
              <span>
                Remaining:{' '}
                <strong className="font-bold">
                  {formatCurrency(budgetSummary.remainingBudget)}
                </strong>
              </span>
            </div>

            {/* Timeline progress chip */}
            <div
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white/70 text-slate-700 text-xs font-medium"
              title="Milestone Tasks Progress"
            >
              <CheckCircle2 className="w-4 h-4 text-brand-500" />
              <span>
                Tasks:{' '}
                <strong className="font-bold">
                  {completedMilestones}/{totalMilestones}
                </strong>
              </span>
            </div>

            {/* Export / Import & Reset dropdown */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                title="Export Event Plan as JSON"
                aria-label="Export Event Plan"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                title="Import Event Plan from JSON"
                aria-label="Import Event Plan"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset this event to curated template defaults?')) {
                    resetToDefaults();
                  }
                }}
                title="Reset to Template Defaults"
                aria-label="Reset to Defaults"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile menu hamburger toggle */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-500"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden pb-4 pt-2 border-t border-slate-200/80 animate-fade-in space-y-4">
            <div className="flex justify-around bg-slate-100 p-1.5 rounded-xl">
              {eventTypes.map(({ type, label, icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    switchEventType(type);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    plan.eventType === type ? 'bg-white shadow text-slate-900' : 'text-slate-600'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs px-2 text-slate-600">
              <span>
                Remaining:{' '}
                <strong className={budgetSummary.isOverBudget ? 'text-rose-600' : 'text-emerald-700'}>
                  {formatCurrency(budgetSummary.remainingBudget)}
                </strong>
              </span>
              <span>
                Tasks: {completedMilestones}/{totalMilestones} done
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Export Plan Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Event Plan"
        description="Download your complete event details, budget, timeline, and vendor records as a JSON backup."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            You are exporting the plan for <strong className="text-slate-900">{plan.name}</strong> ({plan.eventType}).
          </p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono text-slate-700 max-h-48 overflow-y-auto">
            {exportPlanAsJson()}
          </div>
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Plan Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportError(null);
        }}
        title="Import Event Plan"
        description="Paste a previously exported event JSON backup to restore your event configuration."
      >
        <form onSubmit={handleImportSubmit} className="space-y-4">
          {importError && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {importError}
            </div>
          )}
          <label htmlFor="import-json" className="block text-xs font-semibold text-slate-700">
            Paste Event Plan JSON:
          </label>
          <textarea
            id="import-json"
            rows={8}
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            placeholder="Paste your JSON plan here..."
            className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            required
          />
          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={() => {
                setIsImportModalOpen(false);
                setImportError(null);
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20"
            >
              <Upload className="w-4 h-4" />
              <span>Import Plan</span>
            </button>
          </div>
        </form>
      </Modal>
    </header>
  );
};
