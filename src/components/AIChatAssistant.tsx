"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bot, X, Send, Sparkles, Home, MapPin, ShoppingBag, Tent, Calendar, Users, ArrowRight, Search } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: QuickAction[];
}

interface QuickAction {
  label: string;
  path?: string;
  icon: React.ElementType;
  query?: string;
}

const quickActions: QuickAction[] = [
  { label: "Find Accommodation", path: "/accommodation", icon: MapPin },
  { label: "Browse Marketplace", path: "/marketplace", icon: ShoppingBag },
  { label: "See What's On", path: "/discover", icon: Tent },
  { label: "Join Communities", path: "/communities", icon: Users },
];

const suggestions = [
  "Find me a room near campus",
  "Show trending items",
  "What events are happening tonight?",
  "How do I sell my old phone?",
];

const responses: Record<string, { text: string; actions?: QuickAction[] }> = {
  apartment: {
    text: "I can help you find accommodation. Here are the best options right now.",
    actions: [
      { label: "View Listings", path: "/accommodation", icon: MapPin },
      { label: "Near UoN", path: "/accommodation", icon: MapPin, query: "UoN" },
    ],
  },
  room: {
    text: "Looking for a room? I found some great options near campus.",
    actions: [
      { label: "View Rooms", path: "/accommodation", icon: MapPin },
      { label: "Shared Apartments", path: "/accommodation", icon: Users, query: "shared" },
    ],
  },
  phone: {
    text: "Check out the latest phones and electronics on the marketplace.",
    actions: [
      { label: "Browse Phones", path: "/marketplace", icon: ShoppingBag, query: "phone" },
      { label: "Electronics", path: "/marketplace", icon: ShoppingBag, query: "electronics" },
    ],
  },
  buy: {
    text: "Ready to shop? Here are the most popular marketplace categories.",
    actions: [
      { label: "Electronics", path: "/marketplace", icon: ShoppingBag, query: "electronics" },
      { label: "Books", path: "/marketplace", icon: ShoppingBag, query: "books" },
      { label: "Free Items", path: "/marketplace", icon: ShoppingBag, query: "free" },
    ],
  },
  sell: {
    text: "Selling is easy. Head to the marketplace and create a listing in seconds.",
    actions: [{ label: "Create Listing", path: "/marketplace", icon: ShoppingBag }],
  },
  event: {
    text: "There is a lot happening on campus. Here is what is coming up.",
    actions: [
      { label: "Discover Events", path: "/discover", icon: Tent },
      { label: "Tonight", path: "/discover", icon: Calendar, query: "tonight" },
    ],
  },
  community: {
    text: "Join communities to meet students who share your interests.",
    actions: [
      { label: "Communities", path: "/communities", icon: Users },
      { label: "Tech Club", path: "/communities", icon: Sparkles, query: "tech" },
    ],
  },
};

function matchResponse(input: string): { text: string; actions?: QuickAction[] } | null {
  const lower = input.toLowerCase();
  for (const key of Object.keys(responses)) {
    if (lower.includes(key)) return responses[key];
  }
  return null;
}

export default function AIChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I am Campa Assistant. I can help you find accommodation, browse the marketplace, discover events, and more.",
      actions: quickActions,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: String(Date.now()), role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const matched = matchResponse(userMsg.text);
      let reply: Message;
      if (matched) {
        reply = {
          id: String(Date.now() + 1),
          role: "assistant",
          text: matched.text,
          actions: matched.actions,
        };
      } else {
        reply = {
          id: String(Date.now() + 1),
          role: "assistant",
          text: "I am here to help you navigate Campa. Try one of these quick actions or ask about accommodation, marketplace, events, or communities.",
          actions: quickActions,
        };
      }
      setTyping(false);
      setMessages((prev) => [...prev, reply]);
    }, 900);
  };

  const handleAction = (action: QuickAction) => {
    if (action.path) {
      navigate(action.path);
      setOpen(false);
      if (action.query) {
        toast.success(`Showing results for "${action.query}"`, { duration: 2000 });
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-4 ring-white/20 dark:ring-zinc-900/40"
          >
            <Sparkles className="h-6 w-6" strokeWidth={1.5} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-4 z-50 w-[92vw] max-w-sm overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-zinc-800/60 dark:bg-zinc-900/95"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  <Bot className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Campa Assistant</h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Online now</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div ref={scrollRef} className="h-80 space-y-4 overflow-y-auto p-4 scrollbar-hide">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    {msg.text}
                    {msg.actions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.actions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={action.label}
                              onClick={() => handleAction(action)}
                              className="flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-zinc-700 shadow-sm transition-colors hover:bg-white dark:bg-zinc-700/80 dark:text-zinc-200 dark:hover:bg-zinc-700"
                            >
                              <Icon className="h-3 w-3" strokeWidth={1.5} />
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex h-8 items-center gap-1 rounded-2xl bg-zinc-100 px-3 dark:bg-zinc-800">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
                  </div>
                </motion.div>
              )}
            </div>

            <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
              <div className="mb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                    }}
                    className="whitespace-nowrap rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950">
                <Search className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
