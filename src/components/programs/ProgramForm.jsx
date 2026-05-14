import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

export default function ProgramForm({ program, mode = 'existing', onSubmit, onCancel }) {
  const [data, setData] = useState(program || {
    name: '',
    description: '',
    status: 'planning',
    category: '',
    start_date: '',
    end_date: '',
    budget: '',
    notes: '',
    program_mode: mode,
    metrics: [],
    gaps: [],
    improvement_plans: [],
    design_vision: '',
    design_target_population: '',
    design_goals: [],
    design_resources_needed: '',
    design_implementation_steps: [],
    design_risks: '',
    design_evaluation_plan: '',
  });

  const [newMetric, setNewMetric] = useState({ name: '', target: '', unit: '' });
  const [newGoal, setNewGoal] = useState('');
  const [newStep, setNewStep] = useState({ step: '', owner: '', due_date: '' });

  const effectiveMode = program?.program_mode || mode;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...data, program_mode: effectiveMode });
  };

  const addMetric = () => {
    if (!newMetric.name) return;
    setData({ ...data, metrics: [...(data.metrics || []), { ...newMetric, actual: '' }] });
    setNewMetric({ name: '', target: '', unit: '' });
  };

  const removeMetric = (i) => {
    setData({ ...data, metrics: data.metrics.filter((_, idx) => idx !== i) });
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setData({ ...data, design_goals: [...(data.design_goals || []), newGoal.trim()] });
    setNewGoal('');
  };

  const removeGoal = (i) => {
    setData({ ...data, design_goals: data.design_goals.filter((_, idx) => idx !== i) });
  };

  const addStep = () => {
    if (!newStep.step) return;
    setData({ ...data, design_implementation_steps: [...(data.design_implementation_steps || []), { ...newStep, done: false }] });
    setNewStep({ step: '', owner: '', due_date: '' });
  };

  const removeStep = (i) => {
    setData({ ...data, design_implementation_steps: data.design_implementation_steps.filter((_, idx) => idx !== i) });
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold">
          {program ? 'Edit Program' : effectiveMode === 'design' ? 'Design New Program' : 'Add Existing Program'}
        </h2>
        <Badge variant="outline" className={effectiveMode === 'design' ? 'text-accent border-accent' : 'text-secondary border-secondary'}>
          {effectiveMode === 'design' ? 'New Design' : 'Existing Program'}
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Info */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Program Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Program name *"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              required
              className="md:col-span-2"
            />
            <Select value={data.status} onValueChange={(v) => setData({ ...data, status: v })}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={data.category} onValueChange={(v) => setData({ ...data, category: v })}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="adult_learning">Adult Learning</SelectItem>
                <SelectItem value="community_services">Community Services</SelectItem>
                <SelectItem value="youth_programs">Youth Programs</SelectItem>
                <SelectItem value="health_wellness">Health & Wellness</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={data.start_date}
              onChange={(e) => setData({ ...data, start_date: e.target.value })}
            />
            <Input
              type="date"
              value={data.end_date}
              onChange={(e) => setData({ ...data, end_date: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Budget ($)"
              value={data.budget}
              onChange={(e) => setData({ ...data, budget: e.target.value })}
            />
          </div>
          <Textarea
            placeholder="Description"
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className="mt-4 min-h-20"
          />
          <Textarea
            placeholder="Notes / institutional memory"
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            className="mt-4 min-h-16"
          />
        </div>

        {/* EXISTING PROGRAM: Custom Metrics */}
        {effectiveMode === 'existing' && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Program Metrics</h3>
            <p className="text-xs text-muted-foreground mb-3">Add the metrics that matter for this specific program (e.g. # participants served, graduation rate, etc.)</p>
            <div className="space-y-2 mb-3">
              {(data.metrics || []).map((m, i) => (
                <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                  <span className="font-medium flex-1">{m.name}</span>
                  <span className="text-muted-foreground">Target: {m.target} {m.unit}</span>
                  <button type="button" onClick={() => removeMetric(i)}><X className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Metric name" value={newMetric.name} onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })} />
              <Input placeholder="Target value" value={newMetric.target} onChange={(e) => setNewMetric({ ...newMetric, target: e.target.value })} />
              <div className="flex gap-2">
                <Input placeholder="Unit (e.g. %, people)" value={newMetric.unit} onChange={(e) => setNewMetric({ ...newMetric, unit: e.target.value })} />
                <Button type="button" size="icon" variant="outline" onClick={addMetric}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>
        )}

        {/* DESIGN: Vision & Goals */}
        {effectiveMode === 'design' && (
          <>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Program Design</h3>
              <div className="space-y-4">
                <Textarea
                  placeholder="Vision & purpose — What is this program trying to achieve?"
                  value={data.design_vision}
                  onChange={(e) => setData({ ...data, design_vision: e.target.value })}
                  className="min-h-20"
                />
                <Textarea
                  placeholder="Target population — Who does this program serve?"
                  value={data.design_target_population}
                  onChange={(e) => setData({ ...data, design_target_population: e.target.value })}
                  className="min-h-16"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Key Goals</h3>
              <div className="space-y-2 mb-3">
                {(data.design_goals || []).map((g, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                    <span className="flex-1">{g}</span>
                    <button type="button" onClick={() => removeGoal(i)}><X className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add a goal..." value={newGoal} onChange={(e) => setNewGoal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())} />
                <Button type="button" size="icon" variant="outline" onClick={addGoal}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Implementation Steps</h3>
              <div className="space-y-2 mb-3">
                {(data.design_implementation_steps || []).map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                    <span className="flex-1">{s.step}</span>
                    {s.owner && <span className="text-muted-foreground text-xs">{s.owner}</span>}
                    {s.due_date && <span className="text-muted-foreground text-xs">{s.due_date}</span>}
                    <button type="button" onClick={() => removeStep(i)}><X className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Step description" value={newStep.step} onChange={(e) => setNewStep({ ...newStep, step: e.target.value })} />
                <Input placeholder="Owner" value={newStep.owner} onChange={(e) => setNewStep({ ...newStep, owner: e.target.value })} />
                <div className="flex gap-2">
                  <Input type="date" value={newStep.due_date} onChange={(e) => setNewStep({ ...newStep, due_date: e.target.value })} />
                  <Button type="button" size="icon" variant="outline" onClick={addStep}><Plus className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Resources & Risks</h3>
              <div className="space-y-4">
                <Textarea
                  placeholder="Resources needed — staffing, funding, partnerships, facilities..."
                  value={data.design_resources_needed}
                  onChange={(e) => setData({ ...data, design_resources_needed: e.target.value })}
                  className="min-h-16"
                />
                <Textarea
                  placeholder="Anticipated risks and mitigations..."
                  value={data.design_risks}
                  onChange={(e) => setData({ ...data, design_risks: e.target.value })}
                  className="min-h-16"
                />
                <Textarea
                  placeholder="Evaluation plan — how will you measure success?"
                  value={data.design_evaluation_plan}
                  onChange={(e) => setData({ ...data, design_evaluation_plan: e.target.value })}
                  className="min-h-16"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">
            {program ? 'Save Changes' : effectiveMode === 'design' ? 'Save Program Design' : 'Add Program'}
          </Button>
        </div>
      </form>
    </Card>
  );
}