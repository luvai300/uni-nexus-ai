import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, Phone, Eye, EyeOff, User, ArrowLeft, Loader2, Smartphone, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const UNIVERSITIES = [
  "University of Nairobi",
  "Kenyatta University",
  "JKUAT",
  "Strathmore University",
  "Moi University",
  "Egerton University",
  "Maseno University",
  "Technical University of Kenya",
  "University of Kabianga",
  "Dedan Kimathi University",
  "Murang'a University",
  "KCA University",
  "USIU-Africa",
  "Mount Kenya University",
  "Daystar University",
  "Other",
];

const CAMPUSES: Record<string, string[]> = {
  "University of Nairobi": ["Main Campus", "Kikuyu", "Chiromo", "Kenya Science"],
  "Kenyatta University": ["Main Campus", "Parklands", "Kitui", "Mombasa"],
  "JKUAT": ["Main Campus - Juja", "Nairobi CBD", "Mombasa", "Kisii"],
  "Strathmore University": ["Madaraka Campus", "Ole Sangale Campus"],
  "Moi University": ["Main Campus - Kesses", "Eldoret Town", "Nairobi"],
  "Egerton University": ["Njoro Campus", "Nakuru Town", "Nairobi"],
  "Maseno University": ["Main Campus", "Kisumu Town", "Odera"],
  "Technical University of Kenya": ["Main Campus"],
};

type AuthTab = "login" | "signup" | "phone" | "forgot";

export default function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign Up
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupUniversity, setSignupUniversity] = useState("");
  const [signupCampus, setSignupCampus] = useState("");

  // Phone
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !signupName) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            full_name: signupName,
            university: signupUniversity,
            campus: signupCampus,
          },
        },
      });
      if (error) throw error;
      if (data.user) {
        // Upsert profile
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: signupName,
          university: signupUniversity || "University of Nairobi",
          campus: signupCampus || null,
          avatar_url: null,
        });
        if (profileError) console.error("Profile upsert error:", profileError);
      }
      toast.success("Account created! Check your email to confirm.");
      setActiveTab("login");
    } catch (err: any) {
      toast.error(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });
      if (error) throw error;
      setOtpSent(true);
      toast.success("OTP sent to your phone!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      toast.error("Please enter the OTP code");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otpCode,
        type: "sms",
      });
      if (error) throw error;
      toast.success("Phone verified! Welcome!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin + "/auth",
      });
      if (error) throw error;
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const tabVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-4 pb-12">
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-2xl font-bold text-white">C</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome to Campa</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Your campus community</p>
        </motion.div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as AuthTab); setOtpSent(false); }} className="w-full">
          <TabsList className="grid grid-cols-4 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 mb-6">
            <TabsTrigger value="login" className="text-xs rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700">Login</TabsTrigger>
            <TabsTrigger value="signup" className="text-xs rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700">Sign Up</TabsTrigger>
            <TabsTrigger value="phone" className="text-xs rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700">Phone</TabsTrigger>
            <TabsTrigger value="forgot" className="text-xs rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700">Reset</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {/* Login Tab */}
              {activeTab === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@university.ac.ke"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                  </Button>
                </form>
              )}

              {/* Sign Up Tab */}
              {activeTab === "signup" && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="signup-name"
                        placeholder="e.g. John Kamau"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@university.ac.ke"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10 pr-10 h-12 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-university">University</Label>
                    <select
                      id="signup-university"
                      value={signupUniversity}
                      onChange={(e) => { setSignupUniversity(e.target.value); setSignupCampus(""); }}
                      className="w-full h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select university</option>
                      {UNIVERSITIES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                  {signupUniversity && CAMPUSES[signupUniversity] && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-campus">Campus</Label>
                      <select
                        id="signup-campus"
                        value={signupCampus}
                        onChange={(e) => setSignupCampus(e.target.value)}
                        className="w-full h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select campus</option>
                        {CAMPUSES[signupUniversity].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                  </Button>
                </form>
              )}

              {/* Phone Auth Tab */}
              {activeTab === "phone" && !otpSent && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+254712345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Enter your phone number with country code</p>
                  </div>
                  <Button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP"}
                  </Button>
                </div>
              )}

              {activeTab === "phone" && otpSent && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter OTP code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-center text-lg tracking-widest"
                        maxLength={6}
                      />
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">Enter the code sent to {phoneNumber}</p>
                  </div>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign In"}
                  </Button>
                  <button
                    onClick={() => setOtpSent(false)}
                    className="w-full text-center text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    Change phone number
                  </button>
                </div>
              )}

              {/* Forgot Password Tab */}
              {activeTab === "forgot" && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    Enter your email and we'll send you a password reset link.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@university.ac.ke"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}