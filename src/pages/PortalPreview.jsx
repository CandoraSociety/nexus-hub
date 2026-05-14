import React, { useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortalPreview() {
  const [key, setKey] = useState(0);
  const portalUrl = `${window.location.origin}/portal`;

  return (
    <div className="flex flex-col h-full -m-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="text-base font-semibold text-foreground">Portal Preview</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Live preview of the public-facing event portal</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setKey(k => k + 1)}>
            <RefreshCw className="w-4 h-4 mr-1" /> Refresh
          </Button>
          <Button
            size="sm"
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => window.open(portalUrl, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-1" /> Open Live Portal
          </Button>
        </div>
      </div>

      {/* iframe */}
      <iframe
        key={key}
        src={portalUrl}
        className="flex-1 w-full border-0"
        title="Public Portal Preview"
      />
    </div>
  );
}