import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ClipboardList, Lightbulb, X } from 'lucide-react';

export default function AddProgramModal({ onChoice, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-8 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-heading font-bold mb-2">Add / Design Program</h2>
        <p className="text-muted-foreground mb-6">
          Is this a new program that requires program design?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onChoice('existing')}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
          >
            <ClipboardList className="w-10 h-10 text-secondary group-hover:text-primary" />
            <div>
              <p className="font-semibold text-sm">No — Existing Program</p>
              <p className="text-xs text-muted-foreground mt-1">
                Track metrics, gaps, deficiencies, and improvement plans for an existing program.
              </p>
            </div>
          </button>

          <button
            onClick={() => onChoice('design')}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
          >
            <Lightbulb className="w-10 h-10 text-accent group-hover:text-primary" />
            <div>
              <p className="font-semibold text-sm">Yes — Design New Program</p>
              <p className="text-xs text-muted-foreground mt-1">
                Plan and design a new program from scratch with vision, goals, resources, and implementation steps.
              </p>
            </div>
          </button>
        </div>
      </Card>
    </div>
  );
}