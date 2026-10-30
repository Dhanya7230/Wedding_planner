import React, { useState } from 'react';
import { Check, Calendar, Trash2, Edit2, AlertCircle, Clock } from 'lucide-react';
import type { TimelineItem as TimelineItemType, PriorityLevel } from '../../types';

interface TimelineItemProps {
  item: TimelineItemType;
  onToggle: (id: string) => void;
  onEdit: (item: TimelineItemType) => void;
  onDelete: (id: string) => void;
  todayTimestamp?: number;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  item,
  onToggle,
  onEdit,
  onDelete,
  todayTimestamp,
}) => {
  const [defaultToday] = useState(() => new Date().setHours(0, 0, 0, 0));
  const currentTimestamp = todayTimestamp ?? defaultToday;

  // Format due date nicely
  const formattedDate = new Date(item.dueDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate overdue status
  const isOverdue =
    !item.isCompleted &&
    new Date(item.dueDate).getTime() < currentTimestamp;

  // Priority badge styling
  const priorityBadges: Record<PriorityLevel, { text: string; bg: string; color: string }> = {
    critical: { text: 'Critical', bg: 'bg-rose-100', color: 'text-rose-800' },
    high: { text: 'High', bg: 'bg-amber-100', color: 'text-amber-800' },
    medium: { text: 'Medium', bg: 'bg-indigo-100', color: 'text-indigo-800' },
    low: { text: 'Low', bg: 'bg-slate-100', color: 'text-slate-700' },
  };

  const badge = priorityBadges[item.priority] || priorityBadges.medium;

  // Keyboard navigation support: Space or Enter toggles completion
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onToggle(item.id);
    }
  };

  return (
    <article
      data-testid="timeline-item"
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
        item.isCompleted
          ? 'bg-slate-50/80 border-slate-200 opacity-80'
          : isOverdue
          ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300 shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Accessible Toggle Checkbox */}
        <div className="flex items-start space-x-3.5 flex-1">
          <div
            role="checkbox"
            tabIndex={0}
            aria-checked={item.isCompleted}
            aria-label={`Mark milestone "${item.title}" as ${
              item.isCompleted ? 'incomplete' : 'complete'
            }`}
            data-testid="timeline-item-toggle"
            onClick={() => onToggle(item.id)}
            onKeyDown={handleKeyDown}
            className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition-all mt-0.5 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
              item.isCompleted
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'border-2 border-slate-300 hover:border-brand-500 bg-white'
            }`}
          >
            {item.isCompleted && <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className={`text-sm sm:text-base font-bold text-slate-900 ${
                  item.isCompleted ? 'line-through text-slate-500' : ''
                }`}
              >
                {item.title}
              </h4>

              {/* Priority badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badge.bg} ${badge.color}`}
              >
                {badge.text}
              </span>

              {/* Category pill */}
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                {item.category}
              </span>

              {/* Overdue indicator */}
              {isOverdue && (
                <span className="flex items-center space-x-1 text-xs font-semibold text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Overdue</span>
                </span>
              )}
            </div>

            {item.description && (
              <p
                className={`text-xs sm:text-sm text-slate-600 mt-1 ${
                  item.isCompleted ? 'text-slate-400' : ''
                }`}
              >
                {item.description}
              </p>
            )}

            {/* Due date info */}
            <div className="flex items-center space-x-4 pt-1.5 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Due: {formattedDate}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.phase}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            aria-label={`Edit milestone ${item.title}`}
            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label={`Delete milestone ${item.title}`}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
