import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  BookOpen, BookMarked, BookCheck, Calendar, Clock, Check, ChevronRight,
  Plus, X, Filter, Star, Bell, AlertTriangle, ArrowRight, Download, FileText,
  Image, Award, BarChart3, Target, Zap, Sparkles, Brain, Loader, RefreshCw,
  List, Grid, Pen, ClipboardList, Percent, TrendingUp, ThumbsUp, Eye, User,
  Settings, Timer, Trash2, CircleAlert, CircleCheck, CircleDashed, BookOpenCheck,
  PanelRight, ChartNoAxesColumnIncreasing, ClipboardCheck, GraduationCap,
  Search, Ellipsis, Frown, Edit3, BookText, CalendarCheck, LayoutGrid,
  ListTodo, SquarePen, SquarePlus, BookUser, ChartNoAxesColumn,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/context/AppContext";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#f97316"];

type Section = "timetable" | "assignments" | "exams" | "notes" | "grades" | "attendance" | "insights";

const sectionMeta: { key: Section; label: string; icon: React.ElementType; color: string }[] = [
  { key: "timetable", label: "Timetable", icon: Calendar, color: "from-violet-500 to-indigo-600" },
  { key: "assignments", label: "Assignments", icon: BookOpen, color: "from-blue-500 to-cyan-500" },
  { key: "exams", label: "Exams", icon: Target, color: "from-rose-500 to-pink-600" },
  { key: "notes", label: "Notes", icon: BookMarked, color: "from-emerald-500 to-teal-500" },
  { key: "grades", label: "Grades", icon: Award, color: "from-amber-500 to-orange-500" },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck, color: "from-indigo-500 to-purple-600" },
  { key: "insights", label: "Insights", icon: ChartNoAxesColumnIncreasing, color: "from-teal-500 to-emerald-600" },
];

export default function MySemesterPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [activeSection, setActiveSection] = useState<Section>("timetable");
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(today);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = user?.id || "";
      const [timetableRes, assignmentsRes, examsRes, notesRes, gradesRes, attendanceRes] = await Promise.all([
        supabase.from("semester_timetables").select("*").eq("user_id", userId).order("start_time"),
        supabase.from("semester_assignments").select("*").eq("user_id", userId).order("due_date", { ascending: false }),
        supabase.from("semester_exams").select("*").eq("user_id", userId).order("date_time"),
        supabase.from("semester_notes").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("semester_grades").select("*").eq("user_id", userId),
        supabase.from("semester_attendance").select("*, semester_timetables(*)").eq("user_id", userId).order("date", { ascending: false }),
      ]);
      if (timetableRes.error) throw timetableRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;
      if (examsRes.error) throw examsRes.error;
      if (notesRes.error) throw notesRes.error;
      if (gradesRes.error) throw gradesRes.error;
      if (attendanceRes.error) throw attendanceRes.error;
      setTimetable(timetableRes.data || []);
      setAssignments(assignmentsRes.data || []);
      setExams(examsRes.data || []);
      setNotes(notesRes.data || []);
      setGrades(gradesRes.data || []);
      setAttendance(attendanceRes.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load semester data");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const dayTimetable = timetable.filter((t: any) => t.day_of_week === selectedDay);
  const upcomingAssignments = assignments.filter((a: any) => a.status !== "completed").slice(0, 5);
  const upcomingExams = exams.filter((e: any) => new Date(e.date_time) > new Date()).slice(0, 5);
  const bookmarkedNotes = notes.filter((n: any) => n.is_bookmarked);

  const overallGrade = grades.length > 0
    ? Math.round(grades.reduce((sum: number, g: any) => {
        const total = (g.cat_marks || 0) + (g.assignment_marks || 0) + (g.project_marks || 0) + (g.exam_marks || 0);
        return sum + total;
      }, 0) / grades.length)
    : 0;

  const attendanceRate = attendance.length > 0
    ? Math.round((attendance.filter((a: any) => a.status === "present").length / attendance.length) * 100)
    : 0;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

  function renderTimetable() {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Weekly Schedule</h3>
          <Button size="sm" variant="outline" className="rounded-xl gap-1" onClick={() => setShowAddForm("timetable")}>
            <Plus className="w-4 h-4" /> Add Class
          </Button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2">
          {DAYS.map((d, i) => (
            <button
              key={d}
              onClick={() => setSelectedDay(i)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedDay === i
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              <span className="block text-[10px] opacity-60">{d}</span>
              <span className="block text-sm font-bold">{i === today ? "Today" : FULL_DAYS[i].slice(0, 3)}</span>
            </button>
          ))}
        </div>
        {dayTimetable.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No classes today</p>
            <p className="text-xs mt-1">Enjoy your free day!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayTimetable.map((cls: any) => (
              <motion.div
                key={cls.id}
                variants={item}
                className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
              >
                <div className="w-1 h-full min-h-[48px] rounded-full flex-shrink-0" style={{ backgroundColor: cls.color || COLORS[0] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{cls.course_name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                    <Clock className="w-3 h-3" />
                    <span>{cls.start_time?.slice(0, 5)} - {cls.end_time?.slice(0, 5)}</span>
                    {cls.room && <><span>·</span><span>Room {cls.room}</span></>}
                  </div>
                  {cls.lecturer && <p className="text-[11px] text-zinc-500 mt-0.5">{cls.lecturer}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  }

  function renderAssignments() {
    const statusColors: Record<string, string> = { pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300", overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" };
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Assignments</h3>
          <Button size="sm" className="rounded-xl gap-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowAddForm("assignments")}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {assignments.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No assignments yet</p>
            </div>
          ) : (
            assignments.slice(0, 15).map((a: any) => (
              <motion.div
                key={a.id}
                variants={item}
                className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{a.title}</h4>
                      <Badge variant="secondary" className={`text-[10px] px-2 py-0 rounded-full ${statusColors[a.status] || ""}`}>
                        {a.status?.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{a.course}</p>
                    {a.description && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{a.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(a.due_date).toLocaleDateString()}</span>
                      </div>
                      {a.priority && (
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 rounded-full ${
                          a.priority === "high" ? "text-red-500 border-red-200 dark:border-red-800" :
                          a.priority === "medium" ? "text-amber-500 border-amber-200 dark:border-amber-800" :
                          "text-zinc-400 border-zinc-200 dark:border-zinc-700"
                        }`}>{a.priority}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-200 dark:text-zinc-700" />
                        <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${2 * Math.PI * 16}`} strokeDashoffset={`${2 * Math.PI * 16 * (1 - (a.progress || 0) / 100)}`} className="text-blue-500" />
                      </svg>
                      <span className="absolute text-[11px] font-bold text-zinc-700 dark:text-zinc-300">{a.progress || 0}%</span>
                    </div>
                  </div>
                </div>
                <Progress value={a.progress || 0} className="h-1.5 mt-2" />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  function renderExams() {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Exam Schedule</h3>
          <Button size="sm" variant="outline" className="rounded-xl gap-1" onClick={() => setShowAddForm("exams")}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {exams.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">
              <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No exams scheduled</p>
            </div>
          ) : (
            exams.slice(0, 10).map((e: any) => {
              const examDate = new Date(e.date_time);
              const isSoon = examDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 && examDate > new Date();
              return (
                <motion.div key={e.id} variants={item} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{e.exam_title}</h4>
                        {isSoon && <Badge className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 rounded-full">Soon</Badge>}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{e.course}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /><span>{examDate.toLocaleDateString()}</span></div>
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><span>{examDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                        {e.room && <><span>·</span><span>Room {e.room}</span></>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-200 dark:text-zinc-700" />
                          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${2 * Math.PI * 16}`} strokeDashoffset={`${2 * Math.PI * 16 * (1 - (e.revision_progress || 0) / 100)}`} className="text-rose-500" />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{e.revision_progress || 0}%</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">Revision</p>
                    </div>
                  </div>
                  <Progress value={e.revision_progress || 0} className="h-1.5 mt-2" />
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    );
  }

  function renderNotes() {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Notes & Library</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-xl gap-1" onClick={() => setShowAddForm("notes")}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input placeholder="Search notes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {notes.length === 0 ? (
            <div className="col-span-full text-center py-12 text-zinc-400 dark:text-zinc-500">
              <BookMarked className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No notes yet</p>
            </div>
          ) : (
            notes.filter(n => !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10).map((n: any) => (
              <motion.div key={n.id} variants={item} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">{n.title}</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{n.course || n.faculty || "General"}</p>
                    {n.ai_summary && <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 italic">"{n.ai_summary}"</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-[10px] px-2 py-0 rounded-full">{n.file_type || "PDF"}</Badge>
                      {n.is_bookmarked && <BookMarked className="w-3 h-3 text-amber-500" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  function renderGrades() {
    const getGradeColor = (g: string) => {
      const map: Record<string, string> = { A: "text-emerald-600", "A-": "text-emerald-500", "B+": "text-blue-500", B: "text-blue-500", "B-": "text-amber-500", "C+": "text-amber-500", C: "text-orange-500", "D+": "text-orange-500", D: "text-red-500", E: "text-red-600" };
      return map[g] || "text-zinc-400";
    };
    const totalCredits = grades.reduce((s: number, g: any) => s + (g.credits || 3), 0);
    const gpa = grades.length > 0
      ? (grades.reduce((s: number, g: any) => {
          const gp = { "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "D+": 1.7, "D": 1.3, "E": 0.0 };
          return s + (gp[g.grade as keyof typeof gp] || 0) * (g.credits || 3);
        }, 0) / totalCredits).toFixed(2)
      : "0.00";
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Grade Tracker</h3>
          <Button size="sm" variant="outline" className="rounded-xl gap-1" onClick={() => setShowAddForm("grades")}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white">
            <p className="text-xs font-medium opacity-80">Current GPA</p>
            <p className="text-3xl font-bold mt-1">{gpa}</p>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Credits</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">{totalCredits}</p>
          </div>
        </div>
        <div className="space-y-2">
          {grades.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 dark:text-zinc-500">
              <Award className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No grades recorded yet</p>
            </div>
          ) : (
            grades.map((g: any) => {
              const total = (g.cat_marks || 0) + (g.assignment_marks || 0) + (g.project_marks || 0) + (g.exam_marks || 0);
              return (
                <motion.div key={g.id} variants={item} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{g.course}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                        <span>CAT: {g.cat_marks || 0}</span>
                        <span>·</span>
                        <span>Assign: {g.assignment_marks || 0}</span>
                        <span>·</span>
                        <span>Project: {g.project_marks || 0}</span>
                        <span>·</span>
                        <span>Exam: {g.exam_marks || 0}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getGradeColor(g.grade)}`}>{g.grade || "—"}</p>
                      <p className="text-[10px] text-zinc-400">{total}/100</p>
                    </div>
                  </div>
                  <Progress value={total} className="h-1.5 mt-2" />
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    );
  }

  function renderAttendance() {
    const present = attendance.filter((a: any) => a.status === "present").length;
    const absent = attendance.filter((a: any) => a.status === "absent").length;
    const excused = attendance.filter((a: any) => a.status === "excused").length;
    const total = attendance.length || 1;
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Attendance</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{present}</p>
            <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">Present</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl text-center">
            <p className="text-2xl font-bold text-red-500 dark:text-red-400">{absent}</p>
            <p className="text-[11px] text-red-500/70 dark:text-red-400/70">Absent</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-center">
            <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">{excused}</p>
            <p className="text-[11px] text-amber-500/70 dark:text-amber-400/70">Excused</p>
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Attendance Rate</p>
            <p className="text-lg font-bold text-emerald-500">{attendanceRate}%</p>
          </div>
          <Progress value={attendanceRate} className="h-2" />
          <p className="text-[11px] text-zinc-400 mt-2">{present} out of {total} sessions attended</p>
        </div>
        <div className="space-y-2">
          {attendance.slice(0, 10).map((a: any) => (
            <motion.div key={a.id} variants={item} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                a.status === "present" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                a.status === "absent" ? "bg-red-100 dark:bg-red-900/30" : "bg-amber-100 dark:bg-amber-900/30"
              }`}>
                {a.status === "present" ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> :
                 a.status === "absent" ? <X className="w-4 h-4 text-red-500 dark:text-red-400" /> :
                 <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">{a.semester_timetables?.course_name || "Class"}</p>
                <p className="text-[11px] text-zinc-400">{new Date(a.date).toLocaleDateString()}</p>
              </div>
              <Badge variant="secondary" className={`text-[10px] rounded-full ${
                a.status === "present" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                a.status === "absent" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              }`}>{a.status}</Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  function renderInsights() {
    const completed = assignments.filter((a: any) => a.status === "completed").length;
    const totalAssignments = assignments.length || 1;
    const completionRate = Math.round((completed / totalAssignments) * 100);
    const highPriority = assignments.filter((a: any) => a.priority === "high" && a.status !== "completed").length;
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Semester Insights</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
              <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{assignments.length}</p>
            <p className="text-[11px] text-zinc-400">Total Assignments</p>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{completionRate}%</p>
            <p className="text-[11px] text-zinc-400">Completion Rate</p>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-2">
              <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{exams.length}</p>
            <p className="text-[11px] text-zinc-400">Upcoming Exams</p>
          </div>
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{highPriority}</p>
            <p className="text-[11px] text-zinc-400">High Priority Tasks</p>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5" />
            <p className="text-sm font-bold">Study Streak</p>
          </div>
          <p className="text-4xl font-bold">{Math.min(attendance.length, 30)} <span className="text-lg font-normal opacity-70">days</span></p>
          <p className="text-xs text-white/70 mt-1">Keep up the momentum! {attendance.length >= 20 ? "You're on fire!" : "Try to stay consistent."}</p>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 pb-24 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading your semester...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 pb-24">
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">My Semester</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Your academic hub</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={fetchData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Quick Stats Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2 mb-6">
          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-center">
            <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{timetable.length}</p>
            <p className="text-[10px] text-zinc-400">Classes</p>
          </div>
          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-center">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{assignments.filter((a: any) => a.status !== "completed").length}</p>
            <p className="text-[10px] text-zinc-400">Pending</p>
          </div>
          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-center">
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{attendanceRate}%</p>
            <p className="text-[10px] text-zinc-400">Attendance</p>
          </div>
          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-sm text-center">
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{exams.length}</p>
            <p className="text-[10px] text-zinc-400">Exams</p>
          </div>
        </motion.div>

        {/* Section Navigation */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-6 pb-1">
          {sectionMeta.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  activeSection === s.key
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {activeSection === "timetable" && renderTimetable()}
            {activeSection === "assignments" && renderAssignments()}
            {activeSection === "exams" && renderExams()}
            {activeSection === "notes" && renderNotes()}
            {activeSection === "grades" && renderGrades()}
            {activeSection === "attendance" && renderAttendance()}
            {activeSection === "insights" && renderInsights()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}