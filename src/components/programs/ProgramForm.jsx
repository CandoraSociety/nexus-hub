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
import { X } from 'lucide-react';

export default function ProgramForm({ program, onSubmit, onCancel }) {
  const [data, setData] = useState(program || {
    name: '',
    description: '',
    status: 'planning',
    category: '',
    start_date: '',
    end_date: '',
    budget: '',
    notes: '',
    participants: [],
    tags: [],
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
            placeholder="Program name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
            className="col-span-1 md:col-span-2"
          />
          <Input
            type="number"
            placeholder="Budget"
            value={data.budget}
            onChange={(e) => setData({ ...data, budget: e.target.value })}
          />
          <Select value={data.status} onValueChange={(v) => setData({ ...data, status: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={data.category} onValueChange={(v) => setData({ ...data, category: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
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
        </div>

        <Textarea
          placeholder="Description"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="min-h-24"
        />

        <Textarea
          placeholder="Notes and institutional memory"
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          className="min-h-20"
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {program ? 'Update' : 'Create'} Program
          </Button>
        </div>
      </form>
    </Card>
  );
}