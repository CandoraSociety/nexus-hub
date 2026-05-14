import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, Search, Tag, ArrowRight, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const STATUS_COLORS = {
  confirmed: "bg-green-100 text-green-700",
  planning: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-gray-100 text-gray-600",
};

export default function EventPortal() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("getPublicEvents", {});
    setEvents(res.data.events || []);
    setLoading(false);
  };

  const filtered = events.filter(e => {
    const matchSearch = !search ||
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.description?.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" ||
      (filter === "free" && e.ticket_types?.some(tt => tt.is_free || tt.price === 0)) ||
      (filter === "ticketed" && e.is_ticketed) ||
      (filter === "external" && e.is_external);
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Community Events Portal</h1>
          <p className="text-xl text-amber-100 mb-8">Discover and attend events happening in your community</p>
          <div className="max-w-xl mx-auto flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 bg-white text-gray-800 border-0 h-11"
              />
            </div>
            <Link to="/portal/submit">
              <Button variant="outline" className="h-11 border-white text-white hover:bg-white hover:text-amber-600 bg-transparent">
                Submit Event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-2 flex-wrap mb-8">
          {[
            { id: "all", label: "All Events" },
            { id: "ticketed", label: "Ticketed" },
            { id: "free", label: "Free" },
            { id: "external", label: "Community Orgs" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f.id
                  ? "bg-amber-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-amber-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">No events found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event }) {
  const cheapestTicket = event.ticket_types?.length > 0
    ? event.ticket_types.reduce((min, tt) => tt.price < min.price ? tt : min, event.ticket_types[0])
    : null;

  return (
    <Link to={`/portal/events/${event.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group-hover:-translate-y-0.5">
        {event.cover_image_url ? (
          <img src={event.cover_image_url} alt={event.name} className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-44 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-amber-300" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2">{event.name}</h3>
            {event.is_external && <Badge variant="outline" className="text-xs shrink-0">Community</Badge>}
          </div>
          {event.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
          )}
          <div className="space-y-1.5 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              {event.start_date ? format(new Date(event.start_date), "MMM d, yyyy · h:mm a") : "Date TBD"}
            </div>
            {event.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            {event.is_ticketed && cheapestTicket ? (
              <div className="flex items-center gap-1 text-amber-600 font-semibold text-sm">
                <Ticket className="w-4 h-4" />
                {cheapestTicket.price === 0 || cheapestTicket.is_free ? "Free" : `From $${cheapestTicket.price.toFixed(2)}`}
              </div>
            ) : (
              <span className="text-sm text-green-600 font-medium">Free / RSVP</span>
            )}
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}