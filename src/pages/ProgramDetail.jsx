import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, X, Edit2, Save, CheckCircle2, Circle, AlertTriangle, TrendingUp, Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import ProgramForm from '@/components/programs/ProgramForm';
import ProgramDesignWizard from '@/components/programs/ProgramDesignWizard';
import ExistingProgramStepNav, { EXISTING_PROGRAM_STEPS } from '@/components/programs/ExistingProgramStepNav';

const severityColors = {
  low: 'bg-yellow-100 text-yellow-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

const gapStatusColors = {
  identified: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

const planStatusColors = {
  planned: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

export default function ProgramDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [designWizard, setDesignWizard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Gap form
  const [showGapForm, setShowGapForm] = useState(false);
  const [newGap, setNewGap] = useState({ title: '', description: '', severity: 'medium', status: 'identified' });

  // Improvement plan form
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [newPlan, setNewPlan] = useState({ title: '', description: '', owner: '', due_date: '', status: 'planned' });

  // Metric actual value editing
  const [editingMetricIdx, setEditingMetricIdx] = useState(null);
  const [metricActual, setMetricActual] = useState('');

  const { data: program, isLoading } = useQuery({
    queryKey: ['program', id],
    queryFn: () => base44.entities.Program.get(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Program.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program', id] });
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setEditing(false);
    },
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!program) return <div className="p-8 text-center text-muted-foreground">Program not found.</div>;

  const isDesign = program.program_mode === 'design';

  const saveField = (field, value) => {
    updateMutation.mutate({ [field]: value });
  };

  const addGap = () => {
    if (!newGap.title) return;
    const gaps = [...(program.gaps || []), { ...newGap }];
    updateMutation.mutate({ gaps });
    setNewGap({ title: '', description: '', severity: 'medium', status: 'identified' });
    setShowGapForm(false);
  };

  const removeGap = (i) => {
    const gaps = program.gaps.filter((_, idx) => idx !== i);
    updateMutation.mutate({ gaps });
  };

  const updateGapStatus = (i, status) => {
    const gaps = program.gaps.map((g, idx) => idx === i ? { ...g, status } : g);
    updateMutation.mutate({ gaps });
  };

  const addPlan = () => {
    if (!newPlan.title) return;
    const improvement_plans = [...(program.improvement_plans || []), { ...newPlan }];
    updateMutation.mutate({ improvement_plans });
    setNewPlan({ title: '', description: '', owner: '', due_date: '', status: 'planned' });
    setShowPlanForm(false);
  };

  const removePlan = (i) => {
    const improvement_plans = program.improvement_plans.filter((_, idx) => idx !== i);
    updateMutation.mutate({ improvement_plans });
  };

  const updatePlanStatus = (i, status) => {
    const improvement_plans = program.improvement_plans.map((p, idx) => idx === i ? { ...p, status } : p);
    updateMutation.mutate({ improvement_plans });
  };

  const saveMetricActual = (i) => {
    const metrics = program.metrics.map((m, idx) => idx === i ? { ...m, actual: metricActual } : m);
    updateMutation.mutate({ metrics });
    setEditingMetricIdx(null);
  };

  const toggleDesignStep = (i) => {
    const steps = program.design_implementation_steps.map((s, idx) =>
      idx === i ? { ...s, done: !s.done } : s
    );
    updateMutation.mutate({ design_implementation_steps: steps });
  };

  const statusColors = { planning: 'bg-yellow-100 text-yellow-800', active: 'bg-green-100 text-green-800', paused: 'bg-orange-100 text-orange-800', archived: 'bg-gray-100 text-gray-800' };

  const existingSteps = EXISTING_PROGRAM_STEPS;
  const currentExistingIdx = existingSteps.findIndex(s => s.id === activeTab);
  const prevExistingStep = currentExistingIdx > 0 ? existingSteps[currentExistingIdx - 1] : null;
  const nextExistingStep = currentExistingIdx < existingSteps.length - 1 ? existingSteps[currentExistingIdx + 1] : null;

  const designTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'design', label: 'Program Design' },
  ];

  // Design wizard save
  const handleWizardSave = (wizardData) => {
    updateMutation.mutate(wizardData);
    setDesignWizard(false);
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setEditing(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
        <ProgramForm
          program={program}
          mode={program.program_mode}
          onSubmit={(data) => updateMutation.mutate(data)}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  if (designWizard) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold">{program.name}</h1>
            <p className="text-sm text-muted-foreground">Program Design Wizard</p>
          </div>
          <Button variant="ghost" onClick={() => setDesignWizard(false)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Program</Button>
        </div>
        <ProgramDesignWizard
          program={program}
          onSave={handleWizardSave}
          onClose={() => setDesignWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link to="/programs">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-heading font-bold">{program.name}</h1>
              <Badge className={statusColors[program.status || 'planning']}>{program.status}</Badge>
              <Badge variant="outline" className={isDesign ? 'text-accent border-accent' : 'text-secondary border-secondary'}>
                {isDesign ? '✦ New Design' : '✓ Existing'}
              </Badge>
            </div>
            {program.category && <p className="text-sm text-muted-foreground capitalize">{program.category.replace(/_/g, ' ')}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          {isDesign && (
            <Button onClick={() => setDesignWizard(true)} className="gap-2">
              <Lightbulb className="w-4 h-4" /> Design Wizard
            </Button>
          )}
          <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit Program
          </Button>
        </div>
      </div>

      {/* Navigation: step nav for existing, tabs for design */}
      {!isDesign ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-heading font-bold">Program Information</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Step {currentExistingIdx + 1} of {existingSteps.length}
            </span>
          </div>
          <ExistingProgramStepNav activeTab={activeTab} onTabChange={setActiveTab} program={program} />
        </div>
      ) : (
        <div className="flex gap-1 border-b border-border">
          {designTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!isDesign && (
            <Card className="p-4 bg-secondary/5 border-secondary/20 md:col-span-2">
              <p className="text-sm font-medium text-secondary">📋 Step 1: Overview</p>
              <p className="text-xs text-muted-foreground mt-1">Ensure the program name, description, origin date, and key details are fully documented. This is your single source of truth for the program.</p>
            </Card>
          )}
          <Card className="p-6 md:col-span-2">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{program.description || 'No description added.'}</p>
          </Card>
          {program.start_date && (
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {isDesign ? 'Planned Start' : 'Program Origin Date'}
              </p>
              <p className="text-lg font-semibold mt-1">{program.start_date}</p>
            </Card>
          )}
          {program.end_date && (
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {isDesign ? 'Planned End' : program.status === 'paused' ? 'Date Paused' : 'Date Ended'}
              </p>
              <p className="text-lg font-semibold mt-1">
                {program.end_date === 'ongoing' ? '♾ Ongoing' : program.end_date}
              </p>
            </Card>
          )}
          {program.budget && (
            <Card className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Budget</p>
              <p className="text-lg font-semibold mt-1">${Number(program.budget).toLocaleString()}</p>
            </Card>
          )}
          {program.notes && (
            <Card className="p-6 md:col-span-2">
              <h3 className="font-semibold mb-2">Notes & Institutional Memory</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{program.notes}</p>
            </Card>
          )}
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          <Card className="p-4 bg-secondary/5 border-secondary/20">
            <p className="text-sm font-medium text-secondary">📊 Step 2: Metrics</p>
            <p className="text-xs text-muted-foreground mt-1">Define SMART metrics tied to your program's goals. Track both output metrics (# served) and outcome metrics (% improved). Regular measurement drives continuous quality improvement (CQI).</p>
          </Card>
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground text-sm">Track program-specific performance metrics</p>
          </div>
          {(program.metrics || []).length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">No metrics defined. Edit the program to add metrics.</Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(program.metrics || []).map((m, i) => (
              <Card key={i} className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-sm">{m.name}</h4>
                  <span className="text-xs text-muted-foreground">{m.unit}</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Target</p>
                    <p className="font-bold text-lg">{m.target || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Actual</p>
                    {editingMetricIdx === i ? (
                      <div className="flex gap-1">
                        <Input value={metricActual} onChange={(e) => setMetricActual(e.target.value)} className="h-7 w-20 text-sm" />
                        <Button size="icon" className="h-7 w-7" onClick={() => saveMetricActual(i)}><Save className="w-3 h-3" /></Button>
                      </div>
                    ) : (
                      <p
                        className="font-bold text-lg cursor-pointer hover:text-primary"
                        onClick={() => { setEditingMetricIdx(i); setMetricActual(m.actual || ''); }}
                        title="Click to update"
                      >
                        {m.actual || '—'}
                      </p>
                    )}
                  </div>
                </div>
                {m.target && m.actual && (
                  <div className="mt-3 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${Math.min(100, (parseFloat(m.actual) / parseFloat(m.target)) * 100)}%` }}
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Gaps Tab */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <Card className="p-4 bg-secondary/5 border-secondary/20">
            <p className="text-sm font-medium text-secondary">⚠️ Step 3: Gaps & Deficiencies</p>
            <p className="text-xs text-muted-foreground mt-1">Honestly documenting gaps is essential for program improvement. Rate severity, assign ownership, and track resolution. Unaddressed gaps become risks.</p>
          </Card>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Document gaps, deficiencies, and areas needing attention</p>
            <Button onClick={() => setShowGapForm(true)} className="gap-2" size="sm"><Plus className="w-4 h-4" /> Add Gap</Button>
          </div>
          {showGapForm && (
            <Card className="p-4 space-y-3">
              <Input placeholder="Gap title *" value={newGap.title} onChange={(e) => setNewGap({ ...newGap, title: e.target.value })} />
              <Textarea placeholder="Description" value={newGap.description} onChange={(e) => setNewGap({ ...newGap, description: e.target.value })} className="min-h-16" />
              <div className="flex gap-2">
                <Select value={newGap.severity} onValueChange={(v) => setNewGap({ ...newGap, severity: v })}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Severity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newGap.status} onValueChange={(v) => setNewGap({ ...newGap, status: v })}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identified">Identified</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowGapForm(false)}>Cancel</Button>
                <Button size="sm" onClick={addGap}>Add Gap</Button>
              </div>
            </Card>
          )}
          {(program.gaps || []).length === 0 && !showGapForm && (
            <Card className="p-8 text-center text-muted-foreground">No gaps recorded. Click "Add Gap" to start tracking.</Card>
          )}
          <div className="space-y-3">
            {(program.gaps || []).map((g, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-sm">{g.title}</span>
                      <Badge className={severityColors[g.severity]}>{g.severity}</Badge>
                      <Badge className={gapStatusColors[g.status]}>{g.status?.replace(/_/g, ' ')}</Badge>
                    </div>
                    {g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}
                    <div className="flex gap-2 mt-2">
                      {g.status !== 'resolved' && (
                        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => updateGapStatus(i, g.status === 'identified' ? 'in_progress' : 'resolved')}>
                          Mark {g.status === 'identified' ? 'In Progress' : 'Resolved'}
                        </Button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeGap(i)}><X className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Plans Tab */}
      {activeTab === 'improvements' && (
        <div className="space-y-4">
          <Card className="p-4 bg-secondary/5 border-secondary/20">
            <p className="text-sm font-medium text-secondary">📈 Step 4: Improvement Plans</p>
            <p className="text-xs text-muted-foreground mt-1">For each identified gap, create a concrete improvement plan with clear ownership and timelines. This closes the CQI loop: identify → plan → act → evaluate.</p>
          </Card>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Track program improvement initiatives and corrective action plans</p>
            <Button onClick={() => setShowPlanForm(true)} className="gap-2" size="sm"><Plus className="w-4 h-4" /> Add Plan</Button>
          </div>
          {showPlanForm && (
            <Card className="p-4 space-y-3">
              <Input placeholder="Plan title *" value={newPlan.title} onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })} />
              <Textarea placeholder="Description / action steps" value={newPlan.description} onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })} className="min-h-16" />
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Owner" value={newPlan.owner} onChange={(e) => setNewPlan({ ...newPlan, owner: e.target.value })} />
                <Input type="date" value={newPlan.due_date} onChange={(e) => setNewPlan({ ...newPlan, due_date: e.target.value })} />
                <Select value={newPlan.status} onValueChange={(v) => setNewPlan({ ...newPlan, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPlanForm(false)}>Cancel</Button>
                <Button size="sm" onClick={addPlan}>Add Plan</Button>
              </div>
            </Card>
          )}
          {(program.improvement_plans || []).length === 0 && !showPlanForm && (
            <Card className="p-8 text-center text-muted-foreground">No improvement plans yet. Click "Add Plan" to create one.</Card>
          )}
          <div className="space-y-3">
            {(program.improvement_plans || []).map((p, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-secondary" />
                      <span className="font-semibold text-sm">{p.title}</span>
                      <Badge className={planStatusColors[p.status]}>{p.status?.replace(/_/g, ' ')}</Badge>
                    </div>
                    {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {p.owner && <span>Owner: {p.owner}</span>}
                      {p.due_date && <span>Due: {p.due_date}</span>}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {p.status !== 'completed' && (
                        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => updatePlanStatus(i, p.status === 'planned' ? 'in_progress' : 'completed')}>
                          Mark {p.status === 'planned' ? 'In Progress' : 'Completed'}
                        </Button>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removePlan(i)}><X className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Prev/Next for existing programs */}
      {!isDesign && (
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => prevExistingStep && setActiveTab(prevExistingStep.id)}
            disabled={!prevExistingStep}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> {prevExistingStep ? prevExistingStep.label : 'Start'}
          </Button>
          <Button
            onClick={() => nextExistingStep && setActiveTab(nextExistingStep.id)}
            disabled={!nextExistingStep}
            className="gap-2"
          >
            {nextExistingStep ? nextExistingStep.label : 'Done'} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Design Tab */}
      {activeTab === 'design' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Step through the program design process below, or open the guided wizard.</p>
            <Button onClick={() => setDesignWizard(true)} className="gap-2">
              <Lightbulb className="w-4 h-4" /> Open Design Wizard
            </Button>
          </div>

          {/* Design summary — each section as a card with completion indicator */}
          {[
            { label: 'Needs Assessment', value: program.needs_assessment, icon: '🔍' },
            { label: 'Target Population', value: program.design_target_population, icon: '👥' },
            { label: 'Vision & Theory of Change', value: program.design_vision, icon: '💡' },
            { label: 'Goals & Outcomes', value: (program.design_goals || []).join('\n'), isList: program.design_goals, icon: '🎯' },
            { label: 'Resources & Capacity', value: program.design_resources_needed, icon: '📦' },
            { label: 'Implementation Plan', value: null, isSteps: true, icon: '🗂️' },
            { label: 'Risk & Sustainability', value: program.design_risks, icon: '⚠️' },
            { label: 'Evaluation Plan', value: program.design_evaluation_plan, icon: '📊' },
          ].map((section, i) => {
            const hasContent = section.isSteps
              ? (program.design_implementation_steps || []).length > 0
              : section.isList
                ? section.isList.length > 0
                : !!section.value;
            return (
              <Card key={i} className={`p-5 ${hasContent ? '' : 'opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <span>{section.icon}</span> Step {i + 1}: {section.label}
                  </h3>
                  {hasContent
                    ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                    : <Circle className="w-4 h-4 text-muted-foreground" />}
                </div>
                {hasContent ? (
                  section.isSteps ? (
                    <div className="space-y-1">
                      {program.design_implementation_steps.map((s, si) => (
                        <div key={si} className="flex items-center gap-2 text-sm">
                          <button onClick={() => toggleDesignStep(si)}>
                            {s.done ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                          </button>
                          <span className={s.done ? 'line-through text-muted-foreground' : ''}>{s.step}</span>
                          {s.owner && <span className="text-xs text-muted-foreground ml-auto">{s.owner}</span>}
                        </div>
                      ))}
                    </div>
                  ) : section.isList ? (
                    <ul className="space-y-1">
                      {section.isList.map((g, gi) => (
                        <li key={gi} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />{g}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{section.value}</p>
                  )
                ) : (
                  <p className="text-xs text-muted-foreground italic">Not completed — open the Design Wizard to fill this in.</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}