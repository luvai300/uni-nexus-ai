import { useState } from "react";
import { motion } from "framer-motion";
import { Gavel, Shield, TriangleAlert, Check, X, Eye, Users, ShoppingBag, Flag, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const adminTabs = [
  { id: "overview", label: "Overview", icon: TrendingUp },
  { id: "reports", label: "Reports", icon: Flag },
  { id: "listings", label: "Listings", icon: ShoppingBag },
  { id: "users", label: "Users", icon: Users },
] as const;

type AdminTab = (typeof adminTabs)[number]["id"];

const mockReports = [
  { id: "1", reporter: "Jane M.", reported: "John K.", reason: "Inappropriate listing content", status: "pending", timestamp: "2 hours ago" },
  { id: "2", reporter: "Paul W.", reported: "Grace A.", reason: "Suspicious account", status: "pending", timestamp: "5 hours ago" },
];

const mockFlaggedListings = [
  { id: "1", title: "Used Textbook", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop", sellerName: "John K.", price: 1500, flagged: true },
  { id: "2", title: "Laptop for Sale", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop", sellerName: "Ann M.", price: 45000, flagged: true },
];

const mockUsers = [
  { id: "1", name: "Jane M.", university: "University of Nairobi", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" },
  { id: "2", name: "Paul W.", university: "Kenyatta University", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
  { id: "3", name: "Grace A.", university: "JKUAT", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop" },
];

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [reports, setReports] = useState(mockReports);
  const [flagList, setFlagList] = useState(mockFlaggedListings);

  const pendingReports = reports.filter((r) => r.status === "pending");
  const flaggedListings = flagList;

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 pb-4">
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Gavel className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Admin</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Moderate the campus</p>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex bg-white dark:bg-zinc-900 rounded-xl p-1 shadow-sm border border-zinc-100 dark:border-zinc-800">
          {adminTabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === t.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400"
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4">
        {tab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-2">
                  <Flag className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{pendingReports.length}</p>
                <p className="text-xs text-zinc-400">Pending Reports</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
                  <TriangleAlert className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{flaggedListings.length}</p>
                <p className="text-xs text-zinc-400">Flagged Listings</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                  <ShoppingBag className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{flagList.length}</p>
                <p className="text-xs text-zinc-400">Total Listings</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                  <Users className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{mockUsers.length}</p>
                <p className="text-xs text-zinc-400">Active Users</p>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
              <button
                onClick={() => setTab("reports")}
                className="w-full flex items-center gap-3 p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <Flag className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
                </div>
                <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-white text-left">Review {pendingReports.length} Reports</span>
                <Eye className="w-4 h-4 text-zinc-400" />
              </button>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 mx-3.5" />
              <button
                onClick={() => setTab("listings")}
                className="w-full flex items-center gap-3 p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <TriangleAlert className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-white text-left">Review {flaggedListings.length} Flagged Listings</span>
                <Eye className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </motion.div>
        )}

        {tab === "reports" && (
          <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-3">
              {reports.map((report) => (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                      <Flag className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-white">{report.reporter}</span>
                        <span className="text-[10px] text-zinc-400">reported</span>
                        <span className="text-xs font-semibold text-zinc-900 dark:text-white">{report.reported}</span>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{report.reason}</p>
                      <p className="text-[11px] text-zinc-400 mt-1">{report.timestamp}</p>
                      {report.status === "pending" && (
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => {
                              setReports((prev) => prev.map((r) => r.id === report.id ? { ...r, status: "dismissed" } : r));
                              toast.success("Report dismissed");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Dismiss
                          </button>
                          <button
                            onClick={() => {
                              setReports((prev) => prev.map((r) => r.id === report.id ? { ...r, status: "resolved" } : r));
                              toast.success("Warning issued");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1"
                          >
                            <TriangleAlert className="w-3 h-3" /> Warn
                          </button>
                          <button
                            onClick={() => {
                              setReports((prev) => prev.filter((r) => r.id !== report.id));
                              toast.success("User banned");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Ban
                          </button>
                        </div>
                      )}
                      {report.status !== "pending" && (
                        <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                          report.status === "dismissed" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                        }`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {reports.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" strokeWidth={1} />
                  <p className="text-sm text-zinc-400">No reports yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === "listings" && (
          <motion.div key="listings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-3">
              {flaggedListings.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800"
                >
                  <div className="flex gap-3">
                    <img src={item.image} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{item.title}</h3>
                      <p className="text-xs text-zinc-400">by {item.sellerName}</p>
                      <p className="text-sm font-bold text-violet-600 dark:text-violet-400 mt-1">KSh {item.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            setFlagList((prev) => prev.filter((i) => i.id !== item.id));
                            toast.success("Listing approved");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => {
                            setFlagList((prev) => prev.filter((i) => i.id !== item.id));
                            toast.success("Listing removed");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {flaggedListings.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" strokeWidth={1} />
                  <p className="text-sm text-zinc-400">No flagged listings</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === "users" && (
          <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-2">
              {mockUsers.map((profile) => (
                <motion.div
                  key={profile.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-3 flex items-center gap-3 border border-zinc-100 dark:border-zinc-800"
                >
                  <img src={profile.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{profile.name}</h3>
                    <p className="text-[11px] text-zinc-400">{profile.university}</p>
                  </div>
                  <button
                    onClick={() => toast.info(`${profile.name} has been warned`)}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-semibold"
                  >
                    Warn
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}