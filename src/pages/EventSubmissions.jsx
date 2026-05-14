import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle, XCircle, Clock, Eye, ChevronDown, ChevronUp, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  needs_revision: { label: "Needs Revision", color: "bg-blue-100 text-blue-700", icon: Eye },
};

export default function EventSubmissions() {
  const [expanded, setExpanded] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [filter, setFilter] = useState("pending");
  const qc = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: () => base44.entities.PublicEventSubmission.list("-created_date", 100)
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PublicEventSubmission.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["submissions"] })
  });

  const createEventMutation = useMutation({
    mutationFn: async (submission) => {
      const event = await base44.entities.Event.create({
        name: submission.event_name,
        description: submission.event_description,
        event_type: "external_public",
        start_date: submission.start_date,
        end_date: submission.end_date,
        location: submission.location,
        expected_attendance: submission.expected_attendance,
        organizer_name: submission.organization_name || submission.submitter_name,
        organizer_email: submission.submitter_email,
        is_public: true,
        is_ticketed: submission.ticket_tiers?.length > 0,
        is_external: true,
        submission_id: submission.id,
        status: "confirmed",
        platform_fee_percent: 5,
        platform_fee_flat: 1.5
      });

      // Create ticket types
      for (const tier of (submission.ticket_tiers || [])) {
        await base44.entities.TicketType.create({
          event_id: event.id,
          name: tier.name,
          description: tier.description,
          price: Number(tier.price) || 0,
          quantity_total: Number(tier.quantity) || 100,
          quantity_sold: 0,
          is_free: Number(tier.price) === 0,
          is_active: true
        });
      }

      return event;
    },
    onSuccess: (event, submission) => {
      updateMutation.mutate({
        id: submission.id,
        data: { status: "approved", linked_event_id: event.id }
      });
    }
  });

  const handleAction = async (submission, action) => {
    if (action === "approved") {
      await createEventMutation.mutateAsync(submission);
    } else {
      updateMutation.mutate({
        id: submission.id,
        data: { status: action, admin_notes: adminNotes[submission.id] || "" }
      });
    }
  };

  const filtered = submissions.filter(s => filter === "all" || s.status === filter);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Event Submissions</h1>
        <p className="text-gray-500 text-sm mt-1">Review and approve external event submissions for the public portal</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "approved", "rejected", "needs_revision"].map(f => {
          const count = f === "all" ? submissions.length : submissions.filter(s => s.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                filter === f ? "bg-amber-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-amber-300"
              }`}
            >
              {f.replace(/_/g, " ")} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No {filter} submissions</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(sub => {
            const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            const isOpen = expanded === sub.id;
            return (
              <div key={sub.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                  className="flex items-start gap-4 p-5 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : sub.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{sub.event_name}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                        <Icon className="w-3 h-3" />{cfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {sub.organization_name || sub.submitter_name} · {sub.submitter_email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {sub.start_date ? format(new Date(sub.start_date), "MMM d, yyyy · h:mm a") : "No date"} · {sub.location || "No location"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{sub.created_date ? format(new Date(sub.created_date), "MMM d") : ""}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-50 px-5 pb-5 pt-4 space-y-4">
                    {/* Details */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs font-medium text-gray-400 uppercase mb-1">Submitter</div>
                        <p className="text-gray-700">{sub.submitter_name}</p>
                        <p className="text-gray-500">{sub.submitter_email}</p>
                        {sub.website && <a href={sub.website} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline text-xs inline-flex items-center gap-1">{sub.website} <ExternalLink className="w-3 h-3" /></a>}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-400 uppercase mb-1">Organization</div>
                        <p className="text-gray-700">{sub.organization_name || "—"}</p>
                        <p className="text-gray-500 capitalize">{sub.organization_type}</p>
                      </div>
                    </div>

                    {sub.event_description && (
                      <div>
                        <div className="text-xs font-medium text-gray-400 uppercase mb-1">Description</div>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{sub.event_description}</p>
                      </div>
                    )}

                    {sub.ticket_tiers?.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-400 uppercase mb-2">Ticket Tiers</div>
                        <div className="space-y-2">
                          {sub.ticket_tiers.map((t, i) => (
                            <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                              <span className="text-gray-700">{t.name}</span>
                              <div className="flex gap-4 text-gray-500 text-xs">
                                <span>${Number(t.price).toFixed(2)}</span>
                                <span>{t.quantity} tickets</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Admin notes */}
                    {sub.status === "pending" && (
                      <div>
                        <div className="text-xs font-medium text-gray-400 uppercase mb-1">Admin Notes (optional)</div>
                        <textarea
                          value={adminNotes[sub.id] || ""}
                          onChange={e => setAdminNotes(n => ({ ...n, [sub.id]: e.target.value }))}
                          placeholder="Add notes for rejection or revision..."
                          rows={2}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
                        />
                      </div>
                    )}

                    {sub.admin_notes && sub.status !== "pending" && (
                      <div>
                        <div className="text-xs font-medium text-gray-400 uppercase mb-1">Admin Notes</div>
                        <p className="text-sm text-gray-600">{sub.admin_notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {sub.status === "pending" && (
                      <div className="flex gap-3 pt-2">
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                          onClick={() => handleAction(sub, "approved")}
                          disabled={createEventMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve & Publish
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-600"
                          onClick={() => handleAction(sub, "needs_revision")}
                        >
                          Needs Revision
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600"
                          onClick={() => handleAction(sub, "rejected")}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {sub.status === "approved" && sub.linked_event_id && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Published to portal · <a href={`/portal/events/${sub.linked_event_id}`} className="underline">View event</a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}