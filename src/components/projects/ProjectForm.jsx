import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ProjectForm({ project, onSubmit, onCancel }) {
  const [data, setData] = useState(project || {
    name: '',
    description: '',
    project_type: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    end_date: '',
    budget: '',
    progress_percent: 0,
    lessons_learned: '',
    team_members: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <Card className="p-6 mb-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Project name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
            className="col-span-1 md:col-span-2"
          />
          <Select value={data.project_type} onValueChange={(v) => setData({ ...data, project_type: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Project Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="program_launch">Program Launch</SelectItem>
              <SelectItem value="operational_improvement">Operational Improvement</SelectItem>
              <SelectItem value="fundraising_grant">Fundraising/Grant</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={data.priority} onValueChange={(v) => setData({ ...data, priority: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={data.status} onValueChange={(v) => setData({ ...data, status: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="Start date"
            value={data.start_date}
            onChange={(e) => setData({ ...data, start_date: e.target.value })}
          />
          <Input
            type="date"
            placeholder="End date"
            value={data.end_date}
            onChange={(e) => setData({ ...data, end_date: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Budget"
            value={data.budget}
            onChange={(e) => setData({ ...data, budget: e.target.value })}
          />
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="Progress %"
            value={data.progress_percent}
            onChange={(e) => setData({ ...data, progress_percent: parseInt(e.target.value) })}
          />
        </div>

        <Textarea
          placeholder="Description"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="min-h-24"
        />

        <Textarea
          placeholder="Lessons learned"
          value={data.lessons_learned}
          onChange={(e) => setData({ ...data, lessons_learned: e.target.value })}
          className="min-h-20"
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {project ? 'Update' : 'Create'} Project
          </Button>
        </div>
      </form>
    </Card>
  );
}