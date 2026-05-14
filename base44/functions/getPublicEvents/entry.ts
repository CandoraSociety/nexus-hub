import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all public events
    const events = await base44.asServiceRole.entities.Event.filter({ is_public: true });

    // For each event, fetch ticket types
    const ticketTypes = await base44.asServiceRole.entities.TicketType.list();

    const eventsWithTickets = events.map(event => ({
      ...event,
      ticket_types: ticketTypes.filter(tt => tt.event_id === event.id && tt.is_active)
    }));

    // Sort by start_date ascending
    eventsWithTickets.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    return Response.json({ events: eventsWithTickets });
  } catch (error) {
    console.error('getPublicEvents error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});