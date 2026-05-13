import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const statusColors = {
  not_started: 'bg-slate-100 text-slate-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  on_hold: 'bg-orange-100 text-orange-800',
};

export default function ProjectObjectivesTab({ objectives, onCreateObjective, onUpdateObjective, onDeleteObjective }) {
  const [showForm, setShowForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'not_started',
    priority: 'medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingObjective) {
      onUpdateObjective({ ...editingObjective, ...formData });
    } else {
      onCreateObjective(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'not_started',
      priority: 'medium',
    });
    setEditingObjective(null);
    setShowForm(false);
  };

  const handleEdit = (obj) => {
    setEditingObjective(obj);
    setFormData({
      title: obj.title,
      description: obj.description,
      status: obj.status,
      priority: obj.priority,
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-heading font-bold">Project Objectives</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> New Objective
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-muted/30">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Objective title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Detailed description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-20"
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Priority</label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">
                {editingObjective ? 'Update' : 'Create'} Objective
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {objectives.map(obj => (
          <Card key={obj.id} className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-semibold">{obj.title}</h3>
                {obj.description && (
                  <p className="text-sm text-muted-foreground mt-2">{obj.description}</p>
                )}
                <div className="flex gap-2 mt-3">
                  <Badge className={statusColors[obj.status]}>
                    {obj.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">{obj.priority} priority</Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(obj)}
                  className="h-8 w-8"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteObjective(obj.id)}
                  className="h-8 w-8"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {objectives.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No objectives defined yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}