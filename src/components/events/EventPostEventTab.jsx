import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, ClipboardCheck } from 'lucide-react';

export default function EventPostEventTab({ event, onSave }) {
  const post = event.post_event || {};
  const [newAction, setNewAction] = useState('');

  const updatePost = (field, value) => {
    onSave({ post_event: { ...post, [field]: value } });
  };

  const addFollowUp = () => {
    if (!newAction.trim()) return;
    const current = post.follow_up_actions || [];
    updatePost('follow_up_actions', [...current, newAction.trim()]);
    setNewAction('');
  };

  const removeFollowUp = (i) => {
    updatePost('follow_up_actions', (post.follow_up_actions || []).filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-secondary/5 border-secondary/20">
        <p className="text-sm font-medium text-secondary">📋 Post-Event Wrap-Up</p>
        <p className="text-xs text-muted-foreground mt-1">Complete this section after the event. This is your most valuable institutional memory — future teams will thank you for being thorough here.</p>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Event Outcomes</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Actual Attendance</label>
            <Input
              type="number"
              placeholder="How many actually attended?"
              value={event.actual_attendance || ''}
              onChange={e => {
                const val = e.target.value;
                onSave({ actual_attendance: val === '' ? undefined : Number(val) });
              }}
            />
            {event.expected_attendance && event.actual_attendance && (
              <p className="text-xs text-muted-foreground mt-1">
                Expected: {event.expected_attendance} · Actual: {event.actual_attendance} ·{' '}
                <span className={event.actual_attendance >= event.expected_attendance ? 'text-green-600' : 'text-orange-600'}>
                  {Math.round((event.actual_attendance / event.expected_attendance) * 100)}% of goal
                </span>
              </p>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Final Budget Spend</label>
            <Input
              type="number"
              placeholder="Total actual spend ($)"
              value={event.budget_spent || ''}
              onChange={e => {
                const val = e.target.value;
                onSave({ budget_spent: val === '' ? undefined : Number(val) });
              }}
            />
            {event.budget && event.budget_spent && (
              <p className="text-xs text-muted-foreground mt-1">
                Budget: ${Number(event.budget).toLocaleString()} · Spent: ${Number(event.budget_spent).toLocaleString()} ·{' '}
                <span className={event.budget_spent <= event.budget ? 'text-green-600' : 'text-destructive'}>
                  {event.budget_spent <= event.budget ? `$${(event.budget - event.budget_spent).toLocaleString()} under` : `$${(event.budget_spent - event.budget).toLocaleString()} over`}
                </span>
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Attendance & Engagement Notes</label>
          <Textarea
            placeholder="Who showed up? Key attendees, VIPs, unexpected turnout, audience engagement observations..."
            value={post.attendance_notes || ''}
            onChange={e => updatePost('attendance_notes', e.target.value)}
            className="min-h-20"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Feedback Summary</label>
          <Textarea
            placeholder="What did attendees say? Survey results, verbal feedback, complaints, compliments..."
            value={post.feedback_summary || ''}
            onChange={e => updatePost('feedback_summary', e.target.value)}
            className="min-h-20"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Budget & Financial Notes</label>
          <Textarea
            placeholder="Where did you come in vs budget? Any unexpected costs? Vendor issues?"
            value={post.budget_notes || ''}
            onChange={e => updatePost('budget_notes', e.target.value)}
            className="min-h-16"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Media Coverage</label>
          <Textarea
            placeholder="Press mentions, social media reach, photo/video recap, links to coverage..."
            value={post.media_coverage || ''}
            onChange={e => updatePost('media_coverage', e.target.value)}
            className="min-h-16"
          />
        </div>

        {post.sponsor_debrief !== undefined || event.budget ? (
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Sponsor / Funder Debrief</label>
            <Textarea
              placeholder="Sponsor recognition delivered, any reporting obligations, renewal conversations..."
              value={post.sponsor_debrief || ''}
              onChange={e => updatePost('sponsor_debrief', e.target.value)}
              className="min-h-16"
            />
          </div>
        ) : null}
      </Card>

      <Card className="p-5 space-y-3">
        <h3 className="font-semibold text-sm">Follow-Up Action Items</h3>
        <p className="text-xs text-muted-foreground">Tasks that need to happen after the event closes.</p>
        <div className="space-y-2">
          {(post.follow_up_actions || []).map((action, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2 text-sm group">
              <span className="flex-1">{action}</span>
              <button onClick={() => removeFollowUp(i)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add follow-up action..." value={newAction} onChange={e => setNewAction(e.target.value)} onKeyDown={e => e.key === 'Enter' && addFollowUp()} />
          <Button size="sm" variant="outline" onClick={addFollowUp}><Plus className="w-4 h-4" /></Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold text-sm mb-3">Institutional Memory / Lessons Learned</h3>
        <Textarea
          placeholder="What worked brilliantly? What would you do differently? Tips for the next organizer? Any vendor recommendations or warnings?"
          value={event.corporate_memory || ''}
          onChange={e => onSave({ corporate_memory: e.target.value })}
          className="min-h-32"
        />
      </Card>
    </div>
  );
}