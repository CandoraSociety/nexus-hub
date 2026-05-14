import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { MapPin, Calendar, Clock, ArrowLeft, Ticket, Users, Globe, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TicketCheckoutModal from "@/components/portal/TicketCheckoutModal";
import SupportChatWidget from "@/components/portal/SupportChatWidget";

export default function EventPortalDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    const res = await base44.functions.invoke("getPublicEvents", {});
    const found = (res.data.events || []).find(e => e.id === id);
    setEvent(found || null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 text-center px-4">
        <AlertCircle className="w-12 h-12 text-amber-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Event not found</h2>
        <Link to="/portal"><Button variant="outline">Back to Events</Button></Link>
      </div>
    );
  }

  const isInIframe = window !== window.parent;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <Link to="/portal" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>
      </div>

      {/* Cover */}
      {event.cover_image_url ? (
        <img src={event.cover_image_url} alt={event.name} className="w-full h-64 md:h-80 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gradient-to-r from-amber-400 to-orange-400" />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main */}
          <div className="md:col-span-2">
            <div className="flex flex-wrap gap-2 mb-3">
              {event.is_external && <Badge variant="outline">Community Event</Badge>}
              {event.event_type && <Badge variant="secondary" className="capitalize">{event.event_type.replace(/_/g, " ")}</Badge>}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.name}</h1>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <div className="font-medium">{format(new Date(event.start_date), "EEEE, MMMM d, yyyy")}</div>
                  <div className="text-gray-400">{format(new Date(event.start_date), "h:mm a")}
                    {event.end_date && ` – ${format(new Date(event.end_date), "h:mm a")}`}
                  </div>
                </div>
              </div>
              {event.location && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-amber-500 mt-0.5" />
                  <div>
                    <div className="font-medium">{event.location}</div>
                  </div>
                </div>
              )}
              {event.expected_attendance && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>Expected: ~{event.expected_attendance} attendees</span>
                </div>
              )}
              {event.organizer_name && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4 text-amber-500" />
                  <span>By {event.organizer_name}</span>
                </div>
              )}
            </div>

            {event.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">About this event</h2>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">{event.description}</p>
              </div>
            )}
          </div>

          {/* Ticket sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {event.is_ticketed ? "Get Tickets" : "Attend this Event"}
              </h2>

              {event.is_ticketed && event.ticket_types?.length > 0 ? (
                <div className="space-y-3">
                  {event.ticket_types.map(tt => {
                    const sold = tt.quantity_sold || 0;
                    const available = (tt.quantity_total || 0) - sold;
                    const isSoldOut = available <= 0;
                    return (
                      <div
                        key={tt.id}
                        onClick={() => !isSoldOut && setSelectedTicket(tt)}
                        className={`rounded-xl border-2 p-3 cursor-pointer transition-all ${
                          selectedTicket?.id === tt.id
                            ? "border-amber-400 bg-amber-50"
                            : isSoldOut
                            ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                            : "border-gray-100 hover:border-amber-200"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-sm text-gray-800">{tt.name}</div>
                            {tt.description && <div className="text-xs text-gray-400 mt-0.5">{tt.description}</div>}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-amber-600">
                              {tt.price === 0 || tt.is_free ? "Free" : `$${tt.price.toFixed(2)}`}
                            </div>
                            <div className="text-xs text-gray-400">
                              {isSoldOut ? "Sold out" : `${available} left`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {selectedTicket && (
                    <div className="text-xs text-gray-400 text-center">
                      +{event.platform_fee_percent ?? 5}% + ${(event.platform_fee_flat ?? 1.50).toFixed(2)} service fee per ticket
                    </div>
                  )}

                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                    disabled={!selectedTicket}
                    onClick={() => {
                      if (isInIframe) {
                        alert("Ticket checkout is only available from the published app.");
                        return;
                      }
                      setShowCheckout(true);
                    }}
                  >
                    <Ticket className="w-4 h-4 mr-2" />
                    {selectedTicket ? `Buy: ${selectedTicket.name}` : "Select a Ticket"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">🎉</div>
                  <p className="text-sm text-gray-500">This is a free event. Just show up!</p>
                  {event.organizer_email && (
                    <a href={`mailto:${event.organizer_email}`} className="text-sm text-amber-600 hover:underline mt-2 block">
                      Contact organizer
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SupportChatWidget />

      {showCheckout && selectedTicket && (
        <TicketCheckoutModal
          event={event}
          ticketType={selectedTicket}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}