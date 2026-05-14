import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Simple QR code URL via Google Charts API (no external dep needed)
function qrUrl(text) {
  return `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(text)}&choe=UTF-8`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { order_id } = await req.json();

    if (!order_id) {
      return Response.json({ error: 'order_id required' }, { status: 400 });
    }

    // Fetch order
    const orders = await base44.asServiceRole.entities.TicketOrder.filter({ id: order_id });
    const order = orders[0];
    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 });

    // Fetch event
    const events = await base44.asServiceRole.entities.Event.filter({ id: order.event_id });
    const event = events[0];

    // Fetch ticket type
    const ticketTypes = await base44.asServiceRole.entities.TicketType.filter({ id: order.ticket_type_id });
    const ticketType = ticketTypes[0];

    const confirmationCode = order.confirmation_code;
    const qrCodeUrl = qrUrl(confirmationCode);

    const eventDate = event?.start_date
      ? new Date(event.start_date).toLocaleDateString('en-CA', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZone: 'America/Edmonton'
        })
      : 'See event details';

    const emailBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f5f0;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#f59e0b,#f97316);padding:32px 32px 24px;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">You're going! 🎉</h1>
      <p style="color:#fef3c7;margin:8px 0 0;font-size:14px;">Your ticket confirmation is below.</p>
    </div>

    <!-- Event Info -->
    <div style="padding:28px 32px 0;">
      <h2 style="color:#1f2937;font-size:20px;margin:0 0 16px;">${event?.name || 'Your Event'}</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;width:90px;">📅 Date</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:500;">${eventDate}</td>
        </tr>
        ${event?.location ? `<tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">📍 Location</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:500;">${event.location}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">🎟 Ticket</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:500;">${ticketType?.name || 'General'} × ${order.quantity}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;">💳 Total Paid</td>
          <td style="padding:8px 0;color:#111827;font-size:13px;font-weight:500;">$${order.total_amount?.toFixed(2)} CAD</td>
        </tr>
      </table>
    </div>

    <!-- QR Code -->
    <div style="padding:24px 32px;text-align:center;">
      <div style="background:#f9fafb;border:2px dashed #d1d5db;border-radius:12px;padding:24px;display:inline-block;">
        <img src="${qrCodeUrl}" alt="Ticket QR Code" width="160" height="160" style="display:block;margin:0 auto 12px;" />
        <p style="margin:0;font-family:monospace;font-size:16px;font-weight:700;color:#1f2937;letter-spacing:2px;">${confirmationCode}</p>
        <p style="margin:6px 0 0;font-size:11px;color:#9ca3af;">Show this QR code at the door</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9f5f0;padding:20px 32px;border-top:1px solid #f3f4f6;">
      <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
        Questions? Reply to this email or use the chat support on our portal.<br>
        Platform fees are non-refundable. Ticket refunds are subject to organizer policy.
      </p>
    </div>
  </div>
</body>
</html>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: order.buyer_email,
      subject: `Your ticket to ${event?.name || 'the event'} — ${confirmationCode}`,
      body: emailBody,
      from_name: "Events Portal"
    });

    console.log(`Ticket confirmation sent to ${order.buyer_email} for order ${order_id}`);
    return Response.json({ success: true });

  } catch (error) {
    console.error('sendTicketConfirmation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});