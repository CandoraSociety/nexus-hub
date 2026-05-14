import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Users, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export default function PushToEventModal({ contacts, events, onClose }) {
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [status, setStatus] = useState('invited');
  const [pushing, setPushing] = useState(false);
  const [done, setDone] = useState(false);

  const upcomingEvents = events.filter(e => e.status !== 'cancelled' && e.status !== 'completed');

  const handlePush = async () => {
    if (!selectedEventId) return;
    setPushing(true);
    try {
      const event = await base44.entities.Event.get(selectedEventId);
      const existingAttendees = event.attendees || [];
      const existingEmails = new Set(existingAttendees.map(a => a.email).filter(Boolean));

      const newAttendees = contacts
        .filter(c => !c.email || !existingEmails.has(c.email))
        .map(c => ({
          name: [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email || 'Unknown',
          email: c.email || '',
          organization: c.organization || '',
          status,
          notes: '',
        }));

      await base44.entities.Event.update(selectedEventId, {
        attendees: [...existingAttendees, ...newAttendees],
      });

      // Update contact event_history
      for (const c of contacts) {
        const history = c.event_history || [];
        if (!history.includes(selectedEventId)) {
          await base44.entities.Contact.update(c.id, {
            event_history: [...history, selectedEventId],
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setDone(true);
    } finally {
      setPushing(false);
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Push to Event
          </h2>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
        </div>

        {done ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
            <p className="font-semibold">{contacts.length} contact{contacts.length !== 1 ? 's' : ''} added to</p>
            <p className="text-primary font-bold">{selectedEvent?.name}</p>
            <Button onClick={onClose} className="mt-2 w-full">Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Adding <strong>{contacts.length}</strong> contact{contacts.length !== 1 ? 's' : ''} to an event's attendee list.
            </p>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Select Event</label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger><SelectValue placeholder="Choose an event..." /></SelectTrigger>
                <SelectContent>
                  {upcomingEvents.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name} {e.start_date ? `· ${new Date(e.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Initial Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={handlePush} disabled={!selectedEventId || pushing} className="flex-1">
                {pushing ? 'Pushing...' : 'Push to Event'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}