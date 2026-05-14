import { Link } from "react-router-dom";
import SupportChatWidget from "@/components/portal/SupportChatWidget";
import { CheckCircle, Ticket, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(var(--primary-brand-rgb, 245 158 11), 0.05)' }}>
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-9 h-9 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You're registered!</h1>
        <p className="text-gray-500 mb-6">
          Your ticket purchase was successful. A confirmation will be sent to your email shortly.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Ticket className="w-4 h-4" style={{ color: 'var(--primary-brand, #f59e0b)' }} />
            <span>Tickets have been confirmed and reserved in your name.</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Mail className="w-4 h-4" style={{ color: 'var(--primary-brand, #f59e0b)' }} />
            <span>Check your inbox for your ticket confirmation.</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Calendar className="w-4 h-4" style={{ color: 'var(--primary-brand, #f59e0b)' }} />
            <span>Add the event to your calendar!</span>
          </div>
        </div>

        {sessionId && (
          <p className="text-xs text-gray-400 mb-6 font-mono">Ref: {sessionId.slice(-12)}</p>
        )}

        <Link to="/portal">
          <Button className="text-white w-full" style={{ backgroundColor: 'var(--primary-brand, #f59e0b)' }}>
            Browse More Events
          </Button>
        </Link>
      </div>
      <SupportChatWidget />
    </div>
  );
}