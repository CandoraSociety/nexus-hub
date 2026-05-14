import React from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, Palette } from 'lucide-react';
import { useState } from 'react';

const DESIGN_ASSETS = ['Logo / Branding', 'Event Banner', 'Social Media Graphics', 'Email Header', 'Flyer / Poster', 'Program / Agenda', 'Name Badges', 'Signage', 'Stage Backdrop', 'Presentation Slides', 'Thank You Cards', 'Photo Booth Props'];
const TONE_OPTIONS = ['Professional', 'Celebratory', 'Educational', 'Energetic', 'Warm & Welcoming', 'Formal', 'Casual & Fun', 'Inspiring', 'Intimate'];

export default function EventCreativeTab({ event, onSave }) {
  const brief = event.creative_brief || {};
  const [newAsset, setNewAsset] = useState('');

  const updateBrief = (field, value) => {
    onSave({ creative_brief: { ...brief, [field]: value } });
  };

  const toggleAsset = (asset) => {
    const current = brief.design_assets_needed || [];
    const updated = current.includes(asset) ? current.filter(a => a !== asset) : [...current, asset];
    updateBrief('design_assets_needed', updated);
  };

  const addCustomAsset = () => {
    if (!newAsset.trim()) return;
    const current = brief.design_assets_needed || [];
    updateBrief('design_assets_needed', [...current, newAsset.trim()]);
    setNewAsset('');
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-accent/5 border-accent/20">
        <p className="text-sm font-medium text-accent">🎨 Creative Brief</p>
        <p className="text-xs text-muted-foreground mt-1">Define the look, feel, and vibe of your event. A clear creative brief ensures all materials — digital and physical — tell a consistent story.</p>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2"><Palette className="w-4 h-4" /> Event Identity</h3>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Theme / Concept</label>
          <Input
            placeholder="e.g. 'Rooted in Community', 'Building Bridges 2026', 'Annual Gala: A Night of Impact'"
            value={brief.theme || ''}
            onChange={e => updateBrief('theme', e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-2 block">Tone & Vibe</label>
          <div className="flex flex-wrap gap-2">
            {TONE_OPTIONS.map(tone => (
              <button
                key={tone}
                onClick={() => updateBrief('tone', brief.tone === tone ? '' : tone)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${brief.tone === tone ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
              >
                {tone}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Color Palette & Branding</label>
          <Textarea
            placeholder="Primary colors, fonts, brand guidelines to follow, logo usage notes..."
            value={brief.color_palette || ''}
            onChange={e => updateBrief('color_palette', e.target.value)}
            className="min-h-16"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Branding Notes</label>
          <Textarea
            placeholder="How this event fits within the organization's brand, any special co-branding with sponsors or partners..."
            value={brief.branding_notes || ''}
            onChange={e => updateBrief('branding_notes', e.target.value)}
            className="min-h-16"
          />
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-sm">Design Assets Needed</h3>
        <div className="flex flex-wrap gap-2">
          {DESIGN_ASSETS.map(asset => {
            const selected = (brief.design_assets_needed || []).includes(asset);
            return (
              <button
                key={asset}
                onClick={() => toggleAsset(asset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selected ? 'bg-primary/10 text-primary border-primary/40' : 'border-border text-muted-foreground hover:border-primary/30'}`}
              >
                {selected ? '✓ ' : ''}{asset}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input placeholder="Add custom asset..." value={newAsset} onChange={e => setNewAsset(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomAsset()} className="text-sm" />
          <Button size="sm" variant="outline" onClick={addCustomAsset}><Plus className="w-4 h-4" /></Button>
        </div>
        {(brief.design_assets_needed || []).filter(a => !DESIGN_ASSETS.includes(a)).map((a, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg border border-primary/30">✓ {a}</span>
            <button onClick={() => updateBrief('design_assets_needed', (brief.design_assets_needed || []).filter(x => x !== a))}>
              <X className="w-3 h-3 hover:text-destructive" />
            </button>
          </div>
        ))}
      </Card>

      <Card className="p-5 space-y-4">
        <h3 className="font-semibold text-sm">Production & Experience</h3>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">A/V & Technology Requirements</label>
          <Textarea
            placeholder="Microphones, projectors, livestream, lighting rigs, screens, tech support needs..."
            value={brief.av_requirements || ''}
            onChange={e => updateBrief('av_requirements', e.target.value)}
            className="min-h-16"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Décor & Atmosphere</label>
          <Textarea
            placeholder="Centerpieces, floral, table settings, ambient lighting, furniture, layout vision..."
            value={brief.decor_notes || ''}
            onChange={e => updateBrief('decor_notes', e.target.value)}
            className="min-h-16"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground font-medium mb-1 block">Entertainment & Programming</label>
          <Textarea
            placeholder="Speakers, performers, DJ, MC, activities, agenda highlights..."
            value={brief.entertainment || ''}
            onChange={e => updateBrief('entertainment', e.target.value)}
            className="min-h-16"
          />
        </div>
      </Card>
    </div>
  );
}