import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

const PLATFORM_FEE_PERCENT = 5;    // 5%
const PLATFORM_FEE_FLAT = 1.50;    // $1.50 per ticket

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event_id, ticket_type_id, quantity, buyer_name, buyer_email, success_url, cancel_url } = await req.json();

    if (!event_id || !ticket_type_id || !quantity || !buyer_name || !buyer_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch event and ticket type
    const events = await base44.asServiceRole.entities.Event.filter({ id: event_id });
    const event = events[0];
    if (!event) return Response.json({ error: 'Event not found' }, { status: 404 });

    const ticketTypes = await base44.asServiceRole.entities.TicketType.filter({ id: ticket_type_id });
    const ticketType = ticketTypes[0];
    if (!ticketType) return Response.json({ error: 'Ticket type not found' }, { status: 404 });

    if (!ticketType.is_active) return Response.json({ error: 'Ticket type is not available' }, { status: 400 });

    const availableQty = (ticketType.quantity_total || 0) - (ticketType.quantity_sold || 0);
    if (quantity > availableQty) {
      return Response.json({ error: `Only ${availableQty} tickets remaining` }, { status: 400 });
    }

    // Use event-level fee config or defaults
    const feePercent = event.platform_fee_percent ?? PLATFORM_FEE_PERCENT;
    const feeFlat = event.platform_fee_flat ?? PLATFORM_FEE_FLAT;

    const unitPrice = ticketType.price;
    const feesPerTicket = (unitPrice * feePercent / 100) + feeFlat;
    const priceWithFees = unitPrice + feesPerTicket;
    const totalAmount = Math.round(priceWithFees * quantity * 100); // in cents
    const platformRevenue = Math.round(feesPerTicket * quantity * 100) / 100;

    // Create pending order record
    const confirmationCode = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const order = await base44.asServiceRole.entities.TicketOrder.create({
      event_id,
      ticket_type_id,
      buyer_name,
      buyer_email,
      quantity,
      unit_price: unitPrice,
      platform_fee_percent: feePercent,
      platform_fee_flat: feeFlat,
      total_amount: Math.round(priceWithFees * quantity * 100) / 100,
      platform_revenue: platformRevenue,
      status: 'pending',
      confirmation_code: confirmationCode
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      automatic_payment_methods: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `${event.name} — ${ticketType.name}`,
              description: ticketType.description || undefined,
            },
            unit_amount: Math.round(priceWithFees * 100),
          },
          quantity,
        },
      ],
      mode: 'payment',
      customer_email: buyer_email,
      success_url: success_url || `${req.headers.get('origin')}/portal/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/portal`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        order_id: order.id,
        event_id,
        ticket_type_id,
        buyer_name,
        buyer_email,
        confirmation_code: confirmationCode
      }
    });

    // Save stripe session id to order
    await base44.asServiceRole.entities.TicketOrder.update(order.id, {
      stripe_session_id: session.id
    });

    return Response.json({ checkout_url: session.url, order_id: order.id, session_id: session.id });
  } catch (error) {
    console.error('createTicketCheckout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});