import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MessageCircle, Send, ChevronDown, User, Phone, MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string | null;
  text: string;
  image_url: string | null;
  created_at: string | null;
}

interface ChatThread {
  id: string;
  participant_name: string;
  participant_avatar: string | null;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number | null;
  online: boolean | null;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchThreads();
  }, []);

  async function fetchThreads() {
    try {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setThreads(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load chats");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(threadId: string) {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("chat_id", threadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load messages");
    }
  }

  async function handleSelectThread(threadId: string) {
    setSelectedThread(threadId);
    fetchMessages(threadId);
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !selectedThread) return;
    try {
      const { error } = await supabase.from("chat_messages").insert({
        chat_id: selectedThread,
        sender_id: "user1",
        sender_name: "You",
        text: newMessage.trim(),
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setNewMessage("");
      fetchMessages(selectedThread);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    }
  }

  const filtered = threads.filter((t) =>
    t.participant_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Chat View
  if (selectedThread) {
    const thread = threads.find((t) => t.id === selectedThread);
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-4 pt-12 pb-3 flex items-center gap-3">
          <button onClick={() => setSelectedThread(null)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <ChevronDown className="w-4 h-4 text-zinc-600 dark:text-zinc-400 rotate-90" />
          </button>
          <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
            {thread?.participant_avatar ? (
              <img src={thread.participant_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-5 h-5 text-zinc-500" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">{thread?.participant_name}</p>
            {thread?.online && <p className="text-[10px] text-emerald-500">Online</p>}
          </div>
          <button className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <Phone className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">No messages yet</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs">Send a message to start chatting</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === "user1";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      isMine
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${isMine ? "text-blue-200" : "text-zinc-400"}`}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 px-4 py-3 pb-safe">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 px-4 py-2.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="w-10 h-10 rounded-full bg-blue-600 disabled:bg-blue-300 text-white flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Threads List
  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-500 dark:from-blue-700 dark:via-sky-600 dark:to-cyan-600 px-5 pt-14 pb-6 rounded-b-[28px]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-white rotate-90" />
          </button>
          <h1 className="text-lg font-bold text-white">Chats</h1>
          <div className="w-9 h-9" />
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/15 backdrop-blur-md text-white placeholder:text-white/50 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
          />
        </div>
      </div>

      {/* Threads */}
      <div className="px-4 mt-4 space-y-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">No conversations yet</p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">Start chatting with other students</p>
          </div>
        ) : (
          filtered.map((thread) => (
            <motion.button
              key={thread.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectThread(thread.id)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="relative w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex-shrink-0">
                {thread.participant_avatar ? (
                  <img src={thread.participant_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 text-zinc-500" />
                  </div>
                )}
                {thread.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 truncate">
                    {thread.participant_name}
                  </p>
                  {thread.last_message_time && (
                    <span className="text-[10px] text-zinc-400 flex-shrink-0 ml-2">
                      {thread.last_message_time}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                  {thread.last_message || "No messages yet"}
                </p>
              </div>
              {thread.unread_count && thread.unread_count > 0 ? (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                  {thread.unread_count}
                </span>
              ) : null}
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}