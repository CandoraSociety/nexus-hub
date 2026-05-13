import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2, Calendar } from 'lucide-react';

const statusColors = {
  planned: 'bg-slate-100 text-slate-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  at_risk: 'bg-red-100 text-red-800',
};

export default function ProjectMilestonesTab({ milestones, onCreateMilestone, onUpdateMilestone, onDeleteMilestone, complexity }) {
  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
    status: 'planned',
    completion_percent: 0,
    deliverables: [],
  });
  const [newDeliverable, setNewDeliverable] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMilestone) {
      onUpdateMilestone({ ...editingMilestone, ...formData });
    } else {
      onCreateMilestone(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      target_date: '',
      status: 'planned',
      completion_percent: 0,
      deliverables: [],
    });
    setEditingMilestone(null);
    setNewDeliverable('');
    setShowForm(false);
  };

  const handleEdit = (m) => {
    setEditingMilestone(m);
    setFormData({
      title: m.title,
      description: m.description,
      target_date: m.target_date,
      status: m.status,
      completion_percent: m.completion_percent,
      deliverables: m.deliverables || [],
    });
    setShowForm(true);
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setFormData({
        ...formData,
        deliverables: [...formData.deliverables, newDeliverable],
      });
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (idx) => {
    setFormData({
      ...formData,
      deliverables: formData.deliverables.filter((_, i) => i !== idx),
    });
  };

  // Simple view: just list milestones
  if (complexity === 'simple') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-heading font-bold">Milestones</h2>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" /> New Milestone
          </Button>
        </div>

        {showForm && (
          <Card className="p-6 bg-muted/30">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Milestone title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">Create Milestone</Button>
              </div>
            </form>
          </Card>
        )}

        <div className="space-y-2">
          {milestones.map(m => (
            <Card key={m.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{m.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(m.target_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(m)} className="h-8 w-8">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteMilestone(m.id)} className="h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Intermediate & Advanced: timeline view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-heading font-bold">Project Timeline</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> New Milestone
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-muted/30">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Milestone title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Milestone description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-20"
            />
            <Input
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="at_risk">At Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Completion %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.completion_percent}
                  onChange={(e) => setFormData({ ...formData, completion_percent: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {complexity === 'advanced' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Deliverables</label>
                <div className="space-y-2 mb-3">
                  {formData.deliverables.map((d, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-sm flex-1">{d}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeDeliverable(idx)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add deliverable"
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
                  />
                  <Button type="button" onClick={addDeliverable} className="gap-2">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingMilestone ? 'Update' : 'Create'} Milestone
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No milestones defined yet.</p>
          </Card>
        ) : (
          milestones.sort((a, b) => new Date(a.target_date) - new Date(b.target_date)).map((m, idx) => (
            <Card key={m.id} className="p-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  {idx < milestones.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{m.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.target_date).toLocaleDateString()}
                      </p>
                      {m.description && (
                        <p className="text-sm text-muted-foreground mt-2">{m.description}</p>
                      )}
                      {complexity === 'advanced' && m.deliverables?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium mb-1">Deliverables:</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {m.deliverables.map((d, i) => (
                              <li key={i}>• {d}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={statusColors[m.status]}>
                        {m.status}
                      </Badge>
                      {m.completion_percent > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {m.completion_percent}%
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(m)} className="h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDeleteMilestone(m.id)} className="h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}