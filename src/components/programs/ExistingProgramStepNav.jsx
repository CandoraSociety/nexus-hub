import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const EXISTING_PROGRAM_STEPS = [
  { id: 'overview', label: 'Overview', description: 'Basic info & description' },
  { id: 'metrics', label: 'Metrics', description: 'Performance indicators' },
  { id: 'gaps', label: 'Gaps', description: 'Gaps & deficiencies' },
  { id: 'improvements', label: 'Improvements', description: 'Improvement plans' },
];

export default function ExistingProgramStepNav({ activeTab, onTabChange, program }) {
  const isComplete = (stepId) => {
    switch (stepId) {
      case 'overview': return !!program?.description;
      case 'metrics': return (program?.metrics || []).length > 0;
      case 'gaps': return (program?.gaps || []).length > 0;
      case 'improvements': return (program?.improvement_plans || []).length > 0;
      default: return false;
    }
  };

  return (
    <div className="w-full">
      {/* Mobile */}
      <div className="flex items-stretch gap-0 overflow-x-auto md:hidden pb-1">
        {EXISTING_PROGRAM_STEPS.map((step, i) => {
          const done = isComplete(step.id);
          const active = activeTab === step.id;
          return (
            <button
              key={step.id}
              onClick={() => onTabChange(step.id)}
              className={`flex flex-col items-center gap-1 min-w-[80px] px-2 py-2 text-center border-b-2 transition-all
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
        {EXISTING_PROGRAM_STEPS.map((step, i) => {
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
              {i < EXISTING_PROGRAM_STEPS.length - 1 && (
                <div className={`h-0.5 w-4 flex-shrink-0 rounded ${i < EXISTING_PROGRAM_STEPS.findIndex(s => s.id === activeTab) ? 'bg-primary/40' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}