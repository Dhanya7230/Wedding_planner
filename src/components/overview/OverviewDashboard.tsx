import { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Sparkles,
  ArrowRight,
  Clock,
  Briefcase,
  Edit3,
} from 'lucide-react';
import { useEventPlan } from '../../context/useEventPlan';
import { formatCurrency } from '../../utils/budgetCalculations';
import type { ActiveTab } from '../../types';
import { Modal } from '../common/Modal';

interface OverviewDashboardProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigateTab }) => {
  const { plan, budgetSummary, updateEventDetails } = useEventPlan();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states for quick event metadata edit
  const [name, setName] = useState(plan.name);
  const [hostName, setHostName] = useState(plan.hostName);
  const [date, setDate] = useState(plan.date);
  const [location, setLocation] = useState(plan.location);
  const [guestCount, setGuestCount] = useState(plan.guestCount);
  const [vibe, setVibe] = useState(plan.vibe);

  // Calculate days remaining
  const [today] = useState(() => new Date());
  const eventDateObj = new Date(plan.date);
  const diffTime = eventDateObj.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Milestone completion
  const completedMilestones = plan.timeline.filter((m) => m.isCompleted).length;
  const totalMilestones = plan.timeline.length;

  // Booked vendors
  const bookedVendors = plan.vendors.filter((v) => v.status === 'booked' || v.status === 'completed').length;
  const totalVendors = plan.vendors.length;

  // Upcoming 3 milestones
  const upcomingMilestones = [...plan.timeline]
    .filter((m) => !m.isCompleted)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventDetails({
      name,
      hostName,
      date,
      location,
      guestCount: Number(guestCount) || 0,
      vibe,
    });
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Event Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-700/50">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-champagne-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-400/30">
                {plan.eventType} Celebration
              </span>
              <span className="text-xs text-slate-400">Hosted by {plan.hostName}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white">
              {plan.name}
            </h1>

            <p className="text-sm text-slate-300 italic line-clamp-2">{plan.vibe}</p>

            {/* Quick Details Chips */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>
                  {new Date(plan.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </span>

              <span className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>{plan.location}</span>
              </span>

              <span className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-brand-400" />
                <span>{plan.guestCount} Guests</span>
              </span>
            </div>
          </div>

          {/* Countdown & Quick Edit button */}
          <div className="flex flex-col items-start lg:items-end justify-between space-y-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-center min-w-[140px]">
              <span className="text-3xl sm:text-4xl font-extrabold text-brand-300 font-mono block">
                {diffDays > 0 ? diffDays : 0}
              </span>
              <span className="text-xs text-slate-300 font-medium uppercase tracking-wider">
                {diffDays === 1 ? 'Day to Celebration' : 'Days to Celebration'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setName(plan.name);
                setHostName(plan.hostName);
                setDate(plan.date);
                setLocation(plan.location);
                setGuestCount(plan.guestCount);
                setVibe(plan.vibe);
                setIsEditModalOpen(true);
              }}
              className="flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Navigation Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Budget Card */}
        <div
          onClick={() => onNavigateTab('budget')}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onNavigateTab('budget');
          }}
          className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Budget Tracker
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {formatCurrency(budgetSummary.remainingBudget)} Left
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {budgetSummary.percentSpent}% spent of {formatCurrency(budgetSummary.totalBudget)}
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-brand-600 pt-4 mt-2 border-t border-slate-100">
            <span>Manage Expenses</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Timeline Card */}
        <div
          onClick={() => onNavigateTab('timeline')}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onNavigateTab('timeline');
          }}
          className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Interactive Timeline
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {completedMilestones} of {totalMilestones} Completed
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {totalMilestones - completedMilestones} action items remaining
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 pt-4 mt-2 border-t border-slate-100">
            <span>View Schedule</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Vendor Checklist Card */}
        <div
          onClick={() => onNavigateTab('vendors')}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onNavigateTab('vendors');
          }}
          className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Vendor Checklist
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {bookedVendors} of {totalVendors} Booked
              </h3>
            </div>
            <p className="text-xs text-slate-500">Catering, venue, photography & entertainment</p>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 pt-4 mt-2 border-t border-slate-100">
            <span>Review Vendors</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* GenAI Idea Studio Card */}
        <div
          onClick={() => onNavigateTab('genai')}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onNavigateTab('genai');
          }}
          className="p-6 bg-gradient-to-br from-brand-600 to-rose-600 text-white rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-brand-200 uppercase tracking-wider">
                GenAI Assistant
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Explore AI Concepts</h3>
            </div>
            <p className="text-xs text-white/80">
              Personalized themes, decor palettes, and signature guest experiences.
            </p>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-white pt-4 mt-2 border-t border-white/20">
            <span>Generate Ideas</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Upcoming Milestones Section */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>Next Urgent Milestones</span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab('timeline')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800"
          >
            See all {totalMilestones} milestones →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingMilestones.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 hover:border-slate-300 transition-all"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-brand-700">{m.phase}</span>
                <span className="text-slate-400">
                  {new Date(m.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800">{m.title}</h4>
              {m.description && (
                <p className="text-xs text-slate-500 line-clamp-2">{m.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Edit Details Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Event Overview"
        description="Update your event's primary title, hosts, date, location, and guest count."
      >
        <form onSubmit={handleSaveDetails} className="space-y-4">
          <div>
            <label htmlFor="modal-event-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Event Title
            </label>
            <input
              id="modal-event-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="modal-host-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Host / Couple Name
              </label>
              <input
                id="modal-host-name"
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="modal-date" className="block text-xs font-semibold text-slate-700 mb-1">
                Event Date
              </label>
              <input
                id="modal-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="modal-location" className="block text-xs font-semibold text-slate-700 mb-1">
                Location / City
              </label>
              <input
                id="modal-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="modal-guests" className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Guest Count
              </label>
              <input
                id="modal-guests"
                type="number"
                min="1"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="modal-vibe" className="block text-xs font-semibold text-slate-700 mb-1">
              Atmosphere / Aesthetic Vision
            </label>
            <textarea
              id="modal-vibe"
              rows={3}
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
