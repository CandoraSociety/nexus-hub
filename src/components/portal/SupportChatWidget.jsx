import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const startConversation = async () => {
    setStarting(true);
    const conv = await base44.agents.createConversation({
      agent_name: "support_agent",
      metadata: { name: "Support Chat" }
    });
    setConversation(conv);
    setMessages(conv.messages || []);
    setStarting(false);

    base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages([...data.messages]);
    });
  };

  const handleOpen = () => {
    setOpen(true);
    if (!conversation) startConversation();
  };

  const sendMessage = async () => {
    if (!input.trim() || sending || !conversation) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    await base44.agents.addMessage(conversation, { role: "user", content: text });
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      {open && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden" style={{ height: "520px" }}>
          {/* Header */}
          <div className="bg-amber-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-white" />
              <div>
                <p className="text-white font-semibold text-sm">Support Assistant</p>
                <p className="text-amber-100 text-xs">Typically replies instantly</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:text-amber-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {starting && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Starting chat...
              </div>
            )}

            {messages.length === 0 && !starting && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                <p className="font-medium mb-1">👋 Hi! How can I help?</p>
                <p className="text-gray-500 text-xs">Ask me about your ticket order, an event, refunds, or how to list your event.</p>
              </div>
            )}

            {messages.map((msg, i) => {
              if (!msg.content && !msg.tool_calls?.length) return null;
              const isUser = msg.role === "user";
              return (
                <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    isUser
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {msg.content && (
                      <ReactMarkdown
                        className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          p: ({ children }) => <p className="my-0.5">{children}</p>,
                          a: ({ children, ...props }) => <a {...props} className="underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    {msg.tool_calls?.some(t => t.status === "running" || t.status === "in_progress") && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Looking that up...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message..."
              disabled={sending || starting}
              className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={sending || starting || !input.trim()}
              className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 text-white shadow-lg flex items-center justify-center transition-all"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}