import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, RefreshCw, Star } from 'lucide-react';

export default function AddEventModal({ onChoice, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-heading font-bold">Add / Plan an Event</h2>
          <button onClick={onCancel}>
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">What would you like to do?</p>

        <div className="space-y-3">
          <button
            onClick={() => onChoice('existing')}
            className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-secondary hover:bg-secondary/5 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-semibold">Track an Existing / Recurring Event</p>
                <p className="text-sm text-muted-foreground mt-0.5">Document and manage an event that already happens (e.g. annual gala, weekly meeting)</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onChoice('new')}
            className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 flex-shrink-0">
                <Star className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold">Plan a New Event</p>
                <p className="text-sm text-muted-foreground mt-0.5">Design and plan a brand new event from scratch with guided steps</p>
              </div>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}