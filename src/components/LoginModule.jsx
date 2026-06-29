import React, { useState } from "react";
import {
  ShieldBan,
  ShieldCheck,
  Mail,
  Lock,
  PhoneCall,
  Smartphone,
  Check,
  HelpCircle,
  RefreshCw,
  X,
  Shield,
  Church,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Key,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../supabase-client";

import logo from "../assets/kjv.png";

export default function LoginModule({ onLoginSuccess, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isResetting, setIsResetting] = useState(false);

  const [step, setStep] = useState("credentials");

  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  //For Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("joinDate");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (isSignUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error("Error signing up:", signUpError.message);

        if (signUpError.message.includes("User already registered")) {
          setError("This email is already registered. Please sign in instead.");
        } else if (
          signUpError.message.includes(
            "Password should be at least 6 characters",
          )
        ) {
          setError("Password must be at least 6 characters long.");
        } else if (signUpError.message.includes("valid email")) {
          setError("Please enter a valid email address.");
        } else {
          setError(signUpError.message);
        }
        setIsLoading(false);
      } else if (
        data.user &&
        data.user.identities &&
        data.user.identities.length === 0
      ) {
        setError("An account with this email already exists. Please sign in.");
        setIsLoading(false);
      } else {
        console.log("Sign up successful");
        setSuccess(
          "Account created successfully! Please check your email for verification.",
        );
        setTimeout(() => {
          setSuccess("");
          setIsSignUp(false);
          setEmail("");
          setPassword("");
        }, 3000);
        setIsLoading(false);
      }
    } else {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        console.error("Error signing in:", signInError.message);

        if (signInError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (signInError.message.includes("Email not confirmed")) {
          setError(
            "Please verify your email address before signing in. Check your inbox for the confirmation link.",
          );
        } else if (signInError.message.includes("Too many requests")) {
          setError("Too many failed attempts. Please try again later.");
        } else {
          setError(signInError.message);
        }
        setIsLoading(false);
      } else {
        console.log("Sign in successful");
        onLoginSuccess();
        setIsLoading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      setResetError("Please enter your email address");
      return;
    }

    setIsResetting(true);
    setResetError("");
    setResetSuccess("");

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsResetting(false);

    if (error) {
      console.error("Reset password error:", error.message);
      if (error.message.includes("User not found")) {
        setResetError("No account found with this email address.");
      } else {
        setResetError(error.message);
      }
    } else {
      setResetSuccess("Password reset link sent to your email!");
      setTimeout(() => {
        setResetSuccess("");
        setShowForgotPassword(false);
        setResetEmail("");
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full border border-slate-200 flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300">
        {/* Close Button - Improved for mobile devices */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 md:top-4 md:right-4 z-20 p-2.5 md:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Close"
          style={{ minWidth: "44px", minHeight: "44px" }} // Better touch target for mobile
        >
          <X className="h-5 w-5 md:h-4 md:w-4" />
        </button>

        {/* Left Panel - Hidden on mobile, shown on tablet/desktop */}
        <div className="hidden md:flex relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8 flex-col justify-between md:w-5/12 overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-mono font-bold tracking-wider text-xs text-indigo-300">
                SECURE GATEWAY
              </span>
            </div>

            <div className="flex justify-center items-center my-8">
              <img
                src={logo}
                alt="Church Logo"
                className="w-auto h-auto object-contain drop-shadow-xl"
                style={{ maxWidth: "100%", maxHeight: "140px" }}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 rounded-full bg-gradient-to-b from-indigo-400 to-purple-400" />
                <p className="text-sm text-slate-200 font-sans leading-relaxed">
                  Secure administrative control console with Multi-Factor
                  verification and Role-Based Access controls (RBAC).
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-4 border-t border-slate-700/50 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>🔒 Auth Status:</span>
              <span className="text-emerald-400 font-bold">LOCKED</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>🔐 MFA Type:</span>
              <span>RFC 6238 TOTP</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>⚡ Environment:</span>
              <span className="text-emerald-400">Sandbox Active</span>
            </div>
          </div>
        </div>

        {/* Mobile Header - Only visible on mobile devices */}
        <div className="md:hidden bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-mono font-bold tracking-wider text-xs text-white">
              SECURE GATEWAY
            </span>
          </div>
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Church Logo"
              className="h-8 w-8 object-contain"
            />
          </div>
        </div>

        {/* Right Panel - Form Area - Full width on mobile */}
        <div className="p-6 md:p-8 w-full md:w-7/12 bg-white">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-sans font-black text-slate-900 tracking-tight">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              {isSignUp
                ? "Join your church community and access spiritual resources"
                : "Sign in to access your church management dashboard"}
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-in slide-in-from-top duration-200">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs md:text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700 p-1"
                style={{ minWidth: "32px", minHeight: "32px" }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Success Message Display */}
          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 animate-in slide-in-from-top duration-200">
              <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs md:text-sm text-emerald-700">{success}</p>
              </div>
              <button
                onClick={() => setSuccess("")}
                className="text-emerald-500 hover:text-emerald-700 p-1"
                style={{ minWidth: "32px", minHeight: "32px" }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] md:text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <Mail className="h-3 w-3 md:h-3.5 md:w-3.5" />
                Email Address
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                  placeholder="name@church.org"
                  id="login-email-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] md:text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                <Lock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                Security Password
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                  placeholder="••••••••"
                  id="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                  style={{ minWidth: "32px", minHeight: "32px" }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link (Login mode only) */}
            {!isSignUp && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[10px] md:text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold transition"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              id="login-auth-button"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            {/* Toggle between Login and Sign Up */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {/* <span className="text-xs text-slate-500">
                {isSignUp
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                  setSuccess("");
                }}
                className="text-indigo-600 hover:text-indigo-700 text-xs font-bold transition hover:underline"
              >
                {isSignUp ? "Sign In" : "Create one"}
              </button> */}
            </div>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-[8px] md:text-[9px] text-slate-400 text-center font-mono">
              By continuing, you agree to our Terms of Service and Privacy
              Policy. All data is encrypted in transit and at rest.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal - Improved for mobile */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 md:p-6 mx-4 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Key className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-sans font-bold text-slate-900 text-base md:text-lg">
                  Reset Password
                </h3>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
                style={{ minWidth: "40px", minHeight: "40px" }}
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Reset Error Message */}
            {resetError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-xs md:text-sm text-red-700">
                  {resetError}
                </span>
              </div>
            )}

            {/* Reset Success Message */}
            {resetSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-xs md:text-sm text-emerald-700">
                  {resetSuccess}
                </span>
              </div>
            )}

            <p className="text-sm text-slate-500 mb-4">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value);
                setResetError("");
              }}
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none mb-4"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="flex-1 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition disabled:opacity-50 order-1 sm:order-2"
              >
                {isResetting ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
