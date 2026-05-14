import React from 'react';
import { CheckCircle2 } from 'lucide-react';

// Steps for EXISTING events (info-capture focused)
export const EXISTING_EVENT_STEPS = [
  { id: 'overview', label: 'Overview', description: 'Basic info & dates' },
  { id: 'logistics', label: 'Logistics', description: 'Location & attendance' },
  { id: 'team', label: 'Team', description: 'Organizers & volunteers' },
  { id: 'checklist', label: 'Checklist', description: 'Planning checklist' },
  { id: 'memory', label: 'Memory', description: 'Lessons & notes' },
];

// Steps for NEW events (planning focused)
export const NEW_EVENT_STEPS = [
  { id: 'basics', label: 'Basics', description: 'Name, type & purpose' },
  { id: 'scheduling', label: 'Schedule', description: 'Date, time & recurrence' },
  { id: 'logistics', label: 'Logistics', description: 'Location, venue & needs' },
  { id: 'team', label: 'Team', description: 'Roles & responsibilities' },
  { id: 'budget', label: 'Budget', description: 'Cost planning' },
  { id: 'checklist', label: 'Checklist', description: 'Pre-event tasks' },
];

export default function EventStepNav({ steps, activeTab, onTabChange, event }) {
  const isComplete = (stepId) => {
    switch (stepId) {
      case 'overview':
      case 'basics': return !!event?.name;
      case 'scheduling': return !!event?.start_date;
      case 'logistics': return !!event?.location;
      case 'team': return (event?.team_members || []).length > 0;
      case 'checklist': return (event?.checklist || []).length > 0;
      case 'memory': return !!event?.corporate_memory;
      case 'budget': return !!event?.budget;
      default: return false;
    }
  };

  return (
    <div className="w-full">
      {/* Mobile */}
      <div className="flex items-stretch gap-0 overflow-x-auto md:hidden pb-1">
        {steps.map((step, i) => {
          const done = isComplete(step.id);
          const active = activeTab === step.id;
          return (
            <button
              key={step.id}
              onClick={() => onTabChange(step.id)}
              className={`flex flex-col items-center gap-1 min-w-[70px] px-2 py-2 text-center border-b-2 transition-all
                ${active ? 'border-primary text-primary' : done ? 'border-green-400 text-green-600' : 'border-transparent text-muted-foreground'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${active ? 'bg-primary text-primary-foreground' : done ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {done && !active ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
              </div>
              <span className="text-[10px] font-medium leading-tight">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-0 mb-6">
        {steps.map((step, i) => {
          const done = isComplete(step.id);
          const active = activeTab === step.id;
          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => onTabChange(step.id)}
                className={`flex flex-col items-center gap-1.5 flex-1 py-3 px-2 rounded-lg transition-all group
                  ${active ? 'bg-primary/10' : 'hover:bg-muted/60'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${active ? 'bg-primary text-primary-foreground shadow-md' : done ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground group-hover:bg-muted-foreground/20'}`}>
                  {done && !active ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-semibold ${active ? 'text-primary' : done ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground hidden lg:block">{step.description}</p>
                </div>
              </button>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-4 flex-shrink-0 rounded ${i < steps.findIndex(s => s.id === activeTab) ? 'bg-primary/40' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}