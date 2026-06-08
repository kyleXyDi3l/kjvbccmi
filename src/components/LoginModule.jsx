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
} from "lucide-react";

import { supabase } from "../supabase-client";

import logo from "../assets/kjv.png";

export default function LoginModule({ onLoginSuccess, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const [step, setStep] = useState("credentials");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(isSignUp);
    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        console.error("Error signing up:", signUpError.message);
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        console.error("Error signing in:", signInError.message);
      } else {
        console.log("Sign in successful");
        onLoginSuccess();
      }
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-xl overflow-hidden max-w-lg w-full border border-slate-100 flex flex-col md:flex-row"
      id="login-container"
    >
      {/* Visual Identity Side Banner */}
      <div className="bg-slate-900 text-white p-6 flex flex-col justify-between md:w-5/12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            <span className="font-sans font-bold tracking-tight text-sm">
              SECURE GATEWAY
            </span>
          </div>
          <img src={logo} alt="Church Logo" />
          {/* <h3 className="font-sans text-xl font-bold leading-tight mt-6">
            Church Multi-Location Management
          </h3> */}
          <p className="text-xs text-slate-400 mt-2 font-sans">
            Secure administrative control console with Multi-Factor verification
            and Role-Based Access controls (RBAC).
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
          <p>Auth Status: LOCKED</p>
          <p>MFA Type: RFC 6238 TOTP</p>
          <p className="text-emerald-400">Environment Sandbox Active</p>
        </div>
      </div>

      {/* Main Login Steps Area */}
      <div
        className="p-6 md:w-7/12 flex flex-col justify-between"
        id="login-flow-box"
      >
        {step === "credentials" && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-sans font-semibold text-slate-800">
                Sign In to Dashboard
              </h2>
              <p className="text-xs text-slate-500">
                Sign in to view different viewpoints.
              </p>
            </div>
            <form className="space-y-3">
              <div>
                <label className="block text-xs font-sans font-medium text-slate-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                    placeholder="name@church.org"
                    id="login-email-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-sans font-medium text-slate-600 mb-1">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                    placeholder="••••••••"
                    id="login-password-input"
                  />
                </div>
              </div>
              <button
                type="submit"
                onClick={handleSubmit}
                id="login-auth-button"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg text-xs transition duration-150 flex items-center justify-center gap-2 mt-4"
              >
                {isSignUp ? <span>Sign Up</span> : <span>Sign In</span>}
                <ShieldCheck className="h-4 w-4" />
              </button>
              {isSignUp
                ? "Already have an account?"
                : "Sign up for an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-500 hover:text-blue-700"
              >
                {isSignUp ? "Sign In" : "Create one"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
