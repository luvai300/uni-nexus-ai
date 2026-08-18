import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search, Star, MapPin, Phone, Wifi, Video, Clock, Check, ChevronRight,
  Plus, X, Filter, ArrowRight, Award, Sparkles, Loader, RefreshCw,
  Grid, Briefcase, Wrench, Scissors, Camera, Truck, Stethoscope, Music,
  Utensils, Zap, Heart, MessageCircle, Calendar, DollarSign, Ellipsis,
  User, Shield, BadgeCheck, ExternalLink, Share2, Users, GraduationCap,
  ShoppingBag, House, Compass, Bot, Gavel, Headphones, Laptop, Palette,
  Rocket, Smile, Pen, BookOpen, Quote, Handshake, Store,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";

const CATEGORIES = [
  { key: "all", label: "All", icon: Grid },
  { key: "tutoring", label: "Tutoring", icon: BookOpen },
  { key: "tech", label: "Tech", icon: Laptop },
  { key: "beauty", label: "Beauty", icon: Scissors },
  { key: "photography", label: "Photo", icon: Camera },
  { key: "health", label: "Health", icon: Stethoscope },
  { key: "music", label: "Music", icon: Music },
  { key: "food", label: "Food", icon: Utensils },
  { key: "transport", label: "Transport", icon: Truck },
  { key: "events", label: "Events", icon: Rocket },
  { key: "legal", label: "Legal", icon: Gavel },
  { key: "fitness", label: "Fitness", icon: Heart },
];

const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"];

export default function ServicesPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"browse" | "bookings">("browse");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [providersRes, bookingsRes] = await Promise.all([
        supabase.from("service_providers").select("*").order("rating", { ascending: false }),
        supabase.from("service_bookings").select("*, service_providers(*)").eq("user_id", user?.id || "").order("created_at", { ascending: false }),
      ]);
      if (providersRes.error) throw providersRes.error;
      if (bookingsRes.error) throw bookingsRes.error;
      setProviders(providersRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredProviders = providers.filter((p) => {
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !(p.business_name || "").toLowerCase().includes(searchQuery.toLowerCase()) && !(p.description || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleBookNow = async (provider: any) => {
    setSelectedProvider(provider);
    setShowBookingModal(true);
    setBookingDate(new Date().toISOString().split("T")[0]);
    setBookingTime("10:00");
  };

  const submitBooking = async () => {
    if (!selectedProvider || !bookingDate || !bookingTime) {
      toast.error("Please fill in all booking details");
      return;
    }
    try {
      const { error } = await supabase.from("service_bookings").insert({
        user_id: user?.id || "",
        provider_id: selectedProvider.id,
        service_name: selectedProvider.name,
        date: bookingDate,
        time: bookingTime,
        notes: bookingNotes || null,
        price: selectedProvider.price_range ? parseInt(selectedProvider.price_range.replace(/[^0-9]/g, "")) || null : null,
        status: "pending",
        location: selectedProvider.location || null,
      });
      if (error) throw error;
      toast.success("Booking request sent!");
      setShowBookingModal(false);
      setSelectedProvider(null);
      setBookingNotes("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase.from("service_bookings").update({ status: "cancelled" }).eq("id", bookingId);
      if (error) throw error;
      toast.success("Booking cancelled");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking");
    }
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  const getCategoryIcon = (cat: string) => {
    const found = CATEGORIES.find((c) => c.key === cat);
    return found ? found.icon : Store;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 pb-24 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Finding services near campus...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 pb-24">
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Services</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Find campus services & book instantly</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-4">
          <TabsList className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-1">
            <TabsTrigger value="browse" className="flex-1 rounded-xl text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900">Browse</TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1 rounded-xl text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900">My Bookings ({bookings.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "browse" && (
          <>
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Search services or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm"
              />
            </div>

            {/* Category Chips */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-5 pb-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                      selectedCategory === cat.key
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Provider Cards */}
            <AnimatePresence mode="wait">
              {filteredProviders.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-zinc-400 dark:text-zinc-500">
                  <Store className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">No services found</p>
                  <p className="text-xs mt-1">Try a different category or search term</p>
                </motion.div>
              ) : (
                <motion.div key="grid" variants={container} initial="hidden" animate="show" className="space-y-3">
                  {filteredProviders.map((provider) => {
                    const CatIcon = getCategoryIcon(provider.category);
                    return (
                      <motion.div
                        key={provider.id}
                        variants={item}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {provider.profile_photo ? (
                                <img src={provider.profile_photo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <CatIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{provider.business_name || provider.name}</h3>
                                {provider.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                              </div>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 capitalize">{provider.category}</p>
                              {provider.description && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{provider.description}</p>}
                              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
                                {provider.rating && (
                                  <div className="flex items-center gap-1 text-xs">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{provider.rating.toFixed(1)}</span>
                                    <span className="text-zinc-400">({provider.reviews_count || 0})</span>
                                  </div>
                                )}
                                {provider.location && (
                                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                                    <MapPin className="w-3 h-3" />
                                    <span>{provider.location}</span>
                                  </div>
                                )}
                                {provider.distance_km && (
                                  <span className="text-[11px] text-zinc-400">{provider.distance_km}km</span>
                                )}
                                {provider.price_range && (
                                  <Badge variant="secondary" className="text-[10px] px-2 py-0 rounded-full">{provider.price_range}</Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1 flex-shrink-0"
                              onClick={() => handleBookNow(provider)}
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              Book
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            {provider.availability_status && (
                              <div className="flex items-center gap-1 text-[11px]">
                                <div className={`w-1.5 h-1.5 rounded-full ${provider.availability_status === "available" ? "bg-emerald-500" : "bg-zinc-300"}`} />
                                <span className="text-zinc-500 dark:text-zinc-400 capitalize">{provider.availability_status}</span>
                              </div>
                            )}
                            {provider.jobs_completed != null && (
                              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                                <Award className="w-3 h-3" />
                                <span>{provider.jobs_completed} jobs</span>
                              </div>
                            )}
                            {provider.phone && (
                              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                                <Phone className="w-3 h-3" />
                                <span className="truncate">{provider.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {activeTab === "bookings" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-16 text-zinc-400 dark:text-zinc-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No bookings yet</p>
                <p className="text-xs mt-1">Browse services and book your first one!</p>
                <Button className="mt-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setActiveTab("browse")}>
                  Browse Services
                </Button>
              </div>
            ) : (
              bookings.map((b: any) => {
                const statusColors: Record<string, string> = {
                  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                };
                return (
                  <motion.div key={b.id} variants={item} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{b.service_name}</h4>
                          <Badge variant="secondary" className={`text-[10px] px-2 py-0 rounded-full ${statusColors[b.status] || ""}`}>{b.status}</Badge>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{b.service_providers?.business_name || b.service_providers?.name || "Provider"}</p>
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400">
                          <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>{new Date(b.date).toLocaleDateString()}</span></div>
                          <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{b.time}</span></div>
                          {b.location && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /><span>{b.location}</span></div>}
                        </div>
                        {b.notes && <p className="text-[11px] text-zinc-400 mt-1 italic">"{b.notes}"</p>}
                      </div>
                      {b.status === "pending" && (
                        <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl" onClick={() => cancelBooking(b.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Book Service</h3>
                <button onClick={() => setShowBookingModal(false)} className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                  <Store className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{selectedProvider.business_name || selectedProvider.name}</p>
                  <p className="text-xs text-zinc-500 capitalize">{selectedProvider.category}</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">Date</label>
                  <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">Time</label>
                  <Input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="rounded-xl" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 block">Notes (optional)</label>
                  <Input placeholder="Any special requests..." value={bookingNotes} onChange={(e) => setBookingNotes(e.target.value)} className="rounded-xl" />
                </div>
              </div>
              <Button className="w-full rounded-2xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={submitBooking}>
                Confirm Booking
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}