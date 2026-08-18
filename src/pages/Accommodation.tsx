import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Wifi, Filter, SlidersHorizontal, BedDouble, Shield, Star, Plus, X, ChevronDown, Camera, Loader, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { uploadImages } from "@/utils/upload";

interface HousingListing {
  id: string;
  title: string;
  price: number;
  deposit: number | null;
  category: string;
  university: string | null;
  campus: string | null;
  distance_km: number | null;
  gender_preference: string | null;
  furnished: boolean | null;
  wifi: boolean | null;
  water_included: boolean | null;
  parking: boolean | null;
  security: boolean | null;
  image_urls: string[] | null;
  landlord_name: string | null;
  landlord_phone: string | null;
  landlord_whatsapp: string | null;
  rating: number | null;
  availability_status: string | null;
}

const CATEGORIES = ["All", "Bedsitter", "Studio", "1-Bedroom", "Shared"];

export default function AccommodationPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<HousingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [wifiOnly, setWifiOnly] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "Bedsitter",
    campus: "",
    description: "",
    furnished: false,
    wifi: false,
    water_included: false,
    parking: false,
    security: false,
    landlord_name: "",
    landlord_phone: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newFiles = [...selectedFiles, ...files].slice(0, 5);
    setSelectedFiles(newFiles);
    Promise.all(newFiles.map((f) => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(f);
    }))).then(setPreviews);
    if (e.target) e.target.value = "";
  }

  function removeFile(i: number) {
    const updated = selectedFiles.filter((_, idx) => idx !== i);
    setSelectedFiles(updated);
    setPreviews(updated.map((f) => URL.createObjectURL(f)));
  }

  async function handlePost() {
    if (!formData.title.trim() || !formData.price) {
      toast.error("Title and price are required");
      return;
    }
    setPosting(true);
    try {
      const uploadResults = selectedFiles.length > 0 ? await uploadImages(selectedFiles) : [];
      const imageUrls = uploadResults.map((r) => r.url);

      const { error } = await supabase.from("housing_listings").insert({
        title: formData.title.trim(),
        price: parseInt(formData.price),
        category: formData.category,
        campus: formData.campus || null,
        furnished: formData.furnished,
        wifi: formData.wifi,
        water_included: formData.water_included,
        parking: formData.parking,
        security: formData.security,
        landlord_name: formData.landlord_name || null,
        landlord_phone: formData.landlord_phone || null,
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        availability_status: "available",
      });
      if (error) throw error;
      toast.success("Room listed successfully!");
      setShowPostForm(false);
      setFormData({ title: "", price: "", category: "Bedsitter", campus: "", description: "", furnished: false, wifi: false, water_included: false, parking: false, security: false, landlord_name: "", landlord_phone: "" });
      setSelectedFiles([]);
      setPreviews([]);
      fetchListings();
    } catch (err: any) {
      toast.error(err.message || "Failed to post room");
    } finally {
      setPosting(false);
    }
  }

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    try {
      const { data, error } = await supabase
        .from("housing_listings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setListings(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }

  const filtered = listings.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.campus?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.university?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchesFurnished = !furnishedOnly || item.furnished === true;
    const matchesWifi = !wifiOnly || item.wifi === true;
    return matchesSearch && matchesCategory && matchesPrice && matchesFurnished && matchesWifi;
  });

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-500 dark:from-emerald-700 dark:via-emerald-600 dark:to-green-600 px-5 pt-14 pb-6 rounded-b-[28px]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-white rotate-90" />
          </button>
          <h1 className="text-lg font-bold text-white">Housing</h1>
          <button onClick={() => setShowFilters(!showFilters)} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Search by location, university..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/15 backdrop-blur-md text-white placeholder:text-white/50 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mx-4 mt-3 bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">Filters</h3>
            <button onClick={() => { setFurnishedOnly(false); setWifiOnly(false); setPriceRange([0, 50000]); }} className="text-xs text-blue-600 font-medium">Reset</button>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">Price Range: KSh {priceRange[0].toLocaleString()} - KSh {priceRange[1].toLocaleString()}</p>
              <input
                type="range"
                min={0}
                max={50000}
                step={1000}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full accent-emerald-500"
              />
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <input type="checkbox" checked={furnishedOnly} onChange={() => setFurnishedOnly(!furnishedOnly)} className="rounded accent-emerald-500" />
                Furnished
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <input type="checkbox" checked={wifiOnly} onChange={() => setWifiOnly(!wifiOnly)} className="rounded accent-emerald-500" />
                WiFi
              </label>
            </div>
          </div>
        </motion.div>
      )}

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="px-4 mt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MapPin className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">No listings found</p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm"
              >
                <div className="h-40 bg-zinc-200 dark:bg-zinc-800 relative">
                  {item.image_urls?.[0] ? (
                    <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <MapPin className="w-10 h-10" />
                    </div>
                  )}
                  {item.availability_status === "available" && (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">Available</span>
                  )}
                  {item.rating && (
                    <span className="absolute top-2 right-2 bg-white/90 dark:bg-zinc-900/90 text-zinc-800 dark:text-zinc-100 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {item.rating}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    {item.category} {item.gender_preference ? `· ${item.gender_preference}` : ""}
                  </p>
                  <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 mt-0.5 truncate">{item.title}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {item.distance_km && (
                      <span className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {item.distance_km}km
                      </span>
                    )}
                    {item.furnished && <BedDouble className="w-3 h-3 text-zinc-400" />}
                    {item.wifi && <Wifi className="w-3 h-3 text-zinc-400" />}
                    {item.security && <Shield className="w-3 h-3 text-zinc-400" />}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">KSh {item.price.toLocaleString()}/mo</p>
                    {item.deposit && <p className="text-[10px] text-zinc-400">Deposit: KSh {item.deposit.toLocaleString()}</p>}
                  </div>
                  {item.landlord_name && (
                    <p className="text-[10px] text-zinc-400 mt-1.5">{item.landlord_name}{item.landlord_phone ? ` · ${item.landlord_phone}` : ""}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setShowPostForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all active:scale-95 z-40"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Upload Modal */}
      <AnimatePresence>
        {showPostForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={() => setShowPostForm(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-zinc-900 w-full sm:max-w-lg max-h-[85vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-5 py-4 flex items-center justify-between z-10">
                <h2 className="font-bold text-lg text-zinc-800 dark:text-zinc-100">Post a Room</h2>
                <button onClick={() => setShowPostForm(false)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Image Upload */}
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Photos</p>
                  <div className="flex gap-2 flex-wrap">
                    {previews.map((p, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        <img src={p} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeFile(i)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {selectedFiles.length < 5 && (
                      <button onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors">
                        <Camera className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{selectedFiles.length}/5</span>
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Title *</label>
                  <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Cozy bedsitter near campus" className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Room Type</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50">
                      {["Bedsitter", "Studio", "1-Bedroom", "Shared", "Single Room"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Price (KSh/mo) *</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="e.g. 8000" className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
                  </div>
                </div>

                {/* Campus */}
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Campus / Location</label>
                  <input value={formData.campus} onChange={(e) => setFormData({ ...formData, campus: e.target.value })} placeholder="e.g. Main Campus" className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
                </div>

                {/* Amenities */}
                <div>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "furnished", label: "Furnished", icon: <BedDouble className="w-3.5 h-3.5" /> },
                      { key: "wifi", label: "WiFi", icon: <Wifi className="w-3.5 h-3.5" /> },
                      { key: "water_included", label: "Water Included", icon: <Sparkles className="w-3.5 h-3.5" /> },
                      { key: "parking", label: "Parking", icon: <MapPin className="w-3.5 h-3.5" /> },
                      { key: "security", label: "Security", icon: <Shield className="w-3.5 h-3.5" /> },
                    ].map(({ key, label, icon }) => (
                      <button
                        key={key}
                        onClick={() => setFormData({ ...formData, [key]: !(formData as any)[key] })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          (formData as any)[key]
                            ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                        }`}
                      >
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Landlord Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Landlord Name</label>
                    <input value={formData.landlord_name} onChange={(e) => setFormData({ ...formData, landlord_name: e.target.value })} placeholder="Optional" className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1 block">Phone</label>
                    <input value={formData.landlord_phone} onChange={(e) => setFormData({ ...formData, landlord_phone: e.target.value })} placeholder="Optional" className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/50" />
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handlePost}
                  disabled={posting}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {posting ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {posting ? "Posting..." : "Post Room"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}