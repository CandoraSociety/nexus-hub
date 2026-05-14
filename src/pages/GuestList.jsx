import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Upload, Mail, Users, Filter, X, ChevronDown, Tag, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ContactForm from '@/components/contacts/ContactForm';
import ContactImport from '@/components/contacts/ContactImport';
import PushToEventModal from '@/components/contacts/PushToEventModal';

const TAG_COLORS = {
  donor: 'bg-yellow-100 text-yellow-800',
  volunteer: 'bg-green-100 text-green-800',
  'board member': 'bg-purple-100 text-purple-800',
  'community partner': 'bg-blue-100 text-blue-800',
  sponsor: 'bg-orange-100 text-orange-800',
  staff: 'bg-gray-100 text-gray-800',
};

export default function GuestList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterSubscribed, setFilterSubscribed] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [showPushModal, setShowPushModal] = useState(false);
  const [showEmailCompose, setShowEmailCompose] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => base44.entities.Contact.list('-created_date', 500),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-start_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Contact.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contacts'] }); setShowForm(false); setEditingContact(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Contact.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contacts'] }); setShowForm(false); setEditingContact(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Contact.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  });

  // Collect all unique tags across contacts
  const allTags = [...new Set(contacts.flatMap(c => c.tags || []))].sort();

  const filtered = contacts.filter(c => {
    const name = `${c.first_name || ''} ${c.last_name || ''}`.toLowerCase();
    const matchSearch = !search ||
      name.includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.organization || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search);
    const matchTag = filterTag === 'all' || (c.tags || []).includes(filterTag);
    const matchSource = filterSource === 'all' || c.source === filterSource;
    const matchSub = filterSubscribed === 'all'
      || (filterSubscribed === 'yes' && c.is_subscribed !== false)
      || (filterSubscribed === 'no' && c.is_subscribed === false);
    return matchSearch && matchTag && matchSource && matchSub;
  });

  const toggleSelect = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c.id)));
  };

  const selectedContacts = contacts.filter(c => selected.has(c.id));

  const handleSubmit = (data) => {
    if (editingContact) updateMutation.mutate({ id: editingContact.id, data });
    else createMutation.mutate(data);
  };

  const sendBulkEmail = async () => {
    if (!emailSubject || !emailBody) return;
    const recipients = selectedContacts.filter(c => c.email && c.is_subscribed !== false);
    setSendingEmail(true);
    try {
      for (const c of recipients) {
        const name = [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Friend';
        await base44.integrations.Core.SendEmail({
          to: c.email,
          subject: emailSubject,
          body: emailBody.replace(/{name}/g, name),
        });
      }
      setEmailSent(true);
      setShowEmailCompose(false);
      setEmailSubject('');
      setEmailBody('');
      setSelected(new Set());
      setTimeout(() => setEmailSent(false), 4000);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-heading font-bold">Master Guest List</h1>
          <p className="text-muted-foreground text-sm mt-1">{contacts.length} contacts total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowImport(true)} className="gap-2">
            <Upload className="w-4 h-4" /> Import Excel
          </Button>
          <Button onClick={() => { setEditingContact(null); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Contact
          </Button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <ContactForm
          contact={editingContact}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingContact(null); }}
        />
      )}

      {/* Import */}
      {showImport && (
        <ContactImport
          onComplete={() => { setShowImport(false); queryClient.invalidateQueries({ queryKey: ['contacts'] }); }}
          onCancel={() => setShowImport(false)}
        />
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by name, email, org, phone..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Tags" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterSource} onValueChange={setFilterSource}>
            <SelectTrigger className="w-36"><SelectValue placeholder="All Sources" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="manual">Manual Entry</SelectItem>
              <SelectItem value="import">Imported</SelectItem>
              <SelectItem value="event_rsvp">Event RSVP</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterSubscribed} onValueChange={setFilterSubscribed}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Subscription" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="yes">Subscribed</SelectItem>
              <SelectItem value="no">Unsubscribed</SelectItem>
            </SelectContent>
          </Select>
          {(search || filterTag !== 'all' || filterSource !== 'all' || filterSubscribed !== 'all') && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterTag('all'); setFilterSource('all'); setFilterSubscribed('all'); }}>
              <X className="w-4 h-4 mr-1" /> Clear
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} shown</span>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <Card className="p-3 bg-primary/5 border-primary/30">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-primary">{selected.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => setShowPushModal(true)} className="gap-1">
              <Users className="w-3 h-3" /> Push to Event
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowEmailCompose(true)} className="gap-1">
              <Mail className="w-3 h-3" /> Email Selected
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              <X className="w-3 h-3" /> Clear selection
            </Button>
          </div>
        </Card>
      )}

      {/* Email Compose */}
      {showEmailCompose && (
        <Card className="p-5 space-y-3 border-primary/30">
          <h3 className="font-semibold text-sm flex items-center gap-2"><Send className="w-4 h-4 text-primary" /> Email {selectedContacts.filter(c => c.email).length} contacts</h3>
          <p className="text-xs text-muted-foreground">Use <code className="bg-muted px-1 rounded">{'{name}'}</code> to personalize. Only subscribed contacts with emails will receive it.</p>
          <Input placeholder="Subject line" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
          <textarea
            className="w-full min-h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Hi {name}, ..."
            value={emailBody}
            onChange={e => setEmailBody(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={sendBulkEmail} disabled={sendingEmail || !emailSubject || !emailBody}>
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

      {/* Contact Table */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading contacts...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{contacts.length === 0 ? 'No contacts yet' : 'No contacts match your filters'}</p>
          <p className="text-sm mt-1">{contacts.length === 0 ? 'Add contacts manually or import from Excel.' : 'Try adjusting your search or filters.'}</p>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded" />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide hidden md:table-cell">Organization</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Tags</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wide hidden xl:table-cell">Source</th>
                  <th className="w-20 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className={`hover:bg-muted/20 transition-colors ${selected.has(c.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {(c.first_name || c.last_name || c.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{[c.first_name, c.last_name].filter(Boolean).join(' ') || <span className="text-muted-foreground italic">No name</span>}</p>
                          {c.title && <p className="text-xs text-muted-foreground">{c.title}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">{c.email || '—'}</span>
                        {c.is_subscribed === false && <Badge className="bg-gray-100 text-gray-500 text-xs ml-1">unsub</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.organization || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{c.phone || '—'}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(c.tags || []).map(tag => (
                          <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium ${TAG_COLORS[tag] || 'bg-muted text-muted-foreground'}`}>{tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground capitalize hidden xl:table-cell">{(c.source || 'manual').replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="text-xs text-primary hover:underline" onClick={() => { setEditingContact(c); setShowForm(true); }}>Edit</button>
                        <button className="text-xs text-destructive hover:underline ml-2" onClick={() => { if (confirm('Delete this contact?')) deleteMutation.mutate(c.id); }}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Push to Event Modal */}
      {showPushModal && (
        <PushToEventModal
          contacts={selectedContacts}
          events={events}
          onClose={() => { setShowPushModal(false); setSelected(new Set()); }}
        />
      )}
    </div>
  );
}