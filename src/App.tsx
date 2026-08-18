import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { House, ShoppingBag, Compass, Calendar, MessageCircle, User, GraduationCap, BookOpen, Store } from "lucide-react";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "sonner";
import HomePage from "./pages/Home";
import MarketplacePage from "./pages/Marketplace";
import AccommodationPage from "./pages/Accommodation";
import DiscoverPage from "./pages/Discover";
import CommunitiesPage from "./pages/Communities";
import ChatPage from "./pages/Chat";
import ProfilePage from "./pages/Profile";
import AdminDashboardPage from "./pages/AdminDashboard";
import CampaXPage from "./pages/CampaX";
import AIChatAssistant from "./components/AIChatAssistant";
import MySemesterPage from "./pages/MySemester";
import ServicesPage from "./pages/Services";
import AuthPage from "./pages/Auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const tabs = [
  { path: "/", icon: House, label: "Home" },
  { path: "/my-semester", icon: BookOpen, label: "Semester" },
  { path: "/services", icon: Store, label: "Services" },
  { path: "/marketplace", icon: ShoppingBag, label: "Market" },
  { path: "/campax", icon: GraduationCap, label: "campusX" },
  { path: "/chat", icon: MessageCircle, label: "Chats" },
  { path: "/profile", icon: User, label: "Profile" },
];

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      setShowLabels(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowLabels(true), 1500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  if (location.pathname === "/auth") return null;

  return (
    <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 safe-area-bottom pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="relative"
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
              <motion.span
                animate={{
                  opacity: showLabels ? 1 : 0,
                  width: showLabels ? "auto" : 0,
                }}
                className={`text-[10px] font-medium leading-none ${isActive ? "opacity-100" : "opacity-60"}`}
              >
                {tab.label}
              </motion.span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then((result) => {
      const s = result?.data?.session ?? null;
      setSession(s);
      setLoading(false);
    });
    const { data: authData } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => authData?.subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FDFBF7] dark:bg-zinc-950">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="min-h-[100dvh] pb-20"
      >
        <Routes location={location}>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/my-semester" element={<ProtectedRoute><MySemesterPage /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><ServicesPage /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
          <Route path="/accommodation" element={<ProtectedRoute><AccommodationPage /></ProtectedRoute>} />
          <Route path="/campax" element={<ProtectedRoute><CampaXPage /></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><CampaXPage /></ProtectedRoute>} />
          <Route path="/communities" element={<ProtectedRoute><CommunitiesPage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/chat/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-[100dvh] bg-zinc-50 dark:bg-zinc-950">
          <AnimatedRoutes />
          <BottomNav />
          <AIChatAssistant />
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0,0,0,0.05)",
              borderRadius: "16px",
              color: "#18181b",
            },
            className: "dark:bg-zinc-900/90 dark:text-zinc-100 dark:border-zinc-800",
          }}
        />
      </AppProvider>
    </BrowserRouter>
  );
}