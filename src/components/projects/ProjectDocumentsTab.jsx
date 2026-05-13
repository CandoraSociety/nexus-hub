import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, FileText, Link as LinkIcon, Upload } from 'lucide-react';

export default function ProjectDocumentsTab({ documents, onCreateDocument, onDeleteDocument, cloudFolderId }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    document_type: 'other',
    description: '',
    file_url: '',
    cloud_link: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateDocument(formData);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      document_type: 'other',
      description: '',
      file_url: '',
      cloud_link: '',
    });
    setShowForm(false);
  };

  const typeLabels = {
    charter: 'Project Charter',
    scope: 'Scope Statement',
    plan: 'Project Plan',
    status_report: 'Status Report',
    risk_register: 'Risk Register',
    other: 'Other',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-heading font-bold">Project Documents</h2>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Document
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-muted/30">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Document title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <div>
              <label className="text-sm font-medium mb-2 block">Document Type</label>
              <Select value={formData.document_type} onValueChange={(v) => setFormData({ ...formData, document_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Document description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-20"
            />
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium mb-3">Add Link</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-2 block">Cloud Storage Link</label>
                  <Input
                    placeholder="https://drive.google.com/... or https://onedrive.com/..."
                    value={formData.cloud_link}
                    onChange={(e) => setFormData({ ...formData, cloud_link: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-2 block">File URL</label>
                  <Input
                    placeholder="Direct link to file"
                    value={formData.file_url}
                    onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit">Add Document</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {documents.map(doc => (
          <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-3 flex-1">
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {typeLabels[doc.document_type]}
                  </p>
                  {doc.description && (
                    <p className="text-sm text-muted-foreground mt-2">{doc.description}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    {doc.cloud_link && (
                      <a href={doc.cloud_link} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <LinkIcon className="w-3 h-3" />
                          Cloud Storage
                        </Button>
                      </a>
                    )}
                    {doc.file_url && (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <FileText className="w-3 h-3" />
                          View File
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteDocument(doc.id)}
                className="h-8 w-8 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
        {documents.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No documents uploaded yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}