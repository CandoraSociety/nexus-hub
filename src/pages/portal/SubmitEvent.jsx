import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Plus, Trash2, CheckCircle, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PLATFORM_FEE_PERCENT = 5;
const PLATFORM_FEE_FLAT = 1.50;

const CANADIAN_PROVINCES = [
  "AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"
];

const STEP_LABELS = ["Your Info", "Event Details", "Tickets & Fees", "Payout Info"];

export default function SubmitEvent() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");

  const [form, setForm] = useState({
    submitter_name: "",
    submitter_email: "",
    organization_name: "",
    organization_type: "business",
    website: "",
    event_name: "",
    event_description: "",
    event_type: "",
    start_date: "",
    end_date: "",
    location: "",
    expected_attendance: "",
    ticket_tiers: [],
    agreed_to_fee_structure: false,
    // Payout info (last step)
    billing_name: "",
    billing_address: "",
    billing_city: "",
    billing_state: "AB",
    billing_zip: "",
    billing_country: "CA",
    payout_transit: "",
    payout_institution: "",
    payout_account: "",
  });

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const addTier = () => {
    setForm(f => ({
      ...f,
      ticket_tiers: [...f.ticket_tiers, { name: "", price: "", quantity: "", description: "" }]
    }));
  };

  const updateTier = (i, field, value) => {
    setForm(f => {
      const tiers = [...f.ticket_tiers];
      tiers[i] = { ...tiers[i], [field]: value };
      return { ...f, ticket_tiers: tiers };
    });
  };

  const removeTier = (i) => {
    setForm(f => ({ ...f, ticket_tiers: f.ticket_tiers.filter((_, idx) => idx !== i) }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = {
      ...form,
      expected_attendance: form.expected_attendance ? Number(form.expected_attendance) : undefined,
      ticket_tiers: form.ticket_tiers.map(t => ({
        ...t,
        price: Number(t.price),
        quantity: Number(t.quantity)
      }))
    };
    const res = await base44.functions.invoke("submitPublicEvent", payload);
    if (res.data.success) {
      setSubmissionId(res.data.submission_id);
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(var(--primary-brand-rgb, 245 158 11), 0.05)' }}>
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Received!</h2>
          <p className="text-gray-500 mb-4">
            Thank you! We'll review your event and respond within 2–3 business days. Check your email for confirmation.
          </p>
          <p className="text-xs text-gray-400 mb-6">Submission ID: {submissionId}</p>
          <Link to="/portal">
            <Button className="text-white" style={{ backgroundColor: 'var(--primary-brand, #f59e0b)' }}>Back to Events Portal</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgba(var(--primary-brand-rgb, 245 158 11), 0.05)' }}>
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <Link to="/portal" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit Your Event</h1>
          <p className="text-gray-500">List your event on our community portal and sell tickets through our platform.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors text-white ${
                step >= s ? "" : "bg-gray-100 text-gray-400"
              }`}
              style={step >= s ? { backgroundColor: 'var(--primary-brand, #f59e0b)' } : {}}>
                {s}
              </div>
              {s < 4 && <div className={`h-0.5 w-8 ${step > s ? "" : "bg-gray-200"}`} style={step > s ? { backgroundColor: 'var(--primary-brand, #f59e0b)' } : {}} />}
            </div>
          ))}
          <div className="ml-2 text-sm text-gray-500 font-medium">{STEP_LABELS[step - 1]}</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* STEP 1: Your Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-4">Your Organization</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Your Name *</label>
                  <Input value={form.submitter_name} onChange={e => update("submitter_name", e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                  <Input type="email" value={form.submitter_email} onChange={e => update("submitter_email", e.target.value)} placeholder="you@org.com" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Organization Name</label>
                <Input value={form.organization_name} onChange={e => update("organization_name", e.target.value)} placeholder="Your org or company" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Organization Type</label>
                  <select
                    value={form.organization_type}
                    onChange={e => update("organization_type", e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="nonprofit">Nonprofit</option>
                    <option value="business">Business</option>
                    <option value="government">Government</option>
                    <option value="individual">Individual</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
                  <Input value={form.website} onChange={e => update("website", e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                    className="text-white"
                    style={{ backgroundColor: 'var(--primary-brand, #f59e0b)' }}
                    onClick={() => setStep(2)}
                    disabled={!form.submitter_name || !form.submitter_email}
                  >
                    Next: Event Details
                  </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Event Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-4">Event Details</h2>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Event Name *</label>
                <Input value={form.event_name} onChange={e => update("event_name", e.target.value)} placeholder="Name your event" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <textarea
                  value={form.event_description}
                  onChange={e => update("event_description", e.target.value)}
                  placeholder="Tell people what your event is about..."
                  rows={4}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Start Date & Time *</label>
                  <Input type="datetime-local" value={form.start_date} onChange={e => update("start_date", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">End Date & Time</label>
                  <Input type="datetime-local" value={form.end_date} onChange={e => update("end_date", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Location</label>
                  <Input value={form.location} onChange={e => update("location", e.target.value)} placeholder="Address or 'Online'" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Expected Attendance</label>
                  <Input type="number" value={form.expected_attendance} onChange={e => update("expected_attendance", e.target.value)} placeholder="Approx. number" />
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button
                  className="text-white"
                  style={{ backgroundColor: 'var(--primary-brand, #f59e0b)' }}
                  onClick={() => setStep(3)}
                  disabled={!form.event_name || !form.start_date}
                >
                  Next: Tickets & Fees
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Tickets & Fees */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-1">Ticket Tiers</h2>
              <p className="text-sm text-gray-500 mb-4">Add ticket types (e.g. General, VIP). Leave empty for a free event.</p>

              {form.ticket_tiers.map((tier, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Ticket Tier {i + 1}</span>
                    <button onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Name</label>
                      <Input value={tier.name} onChange={e => updateTier(i, "name", e.target.value)} placeholder="General" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Price (CAD)</label>
                      <Input type="number" value={tier.price} onChange={e => updateTier(i, "price", e.target.value)} placeholder="0.00" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Quantity</label>
                      <Input type="number" value={tier.quantity} onChange={e => updateTier(i, "quantity", e.target.value)} placeholder="100" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Description (optional)</label>
                    <Input value={tier.description} onChange={e => updateTier(i, "description", e.target.value)} placeholder="What's included?" />
                  </div>
                </div>
              ))}

              <Button variant="outline" onClick={addTier} className="w-full border-dashed">
                <Plus className="w-4 h-4 mr-2" /> Add Ticket Tier
              </Button>

              {/* Fee disclosure */}
              <div className="rounded-xl p-4 mt-2" style={{ backgroundColor: 'rgba(var(--primary-brand-rgb, 245 158 11), 0.1)', border: '1px solid rgba(var(--primary-brand-rgb, 245 158 11), 0.3)' }}>
                <h3 className="font-medium mb-2" style={{ color: 'var(--primary-brand, #f59e0b)' }}>Platform Fee Structure</h3>
                <p className="text-sm" style={{ color: 'rgba(var(--primary-brand-rgb, 245 158 11), 0.8)' }}>
                  For each ticket sold through our portal, a service fee of <strong>{PLATFORM_FEE_PERCENT}% + ${PLATFORM_FEE_FLAT.toFixed(2)} CAD/ticket</strong> will be added to the buyer's total. These fees are collected by the platform and do not come out of your revenue.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreed_to_fee_structure}
                  onChange={e => update("agreed_to_fee_structure", e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-sm text-gray-600">
                  I understand and agree to the platform fee structure described above.
                </span>
              </label>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button
                  className="text-white"
                  style={{ backgroundColor: 'var(--primary-brand, #f59e0b)' }}
                  onClick={() => setStep(4)}
                  disabled={!form.agreed_to_fee_structure}
                >
                  Next: Payout Info
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Payout Info */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="font-semibold text-gray-800 mb-1">Payout Information</h2>
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mt-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    This information is used to pay <strong>you</strong> your ticket revenue after each event. We collect from ticket buyers and remit your proceeds (minus platform fees) to your account. No charge is made to you at submission.
                  </p>
                </div>
              </div>

              {/* Legal / Contact */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Legal Name or Organization *</label>
                <Input value={form.billing_name} onChange={e => update("billing_name", e.target.value)} placeholder="As it appears on your bank account" />
              </div>

              {/* Address */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Street Address *</label>
                <Input value={form.billing_address} onChange={e => update("billing_address", e.target.value)} placeholder="123 Main St" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">City *</label>
                  <Input value={form.billing_city} onChange={e => update("billing_city", e.target.value)} placeholder="Calgary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Province *</label>
                  <select
                    value={form.billing_state}
                    onChange={e => update("billing_state", e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {CANADIAN_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Postal Code *</label>
                  <Input value={form.billing_zip} onChange={e => update("billing_zip", e.target.value)} placeholder="T2P 1J9" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Country</label>
                  <Input value={form.billing_country} onChange={e => update("billing_country", e.target.value)} />
                </div>
              </div>

              {/* Banking details */}
              <div className="border-t border-gray-100 pt-4 mt-2">
                <p className="text-sm font-medium text-gray-700 mb-3">Canadian Bank Account (for EFT payout)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Transit # (5 digits) *</label>
                    <Input
                      value={form.payout_transit}
                      onChange={e => update("payout_transit", e.target.value)}
                      placeholder="12345"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Institution # (3 digits) *</label>
                    <Input
                      value={form.payout_institution}
                      onChange={e => update("payout_institution", e.target.value)}
                      placeholder="001"
                      maxLength={3}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Account # *</label>
                    <Input
                      value={form.payout_account}
                      onChange={e => update("payout_account", e.target.value)}
                      placeholder="1234567"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Found on your cheque: transit (5 digits) → institution (3 digits) → account number. Your information is stored securely and used only for EFT payouts.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button
                  className="text-white"
                  style={{ backgroundColor: 'var(--primary-brand, #f59e0b)' }}
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    !form.billing_name ||
                    !form.billing_address ||
                    !form.billing_city ||
                    !form.billing_zip ||
                    !form.payout_transit ||
                    !form.payout_institution ||
                    !form.payout_account
                  }
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {submitting ? "Submitting..." : "Submit Event for Review"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}