import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';

const SUGGESTED_TAGS = ['donor', 'volunteer', 'board member', 'community partner', 'sponsor', 'staff', 'alumni', 'media', 'vendor', 'VIP'];

export default function ContactForm({ contact, onSubmit, onCancel }) {
  const [data, setData] = useState(contact || {
    first_name: '', last_name: '', email: '', phone: '',
    organization: '', title: '', address: '', city: '', state: '', zip: '',
    tags: [], notes: '', is_subscribed: true, source: 'manual',
  });
  const [newTag, setNewTag] = useState('');

  const addTag = (tag) => {
    const t = tag.trim().toLowerCase();
    if (!t || (data.tags || []).includes(t)) return;
    setData({ ...data, tags: [...(data.tags || []), t] });
    setNewTag('');
  };

  const removeTag = (t) => setData({ ...data, tags: data.tags.filter(x => x !== t) });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <Card className="p-6 mb-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold">{contact ? 'Edit Contact' : 'New Contact'}</h2>
        <button onClick={onCancel}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="First name" value={data.first_name} onChange={e => setData({ ...data, first_name: e.target.value })} />
          <Input placeholder="Last name" value={data.last_name} onChange={e => setData({ ...data, last_name: e.target.value })} />
          <Input type="email" placeholder="Email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} />
          <Input placeholder="Phone" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} />
          <Input placeholder="Organization" value={data.organization} onChange={e => setData({ ...data, organization: e.target.value })} />
          <Input placeholder="Title / Role" value={data.title} onChange={e => setData({ ...data, title: e.target.value })} />
          <Input placeholder="City" value={data.city} onChange={e => setData({ ...data, city: e.target.value })} />
          <Input placeholder="State" value={data.state} onChange={e => setData({ ...data, state: e.target.value })} />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(data.tags || []).map(t => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {t}
                <button type="button" onClick={() => removeTag(t)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {SUGGESTED_TAGS.filter(t => !(data.tags || []).includes(t)).map(t => (
              <button key={t} type="button" onClick={() => addTag(t)} className="px-2 py-1 border border-dashed border-border rounded-full text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                + {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Custom tag..." value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))} className="text-sm" />
            <Button type="button" size="icon" variant="outline" onClick={() => addTag(newTag)}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>

        <Textarea placeholder="Notes" value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} className="min-h-16" />

        <div className="flex items-center gap-2">
          <input type="checkbox" id="subscribed" checked={data.is_subscribed !== false} onChange={e => setData({ ...data, is_subscribed: e.target.checked })} className="rounded" />
          <label htmlFor="subscribed" className="text-sm">Subscribed to email communications</label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{contact ? 'Save Changes' : 'Add Contact'}</Button>
        </div>
      </form>
    </Card>
  );
}