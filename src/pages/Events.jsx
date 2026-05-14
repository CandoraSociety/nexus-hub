import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import AddEventModal from '@/components/events/AddEventModal';

const statusColors = {
  planning: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function Events() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.create(data),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate(`/events/${newEvent.id}`);
    },
  });

  const filtered = events.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleChoice = (mode) => {
    setShowModal(false);
    createMutation.mutate({ name: 'New Event', start_date: new Date().toISOString(), event_mode: mode });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Events</h1>
          <p className="text-muted-foreground text-sm mt-1">Plan and track organizational events</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Event
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No events yet</p>
          <p className="text-sm mt-1">Click "Add Event" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(event => (
            <Card
              key={event.id}
              className="p-5 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm leading-tight flex-1 mr-2">{event.name}</h3>
                <Badge className={statusColors[event.status || 'planning']}>{event.status || 'planning'}</Badge>
              </div>
              {event.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
              )}
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                {event.start_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-1">
                <Badge variant="outline" className={event.event_mode === 'new' ? 'text-accent border-accent text-xs' : 'text-secondary border-secondary text-xs'}>
                  {event.event_mode === 'new' ? '✦ New' : '✓ Existing'}
                </Badge>
                {event.is_recurring && <Badge variant="outline" className="text-xs">🔄 Recurring</Badge>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <AddEventModal
          onChoice={handleChoice}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}