import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Megaphone } from 'lucide-react';

const CHANNEL_OPTIONS = ['Email', 'Social Media', 'Website', 'Flyers / Print', 'Press Release', 'Word of Mouth', 'SMS / Text', 'Radio', 'Partner Orgs', 'Direct Mail', 'Other'];

export default function EventMarketingTab({ event, onSave }) {
  const plan = event.marketing_plan || {};
  const channels = plan.channels || [];

  const updatePlan = (field, value) => {
    onSave({ marketing_plan: { ...plan, [field]: value } });
  };

  const toggleChannel = (ch) => {
    const updated = channels.includes(ch)
      ? channels.filter(c => c !== ch)
      : [...channels, ch];
    updatePlan('channels', updated);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-accent/5 border-accent/20">
        <p className="text-sm font-medium text-accent">📣 Marketing & Outreach</p>
        <p className="text-xs text-muted-foreground mt-1">A solid marketing plan drives attendance. Define your audience, key messages, and which channels you'll use to promote the event.</p>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2"><Megaphone className="w-4 h-4" /> Marketing Strategy</h3>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Marketing Goals</label>
          <Textarea
            placeholder="What do you want to achieve? (e.g. 200 RSVPs, raise brand awareness, engage 5 community partners)"
            value={plan.goals || ''}
            onChange={e => updatePlan('goals', e.target.value)}
            className="min-h-16"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Target Audience</label>
          <Textarea
            placeholder="Who are you trying to reach? (demographics, geography, interests, existing contacts)"
            value={plan.target_audience || ''}
            onChange={e => updatePlan('target_audience', e.target.value)}
            className="min-h-16"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-2 block">Promotion Channels</label>
          <div className="flex flex-wrap gap-2">
            {CHANNEL_OPTIONS.map(ch => (
              <button
                key={ch}
                onClick={() => toggleChannel(ch)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${channels.includes(ch) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Key Messages</label>
          <Textarea
            placeholder="Core messaging and talking points for all promotional materials"
            value={plan.key_messages || ''}
            onChange={e => updatePlan('key_messages', e.target.value)}
            className="min-h-16"
          />
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-sm">Channel-Specific Plans</h3>

        {channels.includes('Email') && (
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Email Campaign Plan</label>
            <Textarea
              placeholder="Email sequence, send dates, list segments, key subject lines..."
              value={plan.email_plan || ''}
              onChange={e => updatePlan('email_plan', e.target.value)}
              className="min-h-16"
            />
          </div>
        )}

        {channels.includes('Social Media') && (
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Social Media Plan</label>
            <Textarea
              placeholder="Platforms, posting schedule, hashtags, paid ads, influencer outreach..."
              value={plan.social_media_plan || ''}
              onChange={e => updatePlan('social_media_plan', e.target.value)}
              className="min-h-16"
            />
          </div>
        )}

        {channels.includes('Press Release') && (
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 block">Press & Media Outreach</label>
            <Textarea
              placeholder="Media contacts, press release details, embargo dates, media kit notes..."
              value={plan.press_outreach || ''}
              onChange={e => updatePlan('press_outreach', e.target.value)}
              className="min-h-16"
            />
          </div>
        )}

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Promotional Items & Swag</label>
          <Textarea
            placeholder="Branded items, giveaways, signage, collateral needed..."
            value={plan.promotional_items || ''}
            onChange={e => updatePlan('promotional_items', e.target.value)}
            className="min-h-16"
          />
        </div>
      </Card>
    </div>
  );
}