import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, Send, Search, ChevronRight, MessageCircle, Hash } from "lucide-react";
import { useApp, type Community } from "../context/AppContext";

export default function CommunitiesPage() {
  const { state, dispatch } = useApp();
  const [activeCommunity, setActiveCommunity] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const active = state.communities.find((c) => c.id === activeCommunity);

  const handleSend = () => {
    if (!msg.trim() || !activeCommunity) return;
    dispatch({ type: "ADD_COMMUNITY_MESSAGE", payload: { communityId: activeCommunity, text: msg } });
    setMsg("");
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Communities</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Chat with like-minded students</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4">
        {state.communities.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCommunity(c.id === activeCommunity ? null : c.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeCommunity === c.id
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <span className="text-base">{c.icon}</span>
            {c.name}
            {c.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {c.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-[calc(100dvh-220px)]"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{active.icon}</span>
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">{active.name}</h2>
                <p className="text-xs text-zinc-400">{active.members} members</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 scrollbar-hide">
              {active.messages.map((m) => (
                <div key={m.id} className={`flex gap-2 ${m.isMine ? "flex-row-reverse" : ""}`}>
                  <img src={m.senderAvatar} alt="" className="w-7 h-7 rounded-full object-cover mt-0.5 flex-shrink-0" />
                  <div className={`max-w-[75%] ${m.isMine ? "items-end" : ""}`}>
                    <div className={`px-3.5 py-2 rounded-2xl text-sm ${
                      m.isMine
                        ? "bg-purple-600 text-white rounded-tr-md"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-tl-md"
                    }`}>
                      <p>{m.text}</p>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5 px-1">{m.isMine ? "You" : m.senderName} · {m.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 h-10 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
              <button
                onClick={handleSend}
                disabled={!msg.trim()}
                className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center disabled:opacity-50 shadow-sm"
              >
                <Send className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {state.communities.map((c) => <CommunityCard key={c.id} community={c} onSelect={setActiveCommunity} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CommunityCard({ community, onSelect }: { community: Community; onSelect: (id: string) => void }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(community.id)}
      className="glass-card rounded-2xl p-4 text-left relative"
    >
      <span className="text-3xl mb-2 block">{community.icon}</span>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">{community.name}</h3>
      <p className="text-xs text-zinc-400 line-clamp-2">{community.description}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[11px] text-zinc-400">{community.members} members</span>
        {community.unread > 0 && (
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {community.unread}
          </span>
        )}
      </div>
    </motion.button>
  );
}