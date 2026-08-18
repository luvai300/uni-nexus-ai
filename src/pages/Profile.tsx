import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Settings, Shield, LogOut, ChevronDown, Star, MapPin, GraduationCap, BookOpen, Calendar, Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

interface ProfileStats {
  listings: number;
  events: number;
  posts: number;
  likes: number;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, authUser, signOut, loading: authLoading } = useApp();
  const [stats, setStats] = useState<ProfileStats>({ listings: 0, events: 0, posts: 0, likes: 0 });
  const [activeTab, setActiveTab] = useState<"posts" | "listings" | "saved">("posts");

  useEffect(() => {
    if (authUser?.id) {
      fetchStats(authUser.id);
    }
  }, [authUser]);

  async function fetchStats(userId: string) {
    try {
      const [listingsRes, eventsRes, postsRes] = await Promise.allSettled([
        supabase.from("marketplace_items").select("id", { count: "exact", head: true }).eq("seller_id", userId),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("campus_updates").select("id", { count: "exact", head: true }).eq("user_id", userId),
      ]);

      setStats({
        listings: listingsRes.status === "fulfilled" ? listingsRes.value.count || 0 : 0,
        events: eventsRes.status === "fulfilled" ? eventsRes.value.count || 0 : 0,
        posts: postsRes.status === "fulfilled" ? postsRes.value.count || 0 : 0,
        likes: 0,
      });
    } catch {
      // stats best-effort
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-600 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 px-5 pt-14 pb-0 rounded-b-[28px]">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-white rotate-90" />
          </button>
          <h1 className="text-lg font-bold text-white">Profile</h1>
          <button onClick={() => navigate("/settings")} className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="mx-4 -mt-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden border-2 border-white dark:border-zinc-800 shadow-sm">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-zinc-500" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{user?.name || "Student"}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {user?.university || "University"} {user?.year ? `· ${user.year}` : ""}
                </p>
              </div>
              {user?.course && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.course}</p>
                </div>
              )}
            </div>
          </div>
          {user?.bio && (
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3">{user.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {[
              { label: "Listings", value: stats.listings, icon: ShoppingBag },
              { label: "Events", value: stats.events, icon: Calendar },
              { label: "Posts", value: stats.posts, icon: Heart },
              { label: "Likes", value: stats.likes, icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{stat.value}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mt-4 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
        {[
          { key: "posts" as const, label: "Posts" },
          { key: "listings" as const, label: "Listings" },
          { key: "saved" as const, label: "Saved" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === tab.key
                ? "bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4">
        {activeTab === "posts" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-2" />
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No posts yet</p>
          </div>
        )}
        {activeTab === "listings" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-2" />
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No listings yet</p>
          </div>
        )}
        {activeTab === "saved" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Star className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-2" />
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">No saved items</p>
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="px-4 mt-6">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}