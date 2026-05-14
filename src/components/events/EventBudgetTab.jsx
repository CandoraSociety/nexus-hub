import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, DollarSign } from 'lucide-react';

const BUDGET_CATEGORIES = ['Venue', 'Catering & Food', 'Marketing & Design', 'A/V & Technology', 'Staffing', 'Entertainment', 'Decor', 'Printing', 'Transportation', 'Contingency', 'Other'];

export default function EventBudgetTab({ event, onSave }) {
  const [form, setForm] = useState({ category: '', description: '', estimated: '', actual: '', paid: false });
  const [showForm, setShowForm] = useState(false);
  const [editingTotal, setEditingTotal] = useState(false);
  const [totalVal, setTotalVal] = useState('');

  const items = event.budget_items || [];

  const addItem = () => {
    if (!form.category) return;
    const item = {
      ...form,
      estimated: form.estimated ? Number(form.estimated) : 0,
      actual: form.actual ? Number(form.actual) : undefined,
    };
    if (!item.actual) delete item.actual;
    onSave({ budget_items: [...items, item] });
    setForm({ category: '', description: '', estimated: '', actual: '', paid: false });
    setShowForm(false);
  };

  const removeItem = (i) => {
    onSave({ budget_items: items.filter((_, idx) => idx !== i) });
  };

  const togglePaid = (i) => {
    const updated = items.map((item, idx) => idx === i ? { ...item, paid: !item.paid } : item);
    onSave({ budget_items: updated });
  };

  const saveTotalBudget = () => {
    const val = totalVal === '' ? undefined : Number(totalVal);
    if (val !== undefined && isNaN(val)) return;
    const update = {};
    if (val === undefined) { /* no budget field */ } else update.budget = val;
    onSave(update);
    setEditingTotal(false);
  };

  const totalEstimated = items.reduce((sum, i) => sum + (i.estimated || 0), 0);
  const totalActual = items.reduce((sum, i) => sum + (i.actual || i.estimated || 0), 0);
  const remaining = (event.budget || 0) - totalEstimated;

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-accent/5 border-accent/20">
        <p className="text-sm font-medium text-accent">💰 Budget Planning</p>
        <p className="text-xs text-muted-foreground mt-1">Break your budget into line items by category. Include a contingency line (typically 10–15% of total). Track estimated vs. actual spend as the event approaches.</p>
      </Card>

      {/* Total budget summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
          {editingTotal ? (
            <div className="flex gap-2">
              <Input type="number" value={totalVal} onChange={e => setTotalVal(e.target.value)} autoFocus className="h-8 text-sm" placeholder="e.g. 5000" />
              <Button size="sm" onClick={saveTotalBudget}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditingTotal(false)}>✕</Button>
            </div>
          ) : (
            <p className="text-2xl font-bold cursor-pointer hover:text-primary" onClick={() => { setEditingTotal(true); setTotalVal(event.budget || ''); }}>
              {event.budget ? `$${Number(event.budget).toLocaleString()}` : <span className="text-base text-muted-foreground italic">Set budget</span>}
            </p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Estimated Spend</p>
          <p className={`text-2xl font-bold ${items.length > 0 && event.budget && totalEstimated > event.budget ? 'text-destructive' : 'text-foreground'}`}>
            ${totalEstimated.toLocaleString()}
          </p>
          {items.length > 0 && event.budget && (
            <p className={`text-xs mt-1 ${remaining < 0 ? 'text-destructive' : 'text-green-600'}`}>
              {remaining < 0 ? `$${Math.abs(remaining).toLocaleString()} over budget` : `$${remaining.toLocaleString()} remaining`}
            </p>
          )}
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Actual Spend</p>
          <p className="text-2xl font-bold">${totalActual.toLocaleString()}</p>
          {items.some(i => i.actual) && <p className="text-xs text-muted-foreground mt-1">Based on actuals + estimates</p>}
        </Card>
      </div>

      {/* Line items */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2"><DollarSign className="w-4 h-4" /> Budget Line Items</h3>
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="gap-1 text-xs">
            <Plus className="w-3 h-3" /> Add Item
          </Button>
        </div>

        {showForm && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue placeholder="Category *" /></SelectTrigger>
                <SelectContent>
                  {BUDGET_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Input type="number" placeholder="Estimated $" value={form.estimated} onChange={e => setForm({ ...form, estimated: e.target.value })} />
              <Input type="number" placeholder="Actual $ (if known)" value={form.actual} onChange={e => setForm({ ...form, actual: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addItem}>Add</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">No budget items yet. Add line items to track your spend.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">Category</th>
                  <th className="text-left py-2 text-xs text-muted-foreground font-medium">Description</th>
                  <th className="text-right py-2 text-xs text-muted-foreground font-medium">Estimated</th>
                  <th className="text-right py-2 text-xs text-muted-foreground font-medium">Actual</th>
                  <th className="text-center py-2 text-xs text-muted-foreground font-medium">Paid</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/20 group">
                    <td className="py-2 font-medium text-xs">{item.category}</td>
                    <td className="py-2 text-xs text-muted-foreground">{item.description || '—'}</td>
                    <td className="py-2 text-right text-xs">${(item.estimated || 0).toLocaleString()}</td>
                    <td className="py-2 text-right text-xs">{item.actual != null ? `$${Number(item.actual).toLocaleString()}` : '—'}</td>
                    <td className="py-2 text-center">
                      <button onClick={() => togglePaid(i)} className="text-xs">
                        {item.paid ? '✅' : '○'}
                      </button>
                    </td>
                    <td className="py-2">
                      <button onClick={() => removeItem(i)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/30">
                  <td colSpan={2} className="py-2 pl-2 text-xs font-bold">Total</td>
                  <td className="py-2 text-right text-xs font-bold">${totalEstimated.toLocaleString()}</td>
                  <td className="py-2 text-right text-xs font-bold">${totalActual.toLocaleString()}</td>
                  <td colSpan={2}></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}