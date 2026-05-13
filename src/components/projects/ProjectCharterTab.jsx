import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit2 } from 'lucide-react';

export default function ProjectCharterTab({ project, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState({
    business_case: project.description || '',
    high_level_objectives: project.high_level_objectives || '',
    success_criteria: project.success_criteria || '',
    assumptions: project.assumptions || '',
    constraints: project.constraints || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(data);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-heading font-bold">Project Charter</h2>
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit Charter
          </Button>
        </div>

        <div className="grid gap-6">
          {[
            { title: 'Business Case', value: data.business_case },
            { title: 'High-Level Objectives', value: data.high_level_objectives },
            { title: 'Success Criteria', value: data.success_criteria },
            { title: 'Assumptions', value: data.assumptions },
            { title: 'Constraints', value: data.constraints },
          ].map((item, idx) => (
            <Card key={idx} className="p-4">
              <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {item.value || 'Not defined'}
              </p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-bold">Edit Project Charter</h2>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Business Case</label>
            <Textarea
              placeholder="Why is this project being undertaken?"
              value={data.business_case}
              onChange={(e) => setData({ ...data, business_case: e.target.value })}
              className="min-h-24"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">High-Level Objectives</label>
            <Textarea
              placeholder="What are the main objectives?"
              value={data.high_level_objectives}
              onChange={(e) => setData({ ...data, high_level_objectives: e.target.value })}
              className="min-h-24"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Success Criteria</label>
            <Textarea
              placeholder="How will we know the project is successful?"
              value={data.success_criteria}
              onChange={(e) => setData({ ...data, success_criteria: e.target.value })}
              className="min-h-24"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Assumptions</label>
            <Textarea
              placeholder="What assumptions are we making?"
              value={data.assumptions}
              onChange={(e) => setData({ ...data, assumptions: e.target.value })}
              className="min-h-20"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Constraints</label>
            <Textarea
              placeholder="What are the constraints (budget, time, resources)?"
              value={data.constraints}
              onChange={(e) => setData({ ...data, constraints: e.target.value })}
              className="min-h-20"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Charter</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}