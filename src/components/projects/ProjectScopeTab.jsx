import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Plus, Trash2 } from 'lucide-react';

export default function ProjectScopeTab({ project, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState({
    in_scope: project.in_scope || [],
    out_scope: project.out_scope || [],
    overview: project.scope_overview || '',
  });
  const [newItem, setNewItem] = useState('');

  const handleAddInScope = () => {
    if (newItem.trim()) {
      setData({ ...data, in_scope: [...data.in_scope, newItem] });
      setNewItem('');
    }
  };

  const handleAddOutScope = () => {
    if (newItem.trim()) {
      setData({ ...data, out_scope: [...data.out_scope, newItem] });
      setNewItem('');
    }
  };

  const handleRemoveInScope = (idx) => {
    setData({ ...data, in_scope: data.in_scope.filter((_, i) => i !== idx) });
  };

  const handleRemoveOutScope = (idx) => {
    setData({ ...data, out_scope: data.out_scope.filter((_, i) => i !== idx) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(data);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-heading font-bold">Project Scope</h2>
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit Scope
          </Button>
        </div>

        {data.overview && (
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-2">Overview</h3>
            <p className="text-sm text-muted-foreground">{data.overview}</p>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-4 border-green-200">
            <h3 className="font-semibold text-sm mb-3 text-green-700">In Scope</h3>
            <ul className="space-y-2">
              {data.in_scope.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            {data.in_scope.length === 0 && (
              <p className="text-xs text-muted-foreground">No items defined</p>
            )}
          </Card>

          <Card className="p-4 border-red-200">
            <h3 className="font-semibold text-sm mb-3 text-red-700">Out of Scope</h3>
            <ul className="space-y-2">
              {data.out_scope.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  {item}
                </li>
              ))}
            </ul>
            {data.out_scope.length === 0 && (
              <p className="text-xs text-muted-foreground">No items defined</p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-bold">Edit Project Scope</h2>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Scope Overview</label>
            <Textarea
              placeholder="High-level description of project scope"
              value={data.overview}
              onChange={(e) => setData({ ...data, overview: e.target.value })}
              className="min-h-24"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">In Scope</label>
            <div className="space-y-2 mb-3">
              {data.in_scope.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-sm flex-1">{item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveInScope(idx)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add in-scope item"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInScope())}
              />
              <Button type="button" onClick={handleAddInScope} className="gap-2">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Out of Scope</label>
            <div className="space-y-2 mb-3">
              {data.out_scope.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-sm flex-1">{item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveOutScope(idx)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add out-of-scope item"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOutScope())}
              />
              <Button type="button" onClick={handleAddOutScope} className="gap-2">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Scope</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}