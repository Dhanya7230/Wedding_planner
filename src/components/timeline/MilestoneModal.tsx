import { useState } from 'react';
import type { TimelineItem, TimelinePhase, PriorityLevel } from '../../types';
import { timelineItemSchema, TIMELINE_PHASES, PRIORITY_LEVELS } from '../../schemas/validation';
import { Modal } from '../common/Modal';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<TimelineItem, 'id'>) => void;
  initialData?: TimelineItem | null;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [defaultDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [phase, setPhase] = useState<TimelinePhase>('3-5 Months Before');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [category, setCategory] = useState('Planning');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prevTrigger, setPrevTrigger] = useState<{ isOpen: boolean; initialData?: TimelineItem | null }>({
    isOpen,
    initialData,
  });

  if (prevTrigger.isOpen !== isOpen || prevTrigger.initialData !== initialData) {
    setPrevTrigger({ isOpen, initialData });
    if (initialData) {
      setTitle(initialData.title);
      setPhase(initialData.phase);
      setDueDate(initialData.dueDate);
      setPriority(initialData.priority);
      setCategory(initialData.category);
      setDescription(initialData.description || '');
    } else {
      setTitle('');
      setPhase('3-5 Months Before');
      setDueDate(defaultDueDate);
      setPriority('medium');
      setCategory('Planning');
      setDescription('');
    }
    setErrors({});
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      title,
      phase,
      dueDate,
      priority,
      category,
      description,
    };

    const validation = timelineItemSchema.safeParse(formData);

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

    onSave({
      ...validation.data,
      isCompleted: initialData ? initialData.isCompleted : false,
      completedAt: initialData ? initialData.completedAt : undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Milestone' : 'Add New Timeline Milestone'}
      description="Schedule important checkpoints leading up to your celebration."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="milestone-title" className="block text-xs font-semibold text-slate-700 mb-1">
            Milestone Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="milestone-title"
            data-testid="milestone-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Finalize Florist, Mail Save-the-Dates"
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
              errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
            } focus:ring-2 focus:ring-brand-500 focus:outline-none`}
            required
          />
          {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
        </div>

        {/* Phase & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="milestone-phase" className="block text-xs font-semibold text-slate-700 mb-1">
              Timeline Phase <span className="text-rose-500">*</span>
            </label>
            <select
              id="milestone-phase"
              data-testid="milestone-phase-select"
              value={phase}
              onChange={(e) => setPhase(e.target.value as TimelinePhase)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {TIMELINE_PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.phase && <p className="text-xs text-rose-600 mt-1">{errors.phase}</p>}
          </div>

          <div>
            <label htmlFor="milestone-date" className="block text-xs font-semibold text-slate-700 mb-1">
              Target Due Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="milestone-date"
              data-testid="milestone-date-input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border ${
                errors.dueDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } focus:ring-2 focus:ring-brand-500 focus:outline-none`}
              required
            />
            {errors.dueDate && <p className="text-xs text-rose-600 mt-1">{errors.dueDate}</p>}
          </div>
        </div>

        {/* Priority & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="milestone-priority" className="block text-xs font-semibold text-slate-700 mb-1">
              Priority Level <span className="text-rose-500">*</span>
            </label>
            <select
              id="milestone-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {PRIORITY_LEVELS.map((pri) => (
                <option key={pri} value={pri}>
                  {pri.charAt(0).toUpperCase() + pri.slice(1)} Priority
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="milestone-category" className="block text-xs font-semibold text-slate-700 mb-1">
              Category Tag
            </label>
            <input
              id="milestone-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Venue, Attire, Logistics"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="milestone-desc" className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Action Steps (Optional)
          </label>
          <textarea
            id="milestone-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Who is responsible? What specific contracts or decisions are required?"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/20"
          >
            {initialData ? 'Update Milestone' : 'Save Milestone'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
