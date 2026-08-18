import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, TrendingUp, GraduationCap, Calendar, Users, Flame, BookOpen, Bell, Heart, ShoppingBag, ArrowRight, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useApp } from "@/context/AppContext";

interface HousingItem {
  id: string;
  title: string;
  price: number;
  category: string;
  distance_km: number | null;
  image_urls: string[] | null;
  location?: string;
  university?: string;
  rating?: number;
}

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  category: string;
  images: string[] | null;
  seller_name: string | null;
  rating?: number;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string | null;
  category: string;
  image_url: string | null;
  host_name: string;
  attendee_count: number;
}

interface CampusUpdate {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  published_at: string | null;
}

const quickActions = [
  { icon: MapPin, label: "Housing", gradient: "from-emerald-400 to-emerald-500", path: "/accommodation" },
  { icon: ShoppingBag, label: "Market", gradient: "from-amber-400 to-orange-500", path: "/marketplace" },
  { icon: GraduationCap, label: "CampusX", gradient: "from-violet-400 to-purple-500", path: "/campax" },
  { icon: Calendar, label: "Events", gradient: "from-rose-400 to-pink-500", path: "/discover" },
];



const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [housing, setHousing] = useState<HousingItem[]>([]);
  const [marketplace, setMarketplace] = useState<MarketplaceItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [updates, setUpdates] = useState<CampusUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [housingRes, marketRes, eventsRes, updatesRes] = await Promise.allSettled([
          supabase.from("housing_listings").select("*").eq("availability_status", "available").limit(4),
          supabase.from("marketplace_items").select("*").eq("status", "active").limit(4),
          supabase.from("events").select("*").order("date", { ascending: true }).limit(3),
          supabase.from("campus_updates").select("*").order("published_at", { ascending: false }).limit(3),
        ]);

        if (housingRes.status === "fulfilled" && housingRes.value.data) {
          setHousing(housingRes.value.data);
        }
        if (marketRes.status === "fulfilled" && marketRes.value.data) {
          setMarketplace(marketRes.value.data);
        }
        if (eventsRes.status === "fulfilled" && eventsRes.value.data) {
          setEvents(eventsRes.value.data);
        }
        if (updatesRes.status === "fulfilled" && updatesRes.value.data) {
          setUpdates(updatesRes.value.data);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">Loading your campus...</p>
      </div>
    );
  }

  const hasData = housing.length > 0 || marketplace.length > 0 || events.length > 0 || updates.length > 0;

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 pb-4">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 dark:from-blue-700 dark:via-blue-600 dark:to-indigo-600 px-5 pt-14 pb-8 rounded-b-[32px] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {user?.name ? `Hey, ${user.name.split(" ")[0]}` : "Campa"}
              </h1>
              <p className="text-blue-100/80 text-sm mt-0.5 font-medium">Find your campus vibe</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20"
              >
                <Bell className="w-5 h-5 text-white" />
              </motion.button>
              {user && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate("/profile")}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm overflow-hidden border-2 border-white/30"
                >
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search housing, items, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/15 backdrop-blur-md text-white placeholder:text-white/45 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/25 text-sm transition-all"
            />
          </div>

          
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-5 space-y-6 relative z-10">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-zinc-100 dark:border-zinc-800"
        >
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((item) => (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-2"
              >
                <div className={`bg-gradient-to-br ${item.gradient} w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {hasData ? (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
            {/* Housing Section */}
            {housing.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" /> Housing Near You
                  </h2>
                  <button
                    onClick={() => navigate("/accommodation")}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1"
                  >
                    See All <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                  {housing.map((item) => (
                    <motion.div
                      key={item.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/accommodation")}
                      className="flex-shrink-0 w-48 bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm"
                    >
                      <div className="h-28 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700">
                        {item.image_urls?.[0] ? (
                          <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building className="w-8 h-8 text-zinc-400" />
                          </div>
                        )}
                        {item.rating && item.rating > 0 && (
                          <div className="absolute top-2 left-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1 text-xs font-semibold">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {item.rating}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium">
                          {item.category} · {item.distance_km ? `${item.distance_km}km` : "Nearby"}
                        </p>
                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 mt-0.5 truncate">{item.title}</p>
                        <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-1">KSh {item.price.toLocaleString()}/mo</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Marketplace Section */}
            {marketplace.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" /> Trending Now
                  </h2>
                  <button
                    onClick={() => navigate("/marketplace")}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1"
                  >
                    See All <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {marketplace.slice(0, 4).map((item) => (
                    <motion.div
                      key={item.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/marketplace")}
                      className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm"
                    >
                      <div className="h-28 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 relative">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-zinc-400" />
                          </div>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center"
                        >
                          <Heart className="w-3.5 h-3.5 text-zinc-500" />
                        </motion.button>
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide font-medium">{item.category}</p>
                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 mt-0.5 truncate">{item.title}</p>
                        <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mt-1">KSh {item.price.toLocaleString()}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Campus Buzz Section */}
            {updates.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-rose-500" /> Campus Buzz
                  </h2>
                </div>
                <div className="space-y-2">
                  {updates.map((update, i) => (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 22 }}
                      className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">{update.title}</p>
                          {update.content && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{update.content}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {update.category && (
                              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full">
                                {update.category}
                              </span>
                            )}
                            {update.published_at && (
                              <span className="text-[10px] text-zinc-400">{new Date(update.published_at).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Events Section */}
            {events.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-500" /> Upcoming Events
                  </h2>
                  <button
                    onClick={() => navigate("/discover")}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1"
                  >
                    See All <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {events.map((event) => (
                    <motion.div
                      key={event.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/discover")}
                      className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 flex items-center gap-3"
                    >
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-rose-600 dark:text-rose-400 leading-none">
                          {new Date(event.date).getDate()}
                        </span>
                        <span className="text-[9px] font-semibold text-rose-500 dark:text-rose-400 uppercase tracking-wide">
                          {new Date(event.date).toLocaleString("default", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 truncate">{event.title}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {event.time} · {event.location || "TBD"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                            {event.category}
                          </span>
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {event.attendee_count}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center mb-4">
              <Sparkles className="w-9 h-9 text-blue-500 dark:text-blue-400" />
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">Welcome to Campa!</p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 max-w-xs">
              Your campus hub is ready. Listings, events, and updates will appear here.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/campax")}
              className="mt-6 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-600/20"
            >
              Explore CampusX
            </motion.button>
          </motion.div>
        )}

        {/* Bottom spacing */}
        <div className="h-6" />
      </div>
    </div>
  );
}

function Building(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <line x1="8" y1="6" x2="10" y2="6" />
      <line x1="8" y1="10" x2="10" y2="10" />
      <line x1="8" y1="14" x2="10" y2="14" />
      <line x1="14" y1="6" x2="16" y2="6" />
      <line x1="14" y1="10" x2="16" y2="10" />
      <line x1="14" y1="14" x2="16" y2="14" />
    </svg>
  );
}