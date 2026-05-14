import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const data = await req.json();

    const { submitter_name, submitter_email, event_name, start_date } = data;
    if (!submitter_name || !submitter_email || !event_name || !start_date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const submission = await base44.asServiceRole.entities.PublicEventSubmission.create({
      ...data,
      status: 'pending'
    });

    // Send confirmation email to submitter
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: submitter_email,
      subject: `Event Submission Received: ${event_name}`,
      body: `Hi ${submitter_name},\n\nThank you for submitting your event "${event_name}" to our portal.\n\nWe'll review your submission and get back to you within 2-3 business days.\n\nYour submission ID is: ${submission.id}\n\nThank you!`
    });

    return Response.json({ success: true, submission_id: submission.id });
  } catch (error) {
    console.error('submitPublicEvent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});