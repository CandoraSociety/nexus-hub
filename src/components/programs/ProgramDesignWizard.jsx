import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Plus, X, Users, Target, Lightbulb, BarChart2, AlertTriangle, ClipboardList, Eye } from 'lucide-react';

// Program design principles and concepts baked in as guidance
const DESIGN_STEPS = [
  {
    id: 'needs',
    label: 'Needs Assessment',
    icon: Eye,
    principle: 'Effective programs start with a clear understanding of the gap between current conditions and desired outcomes.',
    prompt: 'What community need or problem is this program addressing? What evidence or data supports this need?',
    fields: ['needs_assessment'],
  },
  {
    id: 'population',
    label: 'Target Population',
    icon: Users,
    principle: 'Define your target population precisely — demographics, geography, barriers to access — so the program can be designed to reach and serve them effectively.',
    prompt: 'Who does this program serve? Be specific about demographics, eligibility criteria, and how you will reach them.',
    fields: ['design_target_population'],
  },
  {
    id: 'vision',
    label: 'Vision & Theory of Change',
    icon: Lightbulb,
    principle: 'A Theory of Change connects your activities to your intended outcomes. It answers: "If we do X, then Y will happen, because Z."',
    prompt: 'What is the program\'s vision? Describe your theory of change — how will your activities lead to your intended outcomes?',
    fields: ['design_vision'],
  },
  {
    id: 'goals',
    label: 'Goals & Outcomes',
    icon: Target,
    principle: 'Use SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound). Distinguish between short-term outputs, intermediate outcomes, and long-term impact.',
    prompt: 'What are the specific, measurable goals and outcomes for this program?',
    fields: ['design_goals'],
    isList: true,
  },
  {
    id: 'resources',
    label: 'Resources & Capacity',
    icon: ClipboardList,
    principle: 'Resource mapping ensures you have — or have a plan to acquire — the staffing, funding, partnerships, and infrastructure needed before launch.',
    prompt: 'What resources are required? (staffing, funding, partners, facilities, technology)',
    fields: ['design_resources_needed'],
  },
  {
    id: 'implementation',
    label: 'Implementation Plan',
    icon: ChevronRight,
    principle: 'A phased implementation plan reduces risk. Plan for a pilot phase before full rollout to test assumptions and refine delivery.',
    prompt: 'What are the key implementation steps? Include a pilot phase if applicable.',
    fields: ['design_implementation_steps'],
    isList: true,
    isSteps: true,
  },
  {
    id: 'risks',
    label: 'Risk & Sustainability',
    icon: AlertTriangle,
    principle: 'Every program faces risks — funding gaps, staff turnover, low enrollment. Proactively identifying risks with mitigation strategies improves resilience.',
    prompt: 'What are the main risks to this program succeeding, and how will you mitigate them? How will the program sustain itself long-term?',
    fields: ['design_risks'],
  },
  {
    id: 'evaluation',
    label: 'Evaluation Plan',
    icon: BarChart2,
    principle: 'Continuous quality improvement (CQI) requires building evaluation into the program from the start — not as an afterthought. Define data collection methods and review cycles.',
    prompt: 'How will you measure success? What data will you collect, how often, and who will review it?',
    fields: ['design_evaluation_plan'],
  },
];

export default function ProgramDesignWizard({ program, onSave, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({
    needs_assessment: program?.needs_assessment || '',
    design_target_population: program?.design_target_population || '',
    design_vision: program?.design_vision || '',
    design_goals: program?.design_goals || [],
    design_resources_needed: program?.design_resources_needed || '',
    design_implementation_steps: program?.design_implementation_steps || [],
    design_risks: program?.design_risks || '',
    design_evaluation_plan: program?.design_evaluation_plan || '',
  });

  const [newGoal, setNewGoal] = useState('');
  const [newStep, setNewStep] = useState({ step: '', owner: '', due_date: '' });

  const step = DESIGN_STEPS[currentStep];
  const completedSteps = DESIGN_STEPS.filter((s) => {
    if (s.isList && s.isSteps) return (data.design_implementation_steps || []).length > 0;
    if (s.isList) return (data.design_goals || []).length > 0;
    return !!data[s.fields[0]];
  });

  const isStepComplete = (s) => {
    if (s.isList && s.isSteps) return (data.design_implementation_steps || []).length > 0;
    if (s.isList) return (data.design_goals || []).length > 0;
    return !!data[s.fields[0]];
  };

  const handleSave = () => {
    onSave(data);
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setData({ ...data, design_goals: [...data.design_goals, newGoal.trim()] });
    setNewGoal('');
  };

  const removeGoal = (i) => setData({ ...data, design_goals: data.design_goals.filter((_, idx) => idx !== i) });

  const addStep = () => {
    if (!newStep.step) return;
    setData({ ...data, design_implementation_steps: [...data.design_implementation_steps, { ...newStep, done: false }] });
    setNewStep({ step: '', owner: '', due_date: '' });
  };

  const removeStep = (i) => setData({ ...data, design_implementation_steps: data.design_implementation_steps.filter((_, idx) => idx !== i) });

  const Icon = step.icon;

  return (
    <div className="space-y-6">
      {/* Progress stepper */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {DESIGN_STEPS.map((s, i) => {
          const StepIcon = s.icon;
          const done = isStepComplete(s);
          const active = i === currentStep;
          return (
            <React.Fragment key={s.id}>
              <button
                onClick={() => setCurrentStep(i)}
                className={`flex flex-col items-center gap-1 min-w-[64px] p-2 rounded-lg transition-all ${active ? 'bg-primary/10' : 'hover:bg-muted'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${active ? 'bg-primary text-primary-foreground' : done ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {done && !active ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[10px] text-center leading-tight ${active ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
              </button>
              {i < DESIGN_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 min-w-[12px] rounded ${i < currentStep ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg">Step {currentStep + 1}: {step.label}</h3>
            <p className="text-xs text-muted-foreground">{currentStep + 1} of {DESIGN_STEPS.length}</p>
          </div>
        </div>

        {/* Principle callout */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
          <p className="text-xs font-semibold text-amber-800 mb-1">Program Design Principle</p>
          <p className="text-sm text-amber-700">{step.principle}</p>
        </div>

        <p className="text-sm text-muted-foreground mb-4 font-medium">{step.prompt}</p>

        {/* Needs Assessment */}
        {step.id === 'needs' && (
          <Textarea
            placeholder="Describe the need, gap, or problem this program addresses. Include any relevant data, community feedback, or research..."
            value={data.needs_assessment}
            onChange={(e) => setData({ ...data, needs_assessment: e.target.value })}
            className="min-h-32"
          />
        )}

        {/* Target Population */}
        {step.id === 'population' && (
          <Textarea
            placeholder="e.g. Adults ages 25–55 in [County] who are unemployed or underemployed, with focus on those without a high school diploma..."
            value={data.design_target_population}
            onChange={(e) => setData({ ...data, design_target_population: e.target.value })}
            className="min-h-28"
          />
        )}

        {/* Vision */}
        {step.id === 'vision' && (
          <Textarea
            placeholder="e.g. Our vision is a community where every adult has access to quality workforce training. We believe that if we provide job skills + wraparound support, participants will achieve stable employment within 6 months..."
            value={data.design_vision}
            onChange={(e) => setData({ ...data, design_vision: e.target.value })}
            className="min-h-32"
          />
        )}

        {/* Goals */}
        {step.id === 'goals' && (
          <div className="space-y-3">
            <div className="space-y-2">
              {data.design_goals.map((g, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="flex-1">{g}</span>
                  <button type="button" onClick={() => removeGoal(i)}><X className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. 80% of participants will complete the 12-week program within 6 months of enrollment"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
              />
              <Button type="button" variant="outline" onClick={addGoal} className="gap-1"><Plus className="w-4 h-4" />Add</Button>
            </div>
          </div>
        )}

        {/* Resources */}
        {step.id === 'resources' && (
          <Textarea
            placeholder="Staffing: 1 FT coordinator, 2 PT instructors&#10;Funding: $120K grant + $30K in-kind&#10;Partners: Community College (space), Employer Network (job placements)&#10;Facilities: Training room, computer lab"
            value={data.design_resources_needed}
            onChange={(e) => setData({ ...data, design_resources_needed: e.target.value })}
            className="min-h-32"
          />
        )}

        {/* Implementation Steps */}
        {step.id === 'implementation' && (
          <div className="space-y-3">
            <div className="space-y-2">
              {data.design_implementation_steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                  <span className="flex-1">{s.step}</span>
                  {s.owner && <span className="text-muted-foreground text-xs">{s.owner}</span>}
                  {s.due_date && <span className="text-muted-foreground text-xs">{s.due_date}</span>}
                  <button type="button" onClick={() => removeStep(i)}><X className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Step (e.g. Phase 1: Pilot with 20 participants)"
                value={newStep.step}
                onChange={(e) => setNewStep({ ...newStep, step: e.target.value })}
                className="md:col-span-1"
              />
              <Input placeholder="Owner" value={newStep.owner} onChange={(e) => setNewStep({ ...newStep, owner: e.target.value })} />
              <div className="flex gap-2">
                <Input type="date" value={newStep.due_date} onChange={(e) => setNewStep({ ...newStep, due_date: e.target.value })} />
                <Button type="button" variant="outline" onClick={addStep}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        )}

        {/* Risks */}
        {step.id === 'risks' && (
          <Textarea
            placeholder="Risk: Low enrollment → Mitigation: Partner with 3 referral agencies before launch&#10;Risk: Funding gap after Year 1 → Mitigation: Begin diversification strategy at Month 6&#10;Sustainability: Seek multi-year grants + fee-for-service contracts by Year 2"
            value={data.design_risks}
            onChange={(e) => setData({ ...data, design_risks: e.target.value })}
            className="min-h-32"
          />
        )}

        {/* Evaluation */}
        {step.id === 'evaluation' && (
          <Textarea
            placeholder="Outputs: # enrolled, # completing, # placed&#10;Outcomes: Employment rate at 90 days, wage levels&#10;Data collection: Monthly intake forms, 90-day follow-up survey&#10;Review cycle: Quarterly CQI meetings with program staff"
            value={data.design_evaluation_plan}
            onChange={(e) => setData({ ...data, design_evaluation_plan: e.target.value })}
            className="min-h-32"
          />
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : onClose()}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {currentStep === 0 ? 'Back to Program' : 'Previous'}
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSave}>Save Progress</Button>
          {currentStep < DESIGN_STEPS.length - 1 ? (
            <Button onClick={() => { handleSave(); setCurrentStep(currentStep + 1); }} className="gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSave} className="gap-2">
              <CheckCircle2 className="w-4 h-4" /> Complete Design
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}