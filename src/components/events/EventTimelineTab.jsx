import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, CheckCircle2, Circle, Calendar } from 'lucide-react';

const categoryConfig = {
  pre_event: { label: 'Pre-Event', color: 'bg-blue-100 text-blue-800' },
  day_of: { label: 'Day Of', color: 'bg-purple-100 text-purple-800' },
  post_event: { label: 'Post-Event', color: 'bg-orange-100 text-orange-800' },
};

export default function EventTimelineTab({ event, onSave }) {
  const [form, setForm] = useState({ title: '', due_date: '', assigned_to: '', category: 'pre_event', notes: '' });
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState('all');

  const tasks = event.timeline_tasks || [];

  const addTask = () => {
    if (!form.title) return;
    onSave({ timeline_tasks: [...tasks, { ...form, completed: false }] });
    setForm({ title: '', due_date: '', assigned_to: '', category: 'pre_event', notes: '' });
    setShowForm(false);
  };

  const toggleTask = (i) => {
    const updated = tasks.map((t, idx) => idx === i ? { ...t, completed: !t.completed } : t);
    onSave({ timeline_tasks: updated });
  };

  const removeTask = (i) => {
    onSave({ timeline_tasks: tasks.filter((_, idx) => idx !== i) });
  };

  const filtered = filterCat === 'all' ? tasks : tasks.filter(t => t.category === filterCat);
  const sorted = [...filtered].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-accent/5 border-accent/20">
        <p className="text-sm font-medium text-accent">📅 Event Timeline</p>
        <p className="text-xs text-muted-foreground mt-1">Map out every task from pre-event prep through post-event follow-up. Assign owners and due dates to keep the team accountable.</p>
      </Card>

      {tasks.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(categoryConfig).map(([key, cfg]) => {
            const count = tasks.filter(t => t.category === key).length;
            const done = tasks.filter(t => t.category === key && t.completed).length;
            return (
              <Card key={key} className="p-3 text-center cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setFilterCat(filterCat === key ? 'all' : key)}>
                <Badge className={`${cfg.color} text-xs mb-1`}>{cfg.label}</Badge>
                <p className="text-lg font-bold">{done}/{count}</p>
                <p className="text-xs text-muted-foreground">done</p>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-sm">Tasks</h3>
            {tasks.length > 0 && (
              <span className="text-xs text-muted-foreground">{completedCount}/{tasks.length} completed</span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All phases</SelectItem>
                <SelectItem value="pre_event">Pre-Event</SelectItem>
                <SelectItem value="day_of">Day Of</SelectItem>
                <SelectItem value="post_event">Post-Event</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="gap-1 text-xs">
              <Plus className="w-3 h-3" /> Add Task
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-2">
            <Input placeholder="Task title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
              <Input placeholder="Assigned to" value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} />
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre_event">Pre-Event</SelectItem>
                  <SelectItem value="day_of">Day Of</SelectItem>
                  <SelectItem value="post_event">Post-Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addTask}>Add Task</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">No tasks yet. Build out your event timeline above.</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((task, i) => {
              const realIdx = tasks.indexOf(task);
              const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date();
              return (
                <div key={realIdx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 group">
                  <button onClick={() => toggleTask(realIdx)} className="mt-0.5">
                    {task.completed
                      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                      : <Circle className="w-5 h-5 text-muted-foreground" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge className={`${categoryConfig[task.category]?.color} text-xs`}>{categoryConfig[task.category]?.label}</Badge>
                      {task.due_date && (
                        <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                          <Calendar className="w-3 h-3" />{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {isOverdue && ' (overdue)'}
                        </span>
                      )}
                      {task.assigned_to && <span className="text-xs text-muted-foreground">→ {task.assigned_to}</span>}
                    </div>
                  </div>
                  <button onClick={() => removeTask(realIdx)} className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                    <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}