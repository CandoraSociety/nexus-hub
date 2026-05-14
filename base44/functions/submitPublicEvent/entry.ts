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

    return Response.json({ success: true, submission_id: submission.id });
  } catch (error) {
    console.error('submitPublicEvent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});