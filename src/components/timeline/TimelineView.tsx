import React, { useState, useMemo, useCallback } from 'react';
import {
  Clock,
  Plus,
  Filter,
  Search,
  Sparkles,
} from 'lucide-react';
import { useEventPlan } from '../../context/useEventPlan';
import type { TimelineItem as TimelineItemType } from '../../types';
import { TIMELINE_PHASES } from '../../schemas/validation';
import { ProgressBar } from '../common/ProgressBar';
import { TimelineItem } from './TimelineItem';
import { MilestoneModal } from './MilestoneModal';

export const TimelineView: React.FC = () => {
  const {
    plan,
    addTimelineItem,
    updateTimelineItem,
    deleteTimelineItem,
    toggleTimelineItem,
  } = useEventPlan();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<TimelineItemType | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [todayTimestamp] = useState(() => new Date().setHours(0, 0, 0, 0));

  // Performance Optimization: memoized filtered list
  const filteredMilestones = useMemo(() => {
    return plan.timeline.filter((item) => {
      // Phase filter
      const matchesPhase = selectedPhase === 'all' || item.phase === selectedPhase;

      // Search filter
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter === 'completed') matchesStatus = item.isCompleted;
      if (statusFilter === 'pending') matchesStatus = !item.isCompleted;
      if (statusFilter === 'overdue') {
        matchesStatus =
          !item.isCompleted && new Date(item.dueDate).getTime() < todayTimestamp;
      }

      return matchesPhase && matchesSearch && matchesStatus;
    });
  }, [plan.timeline, selectedPhase, statusFilter, searchTerm, todayTimestamp]);

  // Sort chronologically by dueDate
  const sortedMilestones = useMemo(() => {
    return [...filteredMilestones].sort((a, b) => {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [filteredMilestones]);

  // Milestone statistics
  const completedCount = useMemo(() => {
    return plan.timeline.filter((m) => m.isCompleted).length;
  }, [plan.timeline]);

  const totalCount = plan.timeline.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Callbacks
  const handleOpenAdd = useCallback(() => {
    setEditingMilestone(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((item: TimelineItemType) => {
    setEditingMilestone(item);
    setIsModalOpen(true);
  }, []);

  const handleSaveMilestone = useCallback(
    (itemData: Omit<TimelineItemType, 'id'>) => {
      if (editingMilestone) {
        updateTimelineItem(editingMilestone.id, itemData);
      } else {
        addTimelineItem(itemData);
      }
    },
    [editingMilestone, updateTimelineItem, addTimelineItem]
  );

  return (
    <section aria-labelledby="timeline-heading" className="space-y-8 animate-fade-in">
      {/* Heading & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            id="timeline-heading"
            className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight"
          >
            Interactive Event Timeline
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Chronological milestones leading up to your celebration with interactive completion tracking.
          </p>
        </div>

        <button
          type="button"
          data-testid="add-milestone-btn"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Plus className="w-4 h-4" />
          <span>Add Milestone</span>
        </button>
      </div>

      {/* Progress & Stats Card */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Overall Milestone Progress</span>
              {completionPercentage === 100 && (
                <span className="flex items-center space-x-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>All Milestones Complete!</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              {completedCount} of {totalCount} scheduled milestones accomplished.
            </p>
          </div>
          <span className="text-lg font-bold text-brand-600">
            {completionPercentage.toFixed(0)}%
          </span>
        </div>

        <ProgressBar
          value={completedCount}
          max={totalCount}
          size="md"
          variant="auto"
          showPercentage={false}
          label="Milestones Completed"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Status Pill Filters */}
        <div
          role="group"
          aria-label="Filter milestones by status"
          className="flex flex-wrap items-center gap-1.5"
        >
          {(
            [
              { id: 'all', label: 'All Tasks' },
              { id: 'pending', label: 'Pending' },
              { id: 'completed', label: 'Completed' },
              { id: 'overdue', label: 'Overdue' },
            ] as const
          ).map((status) => (
            <button
              key={status.id}
              type="button"
              onClick={() => setStatusFilter(status.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 ${
                statusFilter === status.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Search & Phase Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search milestones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="all">All Phases</option>
              {TIMELINE_PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chronological Milestone List */}
      <div className="space-y-4">
        {sortedMilestones.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-medium">No milestones match your current filters.</p>
            <p className="text-xs text-slate-400">
              Try adjusting your search criteria or add a new timeline milestone.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMilestones.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                todayTimestamp={todayTimestamp}
                onToggle={toggleTimelineItem}
                onEdit={handleOpenEdit}
                onDelete={deleteTimelineItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMilestone}
        initialData={editingMilestone}
      />
    </section>
  );
};
