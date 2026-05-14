import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Mail, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const statusColors = {
  invited: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  attended: 'bg-purple-100 text-purple-800',
  no_show: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function EventAttendeesTab({ event, isNew, onSave }) {
  const [form, setForm] = useState({ name: '', email: '', organization: '', status: 'invited', notes: '' });
  const [showForm, setShowForm] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showEmailCompose, setShowEmailCompose] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const attendees = event.attendees || [];

  const addAttendee = () => {
    if (!form.name && !form.email) return;
    onSave({ attendees: [...attendees, { ...form }] });
    setForm({ name: '', email: '', organization: '', status: 'invited', notes: '' });
    setShowForm(false);
  };

  const removeAttendee = (i) => {
    onSave({ attendees: attendees.filter((_, idx) => idx !== i) });
  };

  const updateAttendeeStatus = (i, status) => {
    const updated = attendees.map((a, idx) => idx === i ? { ...a, status } : a);
    onSave({ attendees: updated });
  };

  const sendEmailToList = async () => {
    if (!emailSubject || !emailBody) return;
    const emailRecipients = attendees.filter(a => a.email && ['invited', 'confirmed'].includes(a.status));
    setSendingEmail(true);
    try {
      for (const attendee of emailRecipients) {
        await base44.integrations.Core.SendEmail({
          to: attendee.email,
          subject: emailSubject,
          body: emailBody.replace('{name}', attendee.name || 'Guest'),
        });
      }
      setEmailSent(true);
      setShowEmailCompose(false);
      setEmailSubject('');
      setEmailBody('');
      setTimeout(() => setEmailSent(false), 4000);
    } finally {
      setSendingEmail(false);
    }
  };

  const confirmedCount = attendees.filter(a => a.status === 'confirmed' || a.status === 'attended').length;
  const invitedCount = attendees.filter(a => a.status === 'invited').length;

  return (
    <div className="space-y-4">
      <Card className={`p-4 ${isNew ? 'bg-accent/5 border-accent/20' : 'bg-secondary/5 border-secondary/20'}`}>
        <p className="text-sm font-medium" style={{ color: isNew ? 'var(--accent)' : 'var(--secondary)' }}>👥 Attendee Management</p>
        <p className="text-xs text-muted-foreground mt-1">Track invitees, confirmations, and attendance. You can also email your list directly from here — use <code className="bg-muted px-1 rounded">{'{name}'}</code> in the body to personalize.</p>
      </Card>

      {/* Summary stats */}
      {attendees.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-primary">{attendees.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </Card>
          <Card className="p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{invitedCount}</p>
            <p className="text-xs text-muted-foreground">Invited</p>
          </Card>
        </div>
      )}

      {/* Attendee list */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Users className="w-4 h-4" /> Guest List</h3>
          <div className="flex gap-2">
            {attendees.some(a => a.email) && (
              <Button size="sm" variant="outline" onClick={() => setShowEmailCompose(true)} className="gap-1 text-xs">
                <Mail className="w-3 h-3" /> Email List
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="gap-1 text-xs">
              <Plus className="w-3 h-3" /> Add
            </Button>
          </div>
        </div>

        {showForm && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="Organization" value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} />
              <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="attended">Attended</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addAttendee}>Add Attendee</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {attendees.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">No attendees yet. Add guests to your list.</p>
        ) : (
          <div className="space-y-2">
            {attendees.map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 group">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                  {(a.name || a.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.name || '—'}</p>
                  <p className="text-xs text-muted-foreground truncate">{[a.email, a.organization].filter(Boolean).join(' · ')}</p>
                </div>
                <Select value={a.status} onValueChange={v => updateAttendeeStatus(i, v)}>
                  <SelectTrigger className="w-28 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invited">Invited</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="attended">Attended</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <button onClick={() => removeAttendee(i)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Email composer */}
      {showEmailCompose && (
        <Card className="p-5 space-y-3 border-primary/30">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Compose Email to Attendees</h3>
          <p className="text-xs text-muted-foreground">
            Will send to {attendees.filter(a => a.email && ['invited', 'confirmed'].includes(a.status)).length} invited/confirmed attendees with an email address.
          </p>
          <Input placeholder="Subject line" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
          <textarea
            className="w-full min-h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder={`Hi {name},\n\nWe're excited to invite you to ${event.name}...\n\nUse {name} to personalize the greeting.`}
            value={emailBody}
            onChange={e => setEmailBody(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={sendEmailToList} disabled={sendingEmail || !emailSubject || !emailBody}>
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowEmailCompose(false)}>Cancel</Button>
          </div>
        </Card>
      )}
      {emailSent && (
        <Card className="p-3 bg-green-50 border-green-200">
          <p className="text-sm text-green-700 font-medium">✓ Emails sent successfully!</p>
        </Card>
      )}
    </div>
  );
}