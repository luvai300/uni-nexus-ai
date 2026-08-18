import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Tag, Heart, Clock, Sparkles, ChevronDown, BadgeDollarSign, Image as ImageIcon, X, Plus, Camera, Loader } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { uploadImages } from "@/utils/upload";

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string | null;
  negotiable: boolean | null;
  description: string | null;
  images: string[] | null;
  seller_name: string | null;
  seller_avatar: string | null;
  status: string | null;
  rating: number | null;
  created_at: string | null;
}

const CATEGORIES = ["All", "Electronics", "Books", "Fashion", "Free Items", "Furniture", "Other"];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Used"];

export default function MarketplacePage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showPostForm, setShowPostForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [formData, setFormData] = useState({ title: "", price: "", category: "Electronics", condition: "Good", description: "", negotiable: false });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const { data, error } = await supabase
        .from("marketplace_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setSelectedFiles(files);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  }

  function removeFile(idx: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  }

  async function handleSubmit() {
    if (!formData.title.trim() || !formData.price) {
      toast.error("Please fill in title and price");
      return;
    }
    setPosting(true);
    try {
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        const results = await uploadImages(selectedFiles);
        imageUrls = results.map((r) => r.url);
      }
      const { error } = await supabase.from("marketplace_items").insert({
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        description: formData.description.trim() || null,
        negotiable: formData.negotiable,
        images: imageUrls.length > 0 ? imageUrls : null,
        seller_id: user?.id || null,
        seller_name: user?.name || "Student",
        seller_avatar: user?.avatar || null,
        status: "active",
      });
      if (error) throw error;
      toast.success("Item listed successfully!");
      setShowPostForm(false);
      setFormData({ title: "", price: "", category: "Electronics", condition: "Good", description: "", negotiable: false });
      setSelectedFiles([]);
      setPreviews([]);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to list item");
    } finally {
      setPosting(false);
    }
  }

  const filtered = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500 dark:from-amber-700 dark:via-amber-600 dark:to-orange-600 px-5 pt-14 pb-6 rounded-b-[28px]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-white rotate-90" />
          </button>
          <h1 className="text-lg font-bold text-white">Marketplace</h1>
          <button onClick={() => setShowPostForm(true)} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Tag className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/15 backdrop-blur-md text-white placeholder:text-white/50 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
          />
        </div>
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto px-4 mt-4 pb-2 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="px-4 mt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Sparkles className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">No items found</p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">Check back later or adjust your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 shadow-sm"
              >
                <div className="h-36 bg-zinc-200 dark:bg-zinc-800 relative">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                  {item.negotiable && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">Negotiable</span>
                  )}
                  {item.condition && (
                    <span className="absolute top-2 right-2 bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {item.condition}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{item.category}</p>
                  <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 mt-0.5 truncate">{item.title}</p>
                  <p className="text-amber-600 dark:text-amber-400 font-bold text-sm mt-1">KSh {item.price.toLocaleString()}</p>
                  {item.seller_name && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex-shrink-0">
                        {item.seller_avatar ? (
                          <img src={item.seller_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-500">?</div>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{item.seller_name}</span>
                    </div>
                  )}
                  <p className="text-[9px] text-zinc-400 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* FAB: Add Item */}
      <button
        onClick={() => setShowPostForm(true)}
        className="fixed bottom-6 right-5 w-14 h-14 bg-amber-600 hover:bg-amber-500 text-white rounded-full shadow-lg shadow-amber-600/30 flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Upload Modal */}
      <AnimatePresence>
        {showPostForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowPostForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#FDFBF7] dark:bg-zinc-900 rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              <div className="p-5 pb-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">List an Item</h2>
                  <button onClick={() => setShowPostForm(false)} className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <X className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  </button>
                </div>

                {/* Image Upload */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">Photos (up to 5)</label>
                  <div className="flex gap-2 flex-wrap">
                    {previews.map((url, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => removeFile(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {previews.length < 5 && (
                      <button onClick={() => fileRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex flex-col items-center justify-center text-zinc-400 hover:border-amber-500 hover:text-amber-500 transition-colors">
                        <Camera className="w-5 h-5" />
                        <span className="text-[9px] mt-1">Add Photo</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">Title</label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="What are you selling?"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                {/* Price */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">Price (KSh)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                {/* Category & Condition Row */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">Condition</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 block">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your item..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                  />
                </div>

                {/* Negotiable */}
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setFormData({ ...formData, negotiable: !formData.negotiable })}
                    className={`w-10 h-6 rounded-full transition-colors ${formData.negotiable ? "bg-amber-600" : "bg-zinc-300 dark:bg-zinc-600"} relative`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${formData.negotiable ? "left-5" : "left-1"}`} />
                  </button>
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">Price negotiable</span>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={posting}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50 text-white font-semibold rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
                >
                  {posting ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {posting ? "Listing..." : "List Item"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}