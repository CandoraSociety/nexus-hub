import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CONTACT_FIELDS = [
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'organization', label: 'Organization' },
  { key: 'title', label: 'Title / Role' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zip', label: 'ZIP' },
  { key: 'notes', label: 'Notes' },
];

// Try to auto-match column header to a field
const autoMatch = (header) => {
  const h = header.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (h.includes('firstname') || h === 'first' || h === 'fname') return 'first_name';
  if (h.includes('lastname') || h === 'last' || h === 'lname') return 'last_name';
  if (h.includes('email') || h.includes('mail')) return 'email';
  if (h.includes('phone') || h.includes('mobile') || h.includes('cell') || h.includes('tel')) return 'phone';
  if (h.includes('org') || h.includes('company') || h.includes('employer') || h.includes('workplace')) return 'organization';
  if (h.includes('title') || h.includes('role') || h.includes('position')) return 'title';
  if (h.includes('city') || h.includes('town')) return 'city';
  if (h.includes('state') || h.includes('province')) return 'state';
  if (h.includes('zip') || h.includes('postal')) return 'zip';
  if (h.includes('note') || h.includes('comment') || h.includes('memo')) return 'notes';
  // "name" alone — treat as full name to split
  if (h === 'name' || h === 'fullname' || h === 'contactname') return '_full_name';
  return '';
};

export default function ContactImport({ onComplete, onCancel }) {
  const [step, setStep] = useState('upload'); // upload | map | preview | importing | done
  const [rawRows, setRawRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [preview, setPreview] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const schema = {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: { type: 'string' },
            }
          }
        }
      };
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema: schema });
      if (result.status !== 'success' || !result.output) {
        setError('Could not parse file. Make sure it is a valid Excel (.xlsx) or CSV file.');
        return;
      }
      const rows = result.output?.rows || (Array.isArray(result.output) ? result.output : []);
      if (rows.length === 0) { setError('No data rows found in file.'); return; }
      const cols = Object.keys(rows[0]);
      setHeaders(cols);
      setRawRows(rows);
      // Auto-map
      const auto = {};
      cols.forEach(col => { const m = autoMatch(col); if (m) auto[col] = m; });
      setMapping(auto);
      setStep('map');
    } catch (err) {
      setError('Failed to read file: ' + err.message);
    }
  };

  const buildPreview = () => {
    const built = rawRows.slice(0, 5).map(row => buildContact(row));
    setPreview(built);
    setStep('preview');
  };

  const buildContact = (row) => {
    const c = { source: 'import', is_subscribed: true, tags: [] };
    Object.entries(mapping).forEach(([col, field]) => {
      if (!field || field === 'ignore') return;
      const val = (row[col] || '').trim();
      if (!val) return;
      if (field === '_full_name') {
        const parts = val.split(/\s+/);
        c.first_name = parts[0] || '';
        c.last_name = parts.slice(1).join(' ') || '';
      } else {
        c[field] = val;
      }
    });
    return c;
  };

  const runImport = async () => {
    setStep('importing');
    let success = 0, failed = 0;
    for (const row of rawRows) {
      try {
        await base44.entities.Contact.create(buildContact(row));
        success++;
      } catch { failed++; }
    }
    setImportResult({ success, failed });
    setStep('done');
  };

  return (
    <Card className="p-6 mb-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold">Import Contacts from Excel / CSV</h2>
        <button onClick={onCancel}><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileRef.current.click()}>
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">Click to upload Excel (.xlsx) or CSV file</p>
            <p className="text-sm text-muted-foreground mt-1">We'll auto-detect column headers and map them to contact fields</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button variant="outline" onClick={onCancel} className="w-full">Cancel</Button>
        </div>
      )}

      {/* Step: Map columns */}
      {step === 'map' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found <strong>{rawRows.length}</strong> rows and <strong>{headers.length}</strong> columns. Map each column to a contact field (or "Ignore" to skip it).
          </p>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {headers.map(col => (
              <div key={col} className="flex items-center gap-3">
                <span className="text-sm font-medium w-40 flex-shrink-0 truncate" title={col}>{col}</span>
                <span className="text-muted-foreground text-xs">→</span>
                <Select value={mapping[col] || ''} onValueChange={v => setMapping({ ...mapping, [col]: v })}>
                  <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue placeholder="Ignore" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Ignore</SelectItem>
                    <SelectItem value="_full_name">Full Name (split into first/last)</SelectItem>
                    {CONTACT_FIELDS.map(f => <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground w-24 truncate flex-shrink-0">
                  e.g. "{rawRows[0]?.[col] || ''}"
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setStep('upload')}>Back</Button>
            <Button onClick={buildPreview}>Preview Import</Button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Preview of first 5 records. Ready to import <strong>{rawRows.length}</strong> contacts.</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  {CONTACT_FIELDS.filter(f => Object.values(mapping).includes(f.key) || Object.values(mapping).includes('_full_name')).map(f => (
                    <th key={f.key} className="text-left px-3 py-2 font-semibold text-muted-foreground">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {preview.map((c, i) => (
                  <tr key={i} className="hover:bg-muted/20">
                    {CONTACT_FIELDS.filter(f => Object.values(mapping).includes(f.key) || Object.values(mapping).includes('_full_name')).map(f => (
                      <td key={f.key} className="px-3 py-2">{c[f.key] || '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setStep('map')}>Back</Button>
            <Button onClick={runImport} className="gap-2"><Upload className="w-4 h-4" /> Import {rawRows.length} Contacts</Button>
          </div>
        </div>
      )}

      {/* Step: Importing */}
      {step === 'importing' && (
        <div className="py-12 text-center">
          <RefreshCw className="w-10 h-10 mx-auto mb-3 text-primary animate-spin" />
          <p className="font-medium">Importing contacts...</p>
          <p className="text-sm text-muted-foreground mt-1">Please don't close this window.</p>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && importResult && (
        <div className="py-8 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
          <p className="text-xl font-bold">{importResult.success} contacts imported!</p>
          {importResult.failed > 0 && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center">
              <AlertCircle className="w-4 h-4 text-orange-400" /> {importResult.failed} rows failed to import
            </p>
          )}
          <Button onClick={onComplete} className="mt-4">Done</Button>
        </div>
      )}
    </Card>
  );
}