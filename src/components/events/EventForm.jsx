import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EventForm({ event, onSubmit, onCancel }) {
  const [data, setData] = useState(event || {
    name: '',
    description: '',
    event_type: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    location: '',
    expected_attendance: '',
    budget: '',
    is_recurring: false,
    recurrence_pattern: '',
    corporate_memory: '',
    checklist: [],
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
            placeholder="Event name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
            className="col-span-1 md:col-span-2"
          />
          <Select value={data.event_type} onValueChange={(v) => setData({ ...data, event_type: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="annual_org_event">Annual Org Event</SelectItem>
              <SelectItem value="external_public">External Public</SelectItem>
              <SelectItem value="internal_workshop">Internal Workshop</SelectItem>
              <SelectItem value="community_event">Community Event</SelectItem>
              <SelectItem value="training">Training</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={data.status} onValueChange={(v) => setData({ ...data, status: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="datetime-local"
            placeholder="Start date & time"
            value={data.start_date}
            onChange={(e) => setData({ ...data, start_date: e.target.value })}
            required
          />
          <Input
            type="datetime-local"
            placeholder="End date & time"
            value={data.end_date}
            onChange={(e) => setData({ ...data, end_date: e.target.value })}
          />
          <Input
            placeholder="Location"
            value={data.location}
            onChange={(e) => setData({ ...data, location: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Expected attendance"
            value={data.expected_attendance}
            onChange={(e) => setData({ ...data, expected_attendance: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Budget"
            value={data.budget}
            onChange={(e) => setData({ ...data, budget: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <Checkbox
              checked={data.is_recurring}
              onCheckedChange={(v) => setData({ ...data, is_recurring: v })}
            />
            <label className="text-sm font-medium">Recurring event</label>
          </div>
        </div>

        {data.is_recurring && (
          <Select value={data.recurrence_pattern} onValueChange={(v) => setData({ ...data, recurrence_pattern: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Recurrence pattern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Textarea
          placeholder="Description"
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="min-h-24"
        />

        <Textarea
          placeholder="Corporate memory - lessons learned, what worked, what didn't"
          value={data.corporate_memory}
          onChange={(e) => setData({ ...data, corporate_memory: e.target.value })}
          className="min-h-20"
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {event ? 'Update' : 'Create'} Event
          </Button>
        </div>
      </form>
    </Card>
  );
}