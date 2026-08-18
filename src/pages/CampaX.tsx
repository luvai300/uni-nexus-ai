import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Heart, MessageCircle, Send, Sparkles, ChevronDown, User,
  GraduationCap, Hash, Filter, X, Plus, Image, Share2, Repeat2,
  Bookmark, BadgeCheck, Smile, RefreshCw, Loader, Calendar, Bell,
  Ellipsis, Star, Flame, MapPin, ArrowUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

interface CampaXPost {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  images: string[] | null;
  hashtags: string[] | null;
  tags: string[] | null;
  university: string;
  is_anonymous: boolean;
  created_at: string | null;
}

interface PostWithStats extends CampaXPost {
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  liked_by_me: boolean;
  bookmarked_by_me: boolean;
}

interface TrendingTopic {
  tag: string;
  count: number;
}

interface StudentProfile {
  id: string;
  user_name: string;
  user_avatar: string | null;
  university: string;
  major: string;
  year: string;
  bio: string;
  interests: string[];
}

const tabs = [
  { key: "for-you", label: "For You" },
  { key: "following", label: "Following" },
  { key: "meet", label: "Campus Meet" },
  { key: "trending", label: "Trending" },
  { key: "my-posts", label: "My Posts" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const postVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export default function CampaXPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [posts, setPosts] = useState<PostWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("for-you");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [posting, setPosting] = useState(false);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [meetFilter, setMeetFilter] = useState("all");

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("campax_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const postsData = data || [];

      const postsWithStats: PostWithStats[] = await Promise.all(
        postsData.map(async (post) => {
          const [likesRes, commentsRes, repostsRes, myLikeRes, myBookmarkRes] = await Promise.all([
            supabase.from("campax_likes").select("id", { count: "exact", head: true }).eq("post_id", post.id),
            supabase.from("campax_replies").select("id", { count: "exact", head: true }).eq("post_id", post.id),
            supabase.from("campax_reposts").select("id", { count: "exact", head: true }).eq("post_id", post.id),
            supabase.from("campax_likes").select("id").eq("post_id", post.id).eq("user_id", user?.id || "").maybeSingle(),
            supabase.from("campax_bookmarks").select("id").eq("post_id", post.id).eq("user_id", user?.id || "").maybeSingle(),
          ]);

          return {
            ...post,
            likes_count: likesRes.count || 0,
            comments_count: commentsRes.count || 0,
            reposts_count: repostsRes.count || 0,
            liked_by_me: !!myLikeRes.data,
            bookmarked_by_me: !!myBookmarkRes.data,
          };
        })
      );
      setPosts(postsWithStats);

      const tagCounts = new Map<string, number>();
      postsData.forEach((p) => {
        p.hashtags?.forEach((tag) => {
          const lower = tag.toLowerCase();
          tagCounts.set(lower, (tagCounts.get(lower) || 0) + 1);
        });
      });
      setTrending(
        [...tagCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([tag, count]) => ({ tag, count }))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_name, user_avatar, university, major, year, bio, interests")
        .limit(20);
      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load students");
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (activeTab === "meet") fetchStudents();
  }, [activeTab, fetchStudents]);

  async function handlePost() {
    if (!newPost.trim() || !user) return;
    setPosting(true);
    try {
      const hashtags = newPost.match(/#[\w]+/g)?.map((h) => h.slice(1)) || [];
      const tags = hashtags.length > 0 ? ["# " + hashtags[0]] : ["Campus Life"];

      const { error } = await supabase.from("campax_posts").insert({
        user_id: user.id,
        user_name: user.name || "Student",
        user_avatar: user.avatar || null,
        content: newPost.trim(),
        university: user.university || "University of Nairobi",
        tags,
        hashtags,
        is_anonymous: false,
      });
      if (error) throw error;
      toast.success("Posted to CampusX!");
      setNewPost("");
      setShowComposer(false);
      fetchPosts();
    } catch (err: any) {
      toast.error(err.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(post: PostWithStats) {
    try {
      if (post.liked_by_me) {
        const { error } = await supabase
          .from("campax_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user?.id || "");
        if (error) throw error;
      } else {
        const { error } = await supabase.from("campax_likes").insert({
          post_id: post.id,
          user_id: user?.id || "",
        });
        if (error) throw error;
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                liked_by_me: !p.liked_by_me,
                likes_count: p.liked_by_me ? p.likes_count - 1 : p.likes_count + 1,
              }
            : p
        )
      );
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  }

  async function handleBookmark(post: PostWithStats) {
    try {
      if (post.bookmarked_by_me) {
        const { error } = await supabase
          .from("campax_bookmarks")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user?.id || "");
        if (error) throw error;
      } else {
        const { error } = await supabase.from("campax_bookmarks").insert({
          post_id: post.id,
          user_id: user?.id || "",
        });
        if (error) throw error;
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, bookmarked_by_me: !p.bookmarked_by_me } : p
        )
      );
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    fetchPosts();
  }

  const filteredPosts = posts.filter((post) => {
    if (activeTab === "my-posts") return post.user_id === user?.id;
    if (activeTab === "following") return false; // placeholder
    if (activeTab === "trending") return post.likes_count > 0 || post.reposts_count > 0;
    const matchesSearch =
      !searchQuery ||
      post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.hashtags?.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase())) ||
      post.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredStudents = students.filter((s) => {
    if (meetFilter === "all") return true;
    return s.interests?.some((i) => i.toLowerCase().includes(meetFilter.toLowerCase()));
  });

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-[3px] border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">Loading CampusX...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-violet-500 to-purple-600 dark:from-violet-700 dark:via-violet-600 dark:to-purple-700 px-5 pt-14 pb-4 rounded-b-[28px] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate("/")}
              className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/15"
            >
              <ChevronDown className="w-5 h-5 text-white rotate-90" />
            </button>
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowSearch(!showSearch)}
                className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/15"
              >
                <Search className="w-4.5 h-4.5 text-white" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleRefresh}
                className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/15"
              >
                <RefreshCw className={`w-4.5 h-4.5 text-white ${refreshing ? "animate-spin" : ""}`} />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">CampusX</h1>
              <p className="text-violet-200/80 text-xs font-medium">Your campus social hub</p>
            </div>
          </div>

          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search posts, people, hashtags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 bg-white/15 backdrop-blur-md text-white placeholder:text-white/45 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/25 text-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex gap-1 px-3 pt-2 pb-0 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "text-violet-600 dark:text-violet-400"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-violet-600 dark:bg-violet-400"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Composer Box (always visible on For You tab) */}
      {activeTab === "for-you" && (
        <div className="px-4 mt-3">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" />
                )}
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="What's happening on campus?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  rows={2}
                  className="w-full resize-none bg-transparent text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      <Image className="w-4 h-4 text-zinc-500" />
                    </button>
                    <button className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      <Smile className="w-4 h-4 text-zinc-500" />
                    </button>
                    <span className="text-[10px] text-zinc-400 ml-1">{newPost.length}/500</span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePost}
                    disabled={!newPost.trim() || posting}
                    className="px-5 py-2 bg-violet-600 disabled:bg-violet-300 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-lg shadow-violet-600/20"
                  >
                    {posting ? (
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Post
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Trending Topics bar */}
      {trending.length > 0 && activeTab !== "meet" && activeTab !== "trending" && (
        <div className="px-4 mt-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {trending.map((topic) => (
              <button
                key={topic.tag}
                onClick={() => {
                  setSearchQuery(`#${topic.tag}`);
                  setShowSearch(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200/50 dark:border-violet-800/30 whitespace-nowrap"
              >
                <Flame className="w-3 h-3 text-violet-500" />
                <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">#{topic.tag}</span>
                <span className="text-[10px] text-violet-400 dark:text-violet-500">{topic.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Campus Meet Tab */}
      {activeTab === "meet" ? (
        <div className="px-4 mt-4">
          {/* Meet Filters */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {["all", "engineering", "arts", "sports", "music", "tech"].map((f) => (
              <motion.button
                key={f}
                whileTap={{ scale: 0.93 }}
                onClick={() => setMeetFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  meetFilter === f
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                    : "bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {f === "all" ? "Everyone" : f.charAt(0).toUpperCase() + f.slice(1)}
              </motion.button>
            ))}
          </div>

          {studentsLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center mb-4">
                <GraduationCap className="w-9 h-9 text-violet-500 dark:text-violet-400" />
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">No students found</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 max-w-xs">
                Students will appear here once they join campus
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredStudents.map((student, i) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 overflow-hidden flex-shrink-0">
                      {student.user_avatar ? (
                        <img src={student.user_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-6 h-6 text-violet-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 truncate">
                          {student.user_name}
                        </p>
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      </div>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {student.major || "Undeclared"} · {student.year || "Freshman"}
                      </p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                        <MapPin className="w-2.5 h-2.5 inline mr-0.5" />
                        {student.university || "Campus"}
                      </p>
                    </div>
                  </div>
                  {student.bio && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
                      {student.bio}
                    </p>
                  )}
                  {student.interests && student.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {student.interests.slice(0, 3).map((interest) => (
                        <span
                          key={interest}
                          className="px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-[10px] font-medium text-violet-600 dark:text-violet-400"
                        >
                          {interest}
                        </span>
                      ))}
                      {student.interests.length > 3 && (
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          +{student.interests.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="mt-3 w-full py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-violet-600/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Say Hi
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Feed */
        <div className="px-4 mt-4 space-y-3">
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 flex items-center justify-center mb-4">
                <Sparkles className="w-9 h-9 text-violet-500 dark:text-violet-400" />
              </div>
              <p className="text-zinc-600 dark:text-zinc-300 font-semibold text-lg">
                {searchQuery ? "No results found" : activeTab === "my-posts" ? "No posts yet" : "No posts yet"}
              </p>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1 max-w-xs">
                {searchQuery
                  ? "Try a different search term"
                  : "Be the first to share what's happening on campus!"}
              </p>
              {!searchQuery && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowComposer(true)}
                  className="mt-6 px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-violet-600/20 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create Post
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
              {filteredPosts.map((post, i) => (
                <motion.div
                  key={post.id}
                  variants={postVariants}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden"
                >
                  {/* Post Header */}
                  <div className="p-4 pb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex-shrink-0">
                        {post.user_avatar ? (
                          <img src={post.user_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-zinc-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 truncate">
                            {post.is_anonymous ? "Anonymous" : post.user_name}
                          </p>
                          {!post.is_anonymous && <BadgeCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-auto flex-shrink-0">
                            {post.created_at
                              ? (() => {
                                  const diff = Date.now() - new Date(post.created_at).getTime();
                                  const mins = Math.floor(diff / 60000);
                                  if (mins < 60) return `${mins}m`;
                                  const hours = Math.floor(mins / 60);
                                  if (hours < 24) return `${hours}h`;
                                  return new Date(post.created_at).toLocaleDateString();
                                })()
                              : "now"}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          @{post.university?.toLowerCase().replace(/\s+/g, "")} · {post.tags?.[0] || "Campus Life"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-2">
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {post.hashtags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setSearchQuery(`#${tag}`);
                              setShowSearch(true);
                            }}
                            className="text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}

                    {post.images && post.images.length > 0 && (
                      <div className={`mt-2 -mx-4 ${post.images.length > 1 ? "grid grid-cols-2 gap-0.5" : ""}`}>
                        {post.images.slice(0, 4).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt=""
                            className={`w-full object-cover ${post.images.length === 1 ? "h-48" : "h-36"} ${idx === 0 && post.images.length > 1 ? "rounded-bl-xl" : ""} ${idx === post.images.length - 1 && post.images.length > 1 ? "rounded-br-xl" : ""}`}
                            loading="lazy"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Bar (X/Twitter style) */}
                  <div className="px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleLike(post)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        post.liked_by_me
                          ? "text-rose-500"
                          : "text-zinc-400 dark:text-zinc-500 hover:text-rose-500"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${post.liked_by_me ? "fill-rose-500" : ""}`}
                      />
                      <span>{post.likes_count > 0 ? post.likes_count : ""}</span>
                    </motion.button>

                    <button className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-blue-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments_count > 0 ? post.comments_count : ""}</span>
                    </button>

                    <button className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-emerald-500 transition-colors">
                      <Repeat2 className="w-4 h-4" />
                      <span>{post.reposts_count > 0 ? post.reposts_count : ""}</span>
                    </button>

                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleBookmark(post)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        post.bookmarked_by_me
                          ? "text-amber-500"
                          : "text-zinc-400 dark:text-zinc-500 hover:text-amber-500"
                      }`}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${post.bookmarked_by_me ? "fill-amber-500" : ""}`}
                      />
                    </motion.button>

                    <button className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-blue-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      {/* FAB - Quick Post */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowComposer(true)}
        className="fixed bottom-6 right-5 w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl shadow-xl shadow-violet-600/30 flex items-center justify-center z-40"
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.button>

      {/* Composer Modal */}
      <AnimatePresence>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setShowComposer(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-zinc-800 dark:text-zinc-100">New Post</h3>
                <button
                  onClick={() => setShowComposer(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-zinc-500" />
                </button>
              </div>
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" />
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="What's happening on campus?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    rows={3}
                    className="w-full resize-none bg-transparent text-sm text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
                    autoFocus
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Image className="w-4 h-4 text-zinc-500" />
                      </button>
                      <button className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Smile className="w-4 h-4 text-zinc-500" />
                      </button>
                      <span className="text-[10px] text-zinc-400 ml-1">{newPost.length}/500</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePost}
                      disabled={!newPost.trim() || posting}
                      className="px-5 py-2 bg-violet-600 disabled:bg-violet-300 text-white text-xs font-semibold rounded-full flex items-center gap-1.5"
                    >
                      {posting ? (
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      Post
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}