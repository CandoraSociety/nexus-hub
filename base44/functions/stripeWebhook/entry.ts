import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    let event;
    if (webhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      const confirmationCode = session.metadata?.confirmation_code;

      if (orderId) {
        // Mark order as paid
        await base44.asServiceRole.entities.TicketOrder.update(orderId, {
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent
        });

        // Increment tickets sold on ticket type
        const orders = await base44.asServiceRole.entities.TicketOrder.filter({ id: orderId });
        if (orders[0]) {
          const order = orders[0];
          const ticketTypes = await base44.asServiceRole.entities.TicketType.filter({ id: order.ticket_type_id });
          if (ticketTypes[0]) {
            const tt = ticketTypes[0];
            await base44.asServiceRole.entities.TicketType.update(tt.id, {
              quantity_sold: (tt.quantity_sold || 0) + order.quantity
            });
          }
        }

        console.log(`Order ${orderId} marked as paid. Confirmation: ${confirmationCode}`);
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await base44.asServiceRole.entities.TicketOrder.update(orderId, { status: 'cancelled' });
        console.log(`Order ${orderId} cancelled (session expired)`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});