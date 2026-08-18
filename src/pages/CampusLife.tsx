import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Tent, Calendar, MapPin, Users, Sparkles, Heart, ChevronRight, PartyPopper, Camera, Music, UsersRound, QrCode, Check } from "lucide-react";
import { useApp, type Meetup, type CampusConnectProfile } from "../context/AppContext";
import { toast } from "sonner";

const categories = ["All", "Tech", "Social", "Sports", "Arts", "Music"];

export default function CampusLifePage() {
  const navigate = useNavigate();
  const { state, toggleRsvp, dispatch } = useApp();
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState<"events" | "connect">("events");

  const filtered = state.meetups.filter((m) => category === "All" ? true : m.category === category);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Campus Life</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Events & connections</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-1 mb-5">
        <button
          onClick={() => setTab("events")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === "events" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          Events
        </button>
        <button
          onClick={() => setTab("connect")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === "connect" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          Campus Connect
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === "events" ? (
          <motion.div key="events" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {/* Category filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 -mx-4 px-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    category === cat
                      ? "bg-purple-600 text-white shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filtered.map((meetup) => (
                <EventCard key={meetup.id} meetup={meetup} onRsvp={toggleRsvp} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <PartyPopper className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" strokeWidth={1} />
                <p className="text-sm text-zinc-400">No events in this category</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="connect" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Mixer Toggle */}
            <div className="glass-card rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Campus Mixer</h3>
                  <p className="text-[11px] text-zinc-400">Opt in to discover students near you</p>
                </div>
                <button
                  onClick={() => {
                    dispatch({ type: "TOGGLE_MIXER_OPTIN" });
                    toast.success(state.user.mixerOptIn ? "Opted out of Campus Mixer" : "Opted into Campus Mixer!");
                  }}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    state.user.mixerOptIn ? "bg-purple-600" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <motion.div
                    animate={{ x: state.user.mixerOptIn ? 24 : 2 }}
                    className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5"
                  />
                </button>
              </div>
            </div>

            {/* Profiles Grid */}
            <div className="grid grid-cols-2 gap-3">
              {state.campusConnect.map((profile) => (
                <ConnectCard key={profile.id} profile={profile} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EventCard({ meetup, onRsvp }: { meetup: Meetup; onRsvp: (id: string) => void }) {
  const categoryIcons: Record<string, any> = {
    Tech: Sparkles,
    Social: PartyPopper,
    Sports: Heart,
    Arts: Camera,
    Music: Music,
  };
  const Icon = categoryIcons[meetup.category] || Calendar;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
              {meetup.category}
            </span>
            <span className="text-[11px] text-zinc-400">{meetup.date}</span>
          </div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">{meetup.title}</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{meetup.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {meetup.location}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {meetup.time}</span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <img src={meetup.hostAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
              <span className="text-xs text-zinc-500">Hosted by {meetup.host}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">{meetup.attendees}/{meetup.maxAttendees}</span>
              <button
                onClick={() => onRsvp(meetup.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  meetup.rsvp
                    ? "bg-purple-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {meetup.rsvp ? "Going" : "RSVP"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ConnectCard({ profile }: { profile: CampusConnectProfile }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="glass-card rounded-2xl p-4 text-center"
    >
      <img
        src={profile.avatar}
        alt={profile.name}
        className="w-16 h-16 rounded-full object-cover mx-auto mb-2.5 ring-2 ring-purple-200 dark:ring-purple-800/50"
      />
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{profile.name}, {profile.age}</h3>
      <p className="text-[11px] text-zinc-400 mt-0.5">{profile.university}</p>
      <p className="text-[10px] text-zinc-500 mt-0.5">{profile.course}</p>
      <div className="flex flex-wrap gap-1 justify-center mt-2">
        {profile.clubs.slice(0, 2).map((club) => (
          <span key={club} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] rounded-full">
            {club}
          </span>
        ))}
      </div>
      <button
        onClick={() => toast.info("Connect request sent!")}
        className="mt-3 w-full py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
      >
        Connect
      </button>
    </motion.div>
  );
}