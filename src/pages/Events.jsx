import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar as CalIcon, Search, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import EventForm from '@/components/events/EventForm';
import { Link } from 'react-router-dom';

export default function Events() {
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.update(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowForm(false);
      setEditingEvent(null);
    },
  });

  const now = new Date();
  const filtered = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const eventDate = new Date(e.start_date);
    const isUpcoming = eventDate > now;
    const matchesTime = timeFilter === 'all' || (timeFilter === 'upcoming' ? isUpcoming : !isUpcoming);
    return matchesSearch && matchesTime;
  });

  const statusColors = {
    planning: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-heading font-bold">Events</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Event
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <EventForm
          event={editingEvent}
          onSubmit={(data) => {
            if (editingEvent) {
              updateMutation.mutate({ id: editingEvent.id, ...data });
            } else {
              createMutation.mutate(data);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingEvent(null);
          }}
        />
      )}

      {/* Search */}
      <div className="flex gap-3 flex-col md:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeFilter === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('upcoming')}
          >
            Upcoming
          </Button>
          <Button
            variant={timeFilter === 'past' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('past')}
          >
            Past
          </Button>
          <Button
            variant={timeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setTimeFilter('all')}
          >
            All
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
          .map(event => (
            <Link key={event.id} to={`/events/${event.id}`}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CalIcon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-heading font-bold">{event.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(event.start_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <p className="text-sm text-muted-foreground mt-3 truncate">{event.location}</p>
                )}

                <div className="flex gap-2 mt-4">
                  <Badge className={statusColors[event.status || 'planning']}>
                    {event.status}
                  </Badge>
                  {event.expected_attendance && (
                    <Badge variant="outline" className="gap-1">
                      <Users className="w-3 h-3" /> {event.expected_attendance}
                    </Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No events found. Create one to get started!</p>
        </Card>
      )}
    </div>
  );
}