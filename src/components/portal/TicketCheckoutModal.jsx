import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Ticket, User, Mail, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TicketCheckoutModal({ event, ticketType, onClose }) {
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const feePercent = event.platform_fee_percent ?? 5;
  const feeFlat = event.platform_fee_flat ?? 1.5;
  const unitPrice = ticketType.price;
  const feePerTicket = (unitPrice * feePercent / 100) + feeFlat;
  const priceWithFee = unitPrice + feePerTicket;
  const total = priceWithFee * quantity;

  const available = (ticketType.quantity_total || 999) - (ticketType.quantity_sold || 0);

  const handleCheckout = async () => {
    if (!buyerName.trim() || !buyerEmail.trim()) {
      setError("Please fill in your name and email.");
      return;
    }
    setError("");
    setLoading(true);

    const res = await base44.functions.invoke("createTicketCheckout", {
      event_id: event.id,
      ticket_type_id: ticketType.id,
      quantity,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      success_url: `${window.location.origin}/portal/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/portal/events/${event.id}`
    });

    if (res.data.checkout_url) {
      window.location.href = res.data.checkout_url;
    } else {
      setError(res.data.error || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Complete Your Order</h2>
            <p className="text-sm text-gray-500 mt-0.5">{event.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Ticket selection */}
          <div className="bg-amber-50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-1">
              <div className="font-medium text-gray-800 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-amber-500" />
                {ticketType.name}
              </div>
              <span className="font-semibold text-amber-600">${unitPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-500">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-medium w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(available, quantity + 1))}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Buyer info */}
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Full name"
                value={buyerName}
                onChange={e => setBuyerName(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Email address"
                type="email"
                value={buyerEmail}
                onChange={e => setBuyerEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Price breakdown */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{ticketType.name} × {quantity}</span>
              <span>${(unitPrice * quantity).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400 text-xs">
              <span>Service fees ({feePercent}% + ${feeFlat.toFixed(2)}/ticket)</span>
              <span>${(feePerTicket * quantity).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            className="w-full bg-amber-500 hover:bg-amber-600 text-white h-11"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {loading ? "Redirecting to payment..." : `Pay $${total.toFixed(2)}`}
          </Button>
          <p className="text-xs text-center text-gray-400">Powered by Stripe. Your payment is secure.</p>
        </div>
      </div>
    </div>
  );
}