import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const STATUS_COLORS = {
  planning: 'bg-blue-100 text-blue-800 border-blue-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  completed: 'bg-gray-100 text-gray-800 border-gray-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const DOT_COLORS = {
  planning: 'bg-blue-400',
  confirmed: 'bg-green-400',
  in_progress: 'bg-purple-400',
  completed: 'bg-gray-400',
  cancelled: 'bg-red-400',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function EventsCalendar() {
  const navigate = useNavigate();
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-start_date', 200),
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Build calendar grid (6 weeks)
  const cells = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, currentMonth: false, date: new Date(year, month - 1, daysInPrevMonth - i) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) });
  }
  while (cells.length < 42) {
    const d = cells.length - firstDayOfMonth - daysInMonth + 1;
    cells.push({ day: d, currentMonth: false, date: new Date(year, month + 1, d) });
  }

  const getEventsForDate = (date) => {
    return events.filter(e => {
      if (!e.start_date) return false;
      const eventDate = new Date(e.start_date);
      return eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate();
    });
  };

  const selectedDayEvents = selectedDay ? getEventsForDate(selectedDay) : [];

  const isToday = (date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const isSelected = (date) =>
    selectedDay &&
    date.getFullYear() === selectedDay.getFullYear() &&
    date.getMonth() === selectedDay.getMonth() &&
    date.getDate() === selectedDay.getDate();

  // Upcoming events (next 30 days)
  const upcomingEvents = events
    .filter(e => {
      if (!e.start_date) return false;
      const d = new Date(e.start_date);
      const diff = (d - today) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 60;
    })
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Events Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">{events.length} events total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/events')} className="gap-2">
            <Calendar className="w-4 h-4" /> List View
          </Button>
          <Button onClick={() => navigate('/events')} className="gap-2">
            <Plus className="w-4 h-4" /> Add Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-5">
              <Button variant="ghost" size="icon" onClick={() => setViewDate(new Date(year, month - 1, 1))}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-heading font-bold">{MONTHS[month]} {year}</h2>
              <Button variant="ghost" size="icon" onClick={() => setViewDate(new Date(year, month + 1, 1))}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {cells.map((cell, i) => {
                const dayEvents = getEventsForDate(cell.date);
                const selected = isSelected(cell.date);
                const todayCell = isToday(cell.date);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDay(cell.date)}
                    className={`min-h-[72px] p-1.5 rounded-lg text-left transition-all border ${
                      selected
                        ? 'bg-primary/10 border-primary'
                        : todayCell
                        ? 'bg-primary/5 border-primary/30'
                        : 'border-transparent hover:bg-muted/50 hover:border-border'
                    } ${!cell.currentMonth ? 'opacity-35' : ''}`}
                  >
                    <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                      todayCell ? 'bg-primary text-primary-foreground' : 'text-foreground'
                    }`}>
                      {cell.day}
                    </span>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((e, ei) => (
                        <div
                          key={ei}
                          className={`text-[10px] font-medium px-1 py-0.5 rounded truncate leading-tight ${STATUS_COLORS[e.status || 'planning']}`}
                        >
                          {e.name}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
              {Object.entries(DOT_COLORS).map(([status, cls]) => (
                <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className={`w-2.5 h-2.5 rounded-full ${cls}`} />
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar: Selected day + Upcoming */}
        <div className="space-y-4">
          {/* Selected Day Events */}
          {selectedDay && (
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">
                {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No events on this day.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map(e => (
                    <button
                      key={e.id}
                      onClick={() => navigate(`/events/${e.id}`)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm leading-tight">{e.name}</p>
                        <Badge className={`text-xs flex-shrink-0 ${STATUS_COLORS[e.status || 'planning']}`}>{e.status || 'planning'}</Badge>
                      </div>
                      {e.start_date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(e.start_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                          {e.end_date && ` – ${new Date(e.end_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}
                        </p>
                      )}
                      {e.location && <p className="text-xs text-muted-foreground">📍 {e.location}</p>}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Upcoming Events */}
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">Upcoming (Next 60 Days)</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No upcoming events.</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map(e => {
                  const eventDate = new Date(e.start_date);
                  const daysUntil = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                  return (
                    <button
                      key={e.id}
                      onClick={() => navigate(`/events/${e.id}`)}
                      className="w-full text-left p-2.5 rounded-lg hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 text-center">
                          <p className="text-xs text-muted-foreground">{MONTHS[eventDate.getMonth()].slice(0, 3)}</p>
                          <p className="text-lg font-bold leading-none">{eventDate.getDate()}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{e.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                            {e.location && ` · ${e.location}`}
                          </p>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${DOT_COLORS[e.status || 'planning']}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}