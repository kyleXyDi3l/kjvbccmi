import React, { useState } from "react";
import {
  Users,
  Shield,
  Calendar,
  BookOpen,
  Database,
  Search,
  UserCheck,
  UserPlus,
  Edit3,
  Trash2,
  Plus,
  X,
  CheckCircle,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Check,
  Newspaper,
  Landmark,
} from "lucide-react";

// ==========================================
// SAMPLE DATA FOR UI RENDERING ONLY
// ==========================================
const sampleMembers = [
  {
    id: "MEM001",
    firstName: "John",
    lastName: "Dela Cruz",
    email: "john@church.org",
    extension: "Naga",
    role: "Pastor",
    status: "Active",
  },
  {
    id: "MEM002",
    firstName: "Maria",
    lastName: "Santos",
    email: "maria@church.org",
    extension: "Global",
    role: "Admin",
    status: "Active",
  },
  {
    id: "MEM003",
    firstName: "Jose",
    lastName: "Reyes",
    email: "jose@church.org",
    extension: "Samar",
    role: "Member",
    status: "Inactive",
  },
];

const sampleEvents = [
  {
    id: "EVT001",
    date: "2026-06-15",
    time: "09:00 AM",
    ministryType: "Worship",
    title: "Sunday Praise Celebration",
    extension: "Naga",
  },
  {
    id: "EVT002",
    date: "2026-06-20",
    time: "05:00 PM",
    ministryType: "Youth",
    title: "Youth Ignite Night",
    extension: "Global",
  },
];

const samplePosts = [
  {
    id: "PST001",
    date: "Jun 10, 2026",
    type: "announcement",
    title: "Church Anniversary",
    extension: "Naga",
    active: true,
  },
  {
    id: "PST002",
    date: "Jun 09, 2026",
    type: "study",
    title: "Sermon: The Good Shepherd",
    extension: "Global",
    active: false,
  },
];

const sampleFinances = [
  {
    id: "FIN001",
    receiptNumber: "T-101",
    date: "2026-06-01",
    category: "tithe",
    description: "Sunday Tithes",
    contributorName: "John Dela Cruz",
    extension: "Naga",
    amount: 5000,
  },
  {
    id: "FIN002",
    receiptNumber: "D-202",
    date: "2026-06-02",
    category: "donation",
    description: "Building Fund",
    contributorName: "Anonymous",
    extension: "Global",
    amount: 15000,
  },
  {
    id: "FIN003",
    receiptNumber: "E-303",
    date: "2026-06-03",
    category: "expense",
    description: "Electricity Bill",
    contributorName: "",
    extension: "Samar",
    amount: -3500,
  },
];

const sampleAuditLogs = [
  {
    id: "log_1",
    timestamp: "2026-06-07 08:30:15",
    action: "Initial Admin initialization completed",
    target: "Global Console",
    isOnline: true,
  },
  {
    id: "log_2",
    timestamp: "2026-06-07 09:12:44",
    action: "Authorized Developer / Pastor Account",
    target: "Global Panel",
    isOnline: true,
  },
];

// ==========================================
// UI ONLY - NO LOGIC, NO STATE DECLARATIONS
// ==========================================
export default function AdminDashboardUI() {
  const [activeTab, setActiveTab] = useState("members");
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [selectedPostDetails, setSelectedPostDetails] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [auditedReceiptIds, setAuditedReceiptIds] = useState(new Set());

  // Sample stats calculations
  const totalMembers = sampleMembers.length;
  const upcomingEventsCount = sampleEvents.length;
  const broadcastNewsCount = samplePosts.length;
  const tithesTotal = 5000;
  const donationsTotal = 15000;
  const expensesTotal = 3500;
  const vaultTotal = tithesTotal + donationsTotal - expensesTotal;

  return (
    <div
      className="space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen p-6"
      id="admin-global-command-panel"
    >
      {/* HEADER HERO AREA - Premium Design */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-8 border border-slate-700/50 overflow-hidden shadow-2xl">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-[10px] bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30 text-indigo-300 font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Global Administration Portal
              </span>
            </div>
            <h1 className="text-3xl font-sans font-black tracking-tight">
              Superuser Control{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Command Center
              </span>
            </h1>
            <p className="text-sm text-slate-400 font-sans mt-1 max-w-2xl">
              Oversee active congregational campuses, deploy event schedulers,
              review financial ledgers, and manage role security with
              enterprise-grade tools.
            </p>
          </div>

          {/* Global Statistical Aggregates - Premium */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700 shrink-0">
            <div className="px-3 border-r border-slate-700 text-left">
              <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Users className="h-2.5 w-2.5" />
                Members directory
              </span>
              <span className="text-2xl font-sans font-black text-white">
                {totalMembers}
              </span>
            </div>
            <div className="px-3 border-r border-slate-700 text-left">
              <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-2.5 w-2.5" />
                Church events
              </span>
              <span className="text-2xl font-sans font-black text-indigo-400">
                {upcomingEventsCount}
              </span>
            </div>
            <div className="px-3 border-r border-slate-700 text-left">
              <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Newspaper className="h-2.5 w-2.5" />
                Homepage updates
              </span>
              <span className="text-2xl font-sans font-black text-sky-400">
                {broadcastNewsCount}
              </span>
            </div>
            <div className="px-3 text-left">
              <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Landmark className="h-2.5 w-2.5" />
                Financial vault
              </span>
              <span
                className={`text-xl font-sans font-black block truncate mt-1 ${vaultTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}
              >
                ₱{vaultTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE SPLIT SCREEN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[640px]">
        {/* LEFT SIDEBAR NAVIGATION - Premium */}
        <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-4 flex flex-col h-full">
            <div className="space-y-1">
              <div className="pb-3 mb-3 border-b border-slate-100 px-2 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                  Menu Console
                </span>
                <span className="text-[8px] font-mono bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-black shadow-sm">
                  SUPERUSER
                </span>
              </div>

              {/* Members Button */}
              <button
                onClick={() => setActiveTab("members")}
                className={`group relative w-full flex items-center gap-3 px-4 py-3 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                  activeTab === "members"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Users
                  className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${activeTab === "members" ? "text-white" : "text-slate-400"}`}
                />
                <span className="flex-1 text-left">Members & Users</span>
                {activeTab === "members" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                )}
              </button>

              {/* Events Button */}
              <button
                onClick={() => setActiveTab("events")}
                className={`group relative w-full flex items-center gap-3 px-4 py-3 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                  activeTab === "events"
                    ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-500/25"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Calendar
                  className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${activeTab === "events" ? "text-white" : "text-slate-400"}`}
                />
                <span className="flex-1 text-left">Events Schedules</span>
                {activeTab === "events" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                )}
              </button>

              {/* Updates & Dispatches Button - FIXED */}
              <button
                onClick={() => setActiveTab("posts")}
                className={`group relative w-full flex items-center gap-3 px-4 py-3 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                  activeTab === "posts"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <BookOpen
                  className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${activeTab === "posts" ? "text-white" : "text-slate-400"}`}
                />
                <span className="flex-1 text-left">Updates & Dispatches</span>
                {activeTab === "posts" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                )}
              </button>

              {/* Ledger & Vault Button - FIXED */}
              <button
                onClick={() => setActiveTab("finances")}
                className={`group relative w-full flex items-center gap-3 px-4 py-3 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                  activeTab === "finances"
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Database
                  className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${activeTab === "finances" ? "text-white" : "text-slate-400"}`}
                />
                <span className="flex-1 text-left">Ledger & Vault</span>
                {activeTab === "finances" && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                )}
              </button>
            </div>

            <div className="mt-auto pt-6 mt-6 border-t border-slate-100">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-700">
                    Access Lock
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">
                  Hardware verification active. Offline-sync buffers credentials
                  securely.
                </p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[7px] font-mono text-emerald-600">
                    SECURE CONNECTION
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SYSTEM CONTROL PANEL VIEWPORT - Premium */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* TAB 1: MEMBERS DIRECTORY */}
          {activeTab === "members" && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Search members by Email, ID or Full Name..."
                  />
                </div>
                <div className="flex gap-2">
                  <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                    <option>All Security Roles</option>
                  </select>
                  <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                    <option>All Extensions</option>
                  </select>
                  <button className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span>Register Member</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 font-mono font-bold uppercase tracking-wider border-b-2 border-slate-200">
                      <th className="p-4">Ref ID</th>
                      <th className="p-4">Member</th>
                      <th className="p-4">Extension</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sampleMembers.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-indigo-50/30 transition-colors"
                      >
                        <td className="p-4 font-mono text-xs text-slate-500">
                          {m.id}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                              {m.firstName[0]}
                              {m.lastName[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {m.firstName} {m.lastName}
                              </div>
                              <div className="text-xs text-slate-400">
                                {m.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium">{m.extension}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                              m.role === "Admin"
                                ? "bg-red-100 text-red-700"
                                : m.role === "Pastor"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {m.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              m.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${m.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                            />
                            {m.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
                      Administrative Security Audit Logs
                    </span>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ACTIVE VERIFICATION
                  </span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {sampleAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex justify-between text-xs p-1.5 hover:bg-slate-100 rounded transition"
                    >
                      <div className="flex gap-3">
                        <span className="font-mono text-slate-400">
                          {log.timestamp}
                        </span>
                        <span className="text-slate-700">{log.action}</span>
                        <span className="bg-slate-200 text-slate-600 px-1.5 rounded text-[9px] font-mono">
                          {log.target}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[9px] font-mono">
                        {log.isOnline ? "● SYNCED" : "○ LOCAL"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVENTS SCHEDULER */}
          {activeTab === "events" && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-sans font-black text-slate-900">
                    Chapel Collective Programs
                  </h2>
                  <p className="text-sm text-slate-500">
                    Verify calendar schedules globally.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm"
                      placeholder="Find events..."
                    />
                  </div>
                  <select className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                    <option>All Ministries</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="p-4 text-left">Event</th>
                      <th className="p-4 text-left">Date & Time</th>
                      <th className="p-4 text-left">Ministry</th>
                      <th className="p-4 text-left">Location</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sampleEvents.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="p-4 font-semibold">{e.title}</td>
                        <td className="p-4 text-slate-600">
                          {e.date} • {e.time}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                            {e.ministryType}
                          </span>
                        </td>
                        <td className="p-4">{e.extension}</td>
                        <td className="p-4 text-right">
                          <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: UPDATES & DISPATCHES */}
          {activeTab === "posts" && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-sans font-black text-slate-900">
                    Updates & News Broadcasts
                  </h2>
                  <p className="text-sm text-slate-500">
                    Manage community announcements and dispatches.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm"
                      placeholder="Search posts..."
                    />
                  </div>
                  <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-sm flex items-center gap-2 hover:from-emerald-700 hover:to-teal-700 transition shadow-md">
                    <Plus className="h-4 w-4" />
                    Compose Broadcast
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {samplePosts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border rounded-xl p-4 hover:shadow-md transition flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            p.type === "announcement"
                              ? "bg-indigo-100 text-indigo-700"
                              : p.type === "study"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {p.type === "announcement"
                            ? "Announcement"
                            : p.type === "study"
                              ? "Sermon Notes"
                              : "General"}
                        </span>
                        <span className="text-xs text-slate-400">{p.date}</span>
                      </div>
                      <h3 className="font-bold text-slate-900">{p.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {p.extension} • {p.active ? "Published" : "Draft"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className={`p-2 rounded-lg transition ${
                          p.active
                            ? "text-amber-600 hover:bg-amber-50"
                            : "text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {p.active ? (
                          <X className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <button className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LEDGER & VAULT */}
          {activeTab === "finances" && (
            <div className="p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-emerald-600 font-semibold">
                        Total Tithes
                      </p>
                      <p className="text-2xl font-bold text-emerald-700">
                        ₱{tithesTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-emerald-200 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-emerald-700" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-indigo-600 font-semibold">
                        Donations
                      </p>
                      <p className="text-2xl font-bold text-indigo-700">
                        ₱{donationsTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-indigo-200 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-indigo-700" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-4 border border-rose-200">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-rose-600 font-semibold">
                        Expenses
                      </p>
                      <p className="text-2xl font-bold text-rose-700">
                        ₱{expensesTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-rose-200 flex items-center justify-center">
                      <ArrowDownRight className="h-5 w-5 text-rose-700" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold">
                        Vault Balance
                      </p>
                      <p className="text-2xl font-bold text-emerald-400">
                        ₱{vaultTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-indigo-900 flex items-center justify-center">
                      <Landmark className="h-5 w-5 text-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-mono font-bold text-slate-500 uppercase">
                    Integrated Financial Registers
                  </h3>
                  <p className="text-xs text-slate-400">
                    Audit transaction sheets and reconcile vaults.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm"
                      placeholder="Filter transactions..."
                    />
                  </div>
                  <select className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                    <option>All Categories</option>
                  </select>
                  <select className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white">
                    <option>All Campuses</option>
                  </select>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                      <th className="p-4 text-left font-bold text-slate-600">
                        Receipt
                      </th>
                      <th className="p-4 text-left font-bold text-slate-600">
                        Date
                      </th>
                      <th className="p-4 text-left font-bold text-slate-600">
                        Category
                      </th>
                      <th className="p-4 text-left font-bold text-slate-600">
                        Description
                      </th>
                      <th className="p-4 text-right font-bold text-slate-600">
                        Amount
                      </th>
                      <th className="p-4 text-right font-bold text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sampleFinances.map((f) => (
                      <tr
                        key={f.id}
                        className="hover:bg-amber-50/30 transition-colors"
                      >
                        <td className="p-4 font-mono text-xs">
                          {f.receiptNumber}
                        </td>
                        <td className="p-4">{f.date}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              f.category === "tithe"
                                ? "bg-emerald-100 text-emerald-700"
                                : f.category === "donation"
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {f.category}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs truncate">
                          {f.description}
                        </td>
                        <td
                          className={`p-4 text-right font-bold ${f.amount < 0 ? "text-rose-600" : "text-emerald-600"}`}
                        >
                          {f.amount < 0 ? "-" : "+"}₱
                          {Math.abs(f.amount).toLocaleString()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition">
                              <Shield className="h-4 w-4" />
                            </button>
                            <button className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
