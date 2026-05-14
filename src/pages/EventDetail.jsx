import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, X, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EventStepNav, { EXISTING_EVENT_STEPS, NEW_EVENT_STEPS } from '@/components/events/EventStepNav';

const statusColors = {
  planning: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const recurrenceLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
  custom: 'Custom',
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [newMember, setNewMember] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () => base44.entities.Event.get(id),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event', id] }),
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  if (!event) return <div className="p-8 text-center text-muted-foreground">Event not found.</div>;

  const isNew = event.event_mode === 'new';
  const steps = isNew ? NEW_EVENT_STEPS : EXISTING_EVENT_STEPS;
  const currentStepIndex = steps.findIndex(s => s.id === activeTab);
  const prevStep = currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
  const nextStep = currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;

  const save = (data) => updateMutation.mutate(data);

  const addTeamMember = () => {
    if (!newMember.trim()) return;
    save({ team_members: [...(event.team_members || []), newMember.trim()] });
    setNewMember('');
  };

  const removeTeamMember = (i) => {
    save({ team_members: event.team_members.filter((_, idx) => idx !== i) });
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    save({ checklist: [...(event.checklist || []), { item: newChecklistItem.trim(), completed: false, assigned_to: '' }] });
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (i) => {
    const updated = event.checklist.map((c, idx) => idx === i ? { ...c, completed: !c.completed } : c);
    save({ checklist: updated });
  };

  const removeChecklistItem = (i) => {
    save({ checklist: event.checklist.filter((_, idx) => idx !== i) });
  };

  const startEdit = (field, value) => { setEditingField(field); setEditValue(value || ''); };
  const saveEdit = (field) => { save({ [field]: editValue }); setEditingField(null); };

  const firstStepId = steps[0].id;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/events')} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back to Events
      </Button>

      {/* Header */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-heading font-bold">{event.name}</h1>
              <Badge className={statusColors[event.status || 'planning']}>{event.status}</Badge>
              <Badge variant="outline" className={isNew ? 'text-accent border-accent' : 'text-secondary border-secondary'}>
                {isNew ? '✦ New Event' : '✓ Existing'}
              </Badge>
              {event.is_recurring && (
                <Badge variant="outline" className="text-primary border-primary">
                  🔄 {recurrenceLabels[event.recurrence_pattern] || 'Recurring'}
                </Badge>
              )}
            </div>
            {event.event_type && (
              <p className="text-sm text-muted-foreground capitalize">{event.event_type.replace(/_/g, ' ')}</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => startEdit('status', event.status)} className="gap-2">
            <Edit2 className="w-3 h-3" /> Edit Status
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Start</p>
            <p className="font-medium">{event.start_date ? new Date(event.start_date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">End</p>
            <p className="font-medium">{event.end_date ? new Date(event.end_date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Location</p>
            <p className="font-medium">{event.location || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Expected Attendance</p>
            <p className="font-medium">{event.expected_attendance || '—'}</p>
          </div>
        </div>
      </Card>

      {/* Step Navigation */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-heading font-bold">{isNew ? 'Event Planning' : 'Event Information'}</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>

        <EventStepNav steps={steps} activeTab={activeTab} onTabChange={setActiveTab} event={event} />

        <div className="mt-4 space-y-4">

          {/* ─── OVERVIEW (existing) / BASICS (new) ─── */}
          {(activeTab === 'overview' || activeTab === 'basics') && (
            <div className="space-y-4">
              {isNew && (
                <Card className="p-4 bg-accent/5 border-accent/20">
                  <p className="text-sm font-medium text-accent">💡 Planning Tip</p>
                  <p className="text-xs text-muted-foreground mt-1">Start by clearly defining the purpose and type of your event. A well-defined event type helps align expectations and planning checklists.</p>
                </Card>
              )}
              {!isNew && (
                <Card className="p-4 bg-secondary/5 border-secondary/20">
                  <p className="text-sm font-medium text-secondary">📋 Info Capture</p>
                  <p className="text-xs text-muted-foreground mt-1">Make sure all basic details are documented so the team has a single source of truth for this event.</p>
                </Card>
              )}

              <Card className="p-5 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Event Name</label>
                  {editingField === 'name' ? (
                    <div className="flex gap-2">
                      <Input value={editValue} onChange={e => setEditValue(e.target.value)} />
                      <Button size="sm" onClick={() => saveEdit('name')}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <p className="font-semibold cursor-pointer hover:text-primary" onClick={() => startEdit('name', event.name)}>{event.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Description</label>
                  {editingField === 'description' ? (
                    <div className="space-y-2">
                      <Textarea value={editValue} onChange={e => setEditValue(e.target.value)} className="min-h-20" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit('description')}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => startEdit('description', event.description)}>
                      {event.description || <span className="italic">Click to add description...</span>}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">Status</label>
                    <Select value={event.status} onValueChange={(v) => save({ status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">Event Type</label>
                    <Select value={event.event_type || ''} onValueChange={(v) => save({ event_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annual_org_event">Annual Org Event</SelectItem>
                        <SelectItem value="external_public">External / Public</SelectItem>
                        <SelectItem value="internal_workshop">Internal Workshop</SelectItem>
                        <SelectItem value="community_event">Community Event</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ─── SCHEDULING (new events) ─── */}
          {activeTab === 'scheduling' && (
            <div className="space-y-4">
              <Card className="p-4 bg-accent/5 border-accent/20">
                <p className="text-sm font-medium text-accent">🗓 Scheduling Tip</p>
                <p className="text-xs text-muted-foreground mt-1">For recurring events, set the recurrence pattern clearly. This helps with resource planning and calendar management across the organization.</p>
              </Card>
              <Card className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">Start Date & Time</label>
                    <Input type="datetime-local" value={event.start_date ? event.start_date.slice(0, 16) : ''} onChange={e => save({ start_date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">End Date & Time</label>
                    <Input type="datetime-local" value={event.end_date ? event.end_date.slice(0, 16) : ''} onChange={e => save({ end_date: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
                  <input
                    type="checkbox"
                    id="recurring-check"
                    checked={event.is_recurring || false}
                    onChange={e => save({ is_recurring: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="recurring-check" className="text-sm font-medium">This is a recurring event</label>
                </div>
                {event.is_recurring && (
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">Recurrence Pattern</label>
                    <Select value={event.recurrence_pattern || ''} onValueChange={v => save({ recurrence_pattern: v })}>
                      <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ─── LOGISTICS ─── */}
          {activeTab === 'logistics' && (
            <div className="space-y-4">
              {isNew ? (
                <Card className="p-4 bg-accent/5 border-accent/20">
                  <p className="text-sm font-medium text-accent">📍 Logistics Tip</p>
                  <p className="text-xs text-muted-foreground mt-1">Think through venue capacity, accessibility, AV/tech needs, parking, and any permits required. Document these early to avoid last-minute issues.</p>
                </Card>
              ) : (
                <Card className="p-4 bg-secondary/5 border-secondary/20">
                  <p className="text-sm font-medium text-secondary">📍 Capture Logistics</p>
                  <p className="text-xs text-muted-foreground mt-1">Document all logistical details so future coordinators have everything they need.</p>
                </Card>
              )}
              <Card className="p-5 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Location / Venue</label>
                  {editingField === 'location' ? (
                    <div className="flex gap-2">
                      <Input value={editValue} onChange={e => setEditValue(e.target.value)} placeholder="Physical address or virtual link" />
                      <Button size="sm" onClick={() => saveEdit('location')}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <p className="text-sm cursor-pointer hover:text-primary" onClick={() => startEdit('location', event.location)}>
                      {event.location || <span className="italic text-muted-foreground">Click to add location...</span>}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">Expected Attendance</label>
                    {editingField === 'expected_attendance' ? (
                      <div className="flex gap-2">
                        <Input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} />
                        <Button size="sm" onClick={() => saveEdit('expected_attendance')}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <p className="text-sm cursor-pointer hover:text-primary" onClick={() => startEdit('expected_attendance', event.expected_attendance)}>
                        {event.expected_attendance || <span className="italic text-muted-foreground">Click to set...</span>}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium mb-1 block">Start Date/Time</label>
                    <Input type="datetime-local" value={event.start_date ? event.start_date.slice(0, 16) : ''} onChange={e => save({ start_date: e.target.value })} />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ─── TEAM ─── */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              {isNew ? (
                <Card className="p-4 bg-accent/5 border-accent/20">
                  <p className="text-sm font-medium text-accent">👥 Team Planning Tip</p>
                  <p className="text-xs text-muted-foreground mt-1">Define roles clearly: who is the lead organizer? Who handles registration, venue, A/V, volunteers? Clear ownership prevents tasks from falling through the cracks.</p>
                </Card>
              ) : (
                <Card className="p-4 bg-secondary/5 border-secondary/20">
                  <p className="text-sm font-medium text-secondary">👥 Team Documentation</p>
                  <p className="text-xs text-muted-foreground mt-1">Record all team members and organizers for this event so the organization retains this institutional knowledge.</p>
                </Card>
              )}
              <Card className="p-5 space-y-3">
                <h3 className="font-semibold text-sm">Team Members & Organizers</h3>
                <div className="space-y-2">
                  {(event.team_members || []).map((m, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {m[0]?.toUpperCase()}
                      </div>
                      <span className="flex-1">{m}</span>
                      <button onClick={() => removeTeamMember(i)}><X className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add team member email or name..."
                    value={newMember}
                    onChange={e => setNewMember(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTeamMember()}
                  />
                  <Button size="icon" variant="outline" onClick={addTeamMember}><Plus className="w-4 h-4" /></Button>
                </div>
              </Card>
            </div>
          )}

          {/* ─── BUDGET (new events) ─── */}
          {activeTab === 'budget' && (
            <div className="space-y-4">
              <Card className="p-4 bg-accent/5 border-accent/20">
                <p className="text-sm font-medium text-accent">💰 Budget Planning Tip</p>
                <p className="text-xs text-muted-foreground mt-1">Break your budget into categories: venue, catering, marketing, A/V, staffing, contingency (typically 10-15%). Having a detailed budget upfront prevents overspending.</p>
              </Card>
              <Card className="p-5 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Total Budget ($)</label>
                  {editingField === 'budget' ? (
                    <div className="flex gap-2">
                      <Input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} />
                      <Button size="sm" onClick={() => saveEdit('budget')}>Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold cursor-pointer hover:text-primary" onClick={() => startEdit('budget', event.budget)}>
                      {event.budget ? `$${Number(event.budget).toLocaleString()}` : <span className="text-base text-muted-foreground italic">Click to set budget...</span>}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ─── CHECKLIST ─── */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              {isNew ? (
                <Card className="p-4 bg-accent/5 border-accent/20">
                  <p className="text-sm font-medium text-accent">✅ Checklist Tip</p>
                  <p className="text-xs text-muted-foreground mt-1">A good event checklist covers: venue booking, invitations, catering, A/V setup, day-of logistics, and post-event follow-up. Assign each item to a specific person.</p>
                </Card>
              ) : (
                <Card className="p-4 bg-secondary/5 border-secondary/20">
                  <p className="text-sm font-medium text-secondary">✅ Planning Checklist</p>
                  <p className="text-xs text-muted-foreground mt-1">Use this checklist to track all tasks needed to run this event successfully. Check off items as they're completed.</p>
                </Card>
              )}
              <Card className="p-5 space-y-3">
                <div className="space-y-2">
                  {(event.checklist || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40">
                      <button onClick={() => toggleChecklistItem(i)}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`}>
                          {item.completed && <span className="text-white text-xs">✓</span>}
                        </div>
                      </button>
                      <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.item}</span>
                      {item.assigned_to && <span className="text-xs text-muted-foreground">{item.assigned_to}</span>}
                      <button onClick={() => removeChecklistItem(i)}><X className="w-4 h-4 text-muted-foreground hover:text-destructive" /></button>
                    </div>
                  ))}
                </div>
                {(event.checklist || []).length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-4">No checklist items yet. Add some below.</p>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add checklist item..."
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addChecklistItem()}
                  />
                  <Button size="icon" variant="outline" onClick={addChecklistItem}><Plus className="w-4 h-4" /></Button>
                </div>
                {(event.checklist || []).length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {event.checklist.filter(c => c.completed).length} / {event.checklist.length} completed
                  </p>
                )}
              </Card>
            </div>
          )}

          {/* ─── MEMORY (existing events) ─── */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <Card className="p-4 bg-secondary/5 border-secondary/20">
                <p className="text-sm font-medium text-secondary">🧠 Institutional Memory</p>
                <p className="text-xs text-muted-foreground mt-1">Documenting what worked and what didn't is one of the most valuable things you can do for future event coordinators. Don't skip this step!</p>
              </Card>
              <Card className="p-5 space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Lessons Learned / Corporate Memory</label>
                  {editingField === 'corporate_memory' ? (
                    <div className="space-y-2">
                      <Textarea value={editValue} onChange={e => setEditValue(e.target.value)} className="min-h-32" placeholder="What worked well? What would you change? Any tips for the next time?" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEdit('corporate_memory')}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingField(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground cursor-pointer hover:text-foreground whitespace-pre-wrap" onClick={() => startEdit('corporate_memory', event.corporate_memory)}>
                      {event.corporate_memory || <span className="italic">Click to add lessons learned...</span>}
                    </p>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Prev / Next */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => prevStep && setActiveTab(prevStep.id)} disabled={!prevStep} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> {prevStep ? prevStep.label : 'Start'}
          </Button>
          <Button onClick={() => nextStep && setActiveTab(nextStep.id)} disabled={!nextStep} className="gap-2">
            {nextStep ? nextStep.label : 'Done'} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}