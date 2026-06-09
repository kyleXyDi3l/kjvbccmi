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
    <div className="space-y-6" id="admin-global-command-panel">
      {/* HEADER HERO AREA */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] bg-indigo-950 border border-indigo-700 text-indigo-300 font-mono font-black uppercase tracking-widest px-3 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              <span>Global Administration Portal</span>
            </span>
          </div>
          <h1 className="text-2xl font-sans font-black tracking-tight flex items-center gap-2">
            Superuser Control Command Center
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Oversee active congregational campuses, deploy event schedulers,
            review financial ledgers, and manage role security.
          </p>
        </div>

        {/* Global Statistical Aggregates */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 shrink-0 select-none">
          <div className="px-3 border-r border-slate-800 text-left">
            <span className="block text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              Members directory
            </span>
            <span className="text-lg font-sans font-black text-white">
              {totalMembers}
            </span>
          </div>
          <div className="px-3 border-r border-slate-800 text-left">
            <span className="block text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              Church events
            </span>
            <span className="text-lg font-sans font-black text-indigo-400">
              {upcomingEventsCount}
            </span>
          </div>
          <div className="px-3 border-r border-slate-800 text-left">
            <span className="block text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              Homepage updates
            </span>
            <span className="text-lg font-sans font-black text-sky-400">
              {broadcastNewsCount}
            </span>
          </div>
          <div className="px-3 text-left">
            <span className="block text-[8px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              Financial vault
            </span>
            <span
              className={`text-sm font-sans font-black block truncate mt-1 leading-none ${vaultTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              ₱{vaultTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* CORE SPLIT SCREEN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[640px]">
        {/* LEFT SIDEBAR NAVIGATION */}
        <div className="w-full lg:w-64 shrink-0 bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="space-y-1.5 flex flex-col">
            <div className="pb-3 mb-2 border-b border-slate-100 px-2 flex items-center justify-between select-none">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                Menu Console
              </span>
              <span className="text-[8px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-black">
                SUPERUSER
              </span>
            </div>

            <button
              onClick={() => setActiveTab("members")}
              className={`flex items-center gap-3 px-3.5 py-3 text-xs font-extrabold rounded-xl transition text-left cursor-pointer ${activeTab === "members" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Users className="h-4.5 w-4.5" /> <span>Members & Users</span>
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`flex items-center gap-3 px-3.5 py-3 text-xs font-extrabold rounded-xl transition text-left cursor-pointer ${activeTab === "events" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Calendar className="h-4.5 w-4.5" /> <span>Events Schedules</span>
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-3 px-3.5 py-3 text-xs font-extrabold rounded-xl transition text-left cursor-pointer ${activeTab === "posts" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <BookOpen className="h-4.5 w-4.5" />{" "}
              <span>Updates & Dispatches</span>
            </button>
            <button
              onClick={() => setActiveTab("finances")}
              className={`flex items-center gap-3 px-3.5 py-3 text-xs font-extrabold rounded-xl transition text-left cursor-pointer ${activeTab === "finances" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Database className="h-4.5 w-4.5" /> <span>Ledger & Vault</span>
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 px-2 space-y-1 select-none">
            <div className="flex items-center gap-1.5 text-indigo-700">
              <Shield className="h-3 w-3" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                Access Lock
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans leading-tight">
              Hardware verification active. Offline-sync buffers credentials
              securely in background states.
            </p>
          </div>
        </div>

        {/* RIGHT SYSTEM CONTROL PANEL VIEWPORT */}
        <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          {/* TAB 1: MEMBERS DIRECTORY */}
          {activeTab === "members" && (
            <div className="p-5 flex flex-col space-y-4 h-full">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-350 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-650 text-slate-800"
                    placeholder="Search members by Email, ID or Full Name details..."
                  />
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                  <select className="bg-slate-50 border border-slate-350 text-slate-700 text-xs rounded-lg px-2 py-2 focus:outline-none font-semibold cursor-pointer">
                    <option>All Security Roles</option>
                  </select>
                  <select className="bg-slate-50 border border-slate-350 text-slate-700 text-xs rounded-lg px-2 py-2 focus:outline-none font-semibold cursor-pointer">
                    <option>All Extensions</option>
                  </select>
                  <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-slate-900 transition-all font-bold font-sans text-xs text-white rounded-lg shrink-0 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-xs"
                  >
                    <UserPlus className="h-3.5 w-3.5" />{" "}
                    <span>Register Member</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-mono font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3">Ref Credentials</th>
                      <th className="p-3">Gospel Member</th>
                      <th className="p-3">Extension Branch</th>
                      <th className="p-3">Administrative Role</th>
                      <th className="p-3">Registry status</th>
                      <th className="p-3 text-right">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                    {sampleMembers.map((m) => (
                      <tr
                        key={m.id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="p-3 font-mono text-[10px] text-slate-400">
                          {m.id}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-900">
                            {m.firstName} {m.lastName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {m.email}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-slate-650">
                          {m.extension}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${m.role === "Admin" ? "bg-red-50 text-red-700 border border-red-200" : m.role === "Pastor" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-50 text-slate-600 border border-slate-205"}`}
                          >
                            {m.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold font-mono uppercase ${m.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200 animate-pulse"}`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex gap-1.5 justify-end">
                            <button className="p-1.5 rounded-md bg-emerald-50 hover:bg-emerald-650 hover:text-white text-emerald-700 transition cursor-pointer">
                              <UserCheck className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingMember(m)}
                              className="p-1.5 rounded-md bg-indigo-50 hover:bg-indigo-650 hover:text-white text-indigo-700 transition cursor-pointer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingUserId(m.id)}
                              className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 border rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between items-center select-none pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-mono uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-indigo-600" />{" "}
                    Administrative Security Audit Logs
                  </span>
                  <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full font-bold">
                    ACTIVE DECK VERIFICATION
                  </span>
                </div>
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                  {sampleAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex justify-between text-[10px] hover:bg-slate-100 p-1 rounded font-sans transition"
                    >
                      <div className="flex gap-2 items-center text-slate-650">
                        <span className="font-mono text-[9px] text-slate-400">
                          {log.timestamp}
                        </span>
                        <span className="text-slate-800 font-medium">
                          {log.action}
                        </span>
                        <span className="bg-slate-200 text-slate-600 px-1.5 rounded text-[8px] font-mono uppercase font-bold">
                          {log.target}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[8px]">
                        {log.isOnline ? "● SYNCED" : "○ LOCAL BUFFER"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVENTS SCHEDULER */}
          {activeTab === "events" && (
            <div className="p-5 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-sm font-sans font-black text-slate-900 uppercase">
                    Chapel Collective Programs
                  </h2>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Verify calendar schedules and unschedule/delete records
                    globally.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      className="bg-slate-50 border border-slate-350 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none text-slate-800"
                      placeholder="Find event schedules..."
                    />
                  </div>
                  <select className="bg-slate-50 border border-slate-350 text-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none font-semibold cursor-pointer">
                    <option>All Ministries</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-mono font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Schedule Date</th>
                      <th className="p-3">Ministry Type</th>
                      <th className="p-3">Event Topic Title</th>
                      <th className="p-3">Affiliation Area</th>
                      <th className="p-3 text-right">Ledger actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-750">
                    {sampleEvents.map((e) => (
                      <tr
                        key={e.id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="p-3 font-mono text-[10px] text-slate-400">
                          {e.id}
                        </td>
                        <td className="p-3 font-mono text-xs">
                          {e.date} • {e.time}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase bg-indigo-50 border border-indigo-200 text-indigo-700">
                            {e.ministryType}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900">
                          {e.title}
                        </td>
                        <td className="p-3 font-medium text-slate-600">
                          {e.extension}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedEventDetails(e)}
                              className="p-1 px-2.2 text-[10px] font-bold border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                            >
                              View Details
                            </button>
                            <button className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white rounded text-rose-700 transition cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
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

          {/* TAB 3: BROADCAST UPDATES & POSTS */}
          {activeTab === "posts" && (
            <div className="p-5 flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-sm font-sans font-black text-slate-900 uppercase">
                    Updates & News Broadcast dispatches
                  </h2>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Regulate publication announcements shown to community
                    members.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      className="bg-slate-50 border border-slate-350 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none text-slate-800"
                      placeholder="Search posts..."
                    />
                  </div>
                  <select className="bg-slate-50 border border-slate-350 text-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none font-semibold cursor-pointer">
                    <option>All Types</option>
                  </select>
                  <button
                    onClick={() => setIsAddPostModalOpen(true)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-slate-900 transition-all font-bold font-sans text-xs text-white rounded-lg shrink-0 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Compose Broadcast</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-mono font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Launch Date</th>
                      <th className="p-3">Category type</th>
                      <th className="p-3">Dispatch Topic Title</th>
                      <th className="p-3">Home Extension</th>
                      <th className="p-3">Feed status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-750">
                    {samplePosts.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="p-3 font-mono text-[10px] text-slate-400">
                          {p.id}
                        </td>
                        <td className="p-3 font-mono text-xs">{p.date}</td>
                        <td className="p-3 uppercase font-mono text-[9px] font-bold">
                          <span
                            className={`px-2 py-0.5 rounded ${p.type === "study" ? "bg-amber-50 text-amber-700 border border-amber-200" : p.type === "announcement" ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-slate-50 text-slate-700 border border-slate-200"}`}
                          >
                            {p.type === "study"
                              ? "Sermon notes"
                              : p.type === "announcement"
                                ? "Announcement"
                                : "General Blog"}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900 truncate max-w-[150px]">
                          {p.title}
                        </td>
                        <td className="p-3 font-semibold text-slate-600">
                          {p.extension}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-bold font-mono tracking-wide border uppercase ${p.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"}`}
                          >
                            {p.active ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1">
                            <button
                              className={`p-1.5 rounded transition cursor-pointer ${p.active ? "bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-700" : "bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700"}`}
                            >
                              {p.active ? (
                                <X className="h-3.5 w-3.5" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => setSelectedPostDetails(p)}
                              className="p-1 px-2 text-[10px] font-semibold border rounded-lg hover:bg-slate-50 cursor-pointer"
                            >
                              View
                            </button>
                            <button className="p-1.5 bg-rose-50 hover:bg-rose-650 hover:text-white text-rose-700 rounded transition cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
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

          {/* TAB 4: FINANCIAL GENERAL LEDGER */}
          {activeTab === "finances" && (
            <div className="p-5 flex flex-col space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 border rounded-xl p-3.5 flex justify-between items-center select-none shadow-2xs">
                  <div>
                    <span className="block text-[8.5px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                      Total Campus Tithes
                    </span>
                    <span className="text-base font-sans font-black text-slate-800 mt-0.5 block">
                      ₱{tithesTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <ArrowUpRight className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="bg-slate-50 border rounded-xl p-3.5 flex justify-between items-center select-none shadow-2xs">
                  <div>
                    <span className="block text-[8.5px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                      Voluntary Donations
                    </span>
                    <span className="text-base font-sans font-black text-indigo-700 mt-0.5 block">
                      ₱{donationsTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 bg-indigo-50 text-indigo-650 rounded-lg">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="bg-slate-50 border rounded-xl p-3.5 flex justify-between items-center select-none shadow-2xs">
                  <div>
                    <span className="block text-[8.5px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                      Operational Cost Flows
                    </span>
                    <span className="text-base font-sans font-black text-rose-600 mt-0.5 block">
                      ₱{expensesTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <ArrowDownRight className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-950 text-white rounded-xl p-3.5 flex justify-between items-center select-none shadow-sm">
                  <div>
                    <span className="block text-[8.5px] font-mono uppercase text-slate-500 font-bold tracking-wider">
                      Headquarters Vault
                    </span>
                    <span className="text-base font-sans font-black text-emerald-400 mt-0.5 block">
                      ₱{vaultTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 bg-indigo-950 text-indigo-400 rounded-lg">
                    <Database className="h-4.5 w-4.5" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-2">
                <div>
                  <h3 className="text-xs font-mono tracking-wider font-extrabold text-slate-400 uppercase">
                    Integrated Financial Registers
                  </h3>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                    Audit transaction sheets, reconcile vaults, and purge
                    records.
                  </p>
                </div>
                <div className="flex gap-2 font-sans">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      className="bg-slate-50 border border-slate-350 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none text-slate-800"
                      placeholder="Filter contributor or code..."
                    />
                  </div>
                  <select className="bg-slate-50 border border-slate-350 text-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none font-semibold cursor-pointer">
                    <option>All Categories</option>
                  </select>
                  <select className="bg-slate-50 border border-slate-350 text-slate-700 text-xs rounded-lg px-2 py-1.5 focus:outline-none font-semibold cursor-pointer">
                    <option>All Campuses</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-mono font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Reconciliation Date</th>
                      <th className="p-3">Log Category</th>
                      <th className="p-3">Contributor / Operational Outline</th>
                      <th className="p-3">Branch Location</th>
                      <th className="p-3 text-right">
                        Transaction Ledger Value
                      </th>
                      <th className="p-3 text-right">
                        Audit verification actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-755">
                    {sampleFinances.map((f) => {
                      const isNegative = f.amount < 0;
                      const isAudited = auditedReceiptIds.has(f.id);
                      return (
                        <tr
                          key={f.id}
                          className="hover:bg-slate-50/50 transition"
                        >
                          <td className="p-3 font-mono text-[10px] text-slate-400">
                            {f.receiptNumber}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-650">
                            {f.date}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[9.5px] font-bold font-mono uppercase border ${f.category === "tithe" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : f.category === "donation" ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}
                            >
                              {f.category}
                            </span>
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-slate-900">
                              {f.description}
                            </p>
                            {f.contributorName && (
                              <p className="text-[10px] text-slate-400">
                                By: {f.contributorName}
                              </p>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-slate-600">
                            {f.extension} Campus
                          </td>
                          <td
                            className={`p-3 text-right font-mono font-bold text-sm ${isNegative ? "text-rose-600" : "text-emerald-700"}`}
                          >
                            {isNegative ? "-" : "+"}₱
                            {Math.abs(f.amount).toLocaleString()}
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1 font-sans">
                              <button
                                onClick={() => {
                                  const newSet = new Set(auditedReceiptIds);
                                  if (newSet.has(f.id)) newSet.delete(f.id);
                                  else newSet.add(f.id);
                                  setAuditedReceiptIds(newSet);
                                }}
                                className={`px-2 py-1.2 rounded-lg text-[9px] font-bold border flex items-center gap-1.5 transition cursor-pointer ${isAudited ? "bg-emerald-550 border-emerald-600 text-white hover:bg-rose-600 hover:border-rose-650" : "bg-white border-slate-350 hover:bg-slate-50 text-slate-600"}`}
                              >
                                {isAudited ? (
                                  <CheckCircle className="h-3.5 w-3.5" />
                                ) : (
                                  <Shield className="h-3.5 w-3.5" />
                                )}
                                <span>
                                  {isAudited
                                    ? "Verified Approved"
                                    : "Audit Verify"}
                                </span>
                              </button>
                              <button className="p-1.5 bg-rose-50 hover:bg-rose-650 hover:text-white text-rose-700 rounded transition cursor-pointer">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Event Details */}
      {selectedEventDetails && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-205 overflow-hidden flex flex-col font-sans select-none">
            <div className="bg-slate-950 p-5 text-white flex justify-between items-center border-b border-indigo-950">
              <div className="text-left">
                <span className="text-[9.5px] font-mono tracking-wider font-extrabold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded uppercase">
                  Event Details HUD
                </span>
                <h3 className="font-sans font-black text-sm mt-1 uppercase max-w-[340px] truncate">
                  {selectedEventDetails.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="text-slate-400 hover:text-white font-bold p-1 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 border border-slate-100 rounded-xl">
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-wide text-slate-400 uppercase">
                    Target Extension
                  </span>
                  <span className="text-xs font-semibold text-slate-800 block mt-0.5">
                    {selectedEventDetails.extension} Campus
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold tracking-wide text-slate-400 uppercase">
                    Ministry Ministry Group
                  </span>
                  <span className="text-xs font-bold text-indigo-700 block mt-0.5 uppercase">
                    {selectedEventDetails.ministryType}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-slate-200">
                  <span className="text-[9px] font-mono font-bold tracking-wide text-slate-400 uppercase">
                    Calendar Scheduled Date
                  </span>
                  <span className="text-xs font-sans font-semibold text-slate-800 block mt-0.5">
                    {selectedEventDetails.date}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-slate-200">
                  <span className="text-[9px] font-mono font-bold tracking-wide text-slate-400 uppercase">
                    Standard Session Hours
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-800 block mt-0.5">
                    {selectedEventDetails.time || "17:00 PH Standard"}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold tracking-wide text-slate-400 uppercase">
                  Comprehensive Outline Description
                </span>
                <p className="text-xs text-slate-650 leading-relaxed bg-slate-50 border p-3.5 rounded-xl block select-text">
                  Sample event description for {selectedEventDetails.title}.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="py-2 px-5 bg-indigo-650 text-white font-extrabold text-xs rounded-xl hover:bg-slate-900 transition flex items-center gap-1.5 shadow cursor-pointer uppercase tracking-wider"
              >
                <Check className="h-4.5 w-4.5" />
                <span>Understood</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Post Details */}
      {selectedPostDetails && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-205 overflow-hidden flex flex-col font-sans select-none">
            <div className="bg-slate-950 p-5 text-white flex justify-between items-center border-b border-sky-950">
              <div className="text-left">
                <span className="text-[9.5px] font-mono tracking-wider font-extrabold text-sky-400 bg-sky-950 px-2 py-0.5 rounded uppercase">
                  Broadcast Viewer
                </span>
                <h3 className="font-sans font-black text-sm mt-1 uppercase max-w-[340px] truncate">
                  {selectedPostDetails.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPostDetails(null)}
                className="text-slate-400 hover:text-white font-bold p-1 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-left">
              <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 border border-slate-100 rounded-xl leading-none">
                <div>
                  <span className="text-[9.5px] font-mono font-bold tracking-wide text-slate-400 uppercase">
                    Target Extension
                  </span>
                  <span className="text-xs font-semibold text-slate-850 block mt-1.5">
                    {selectedPostDetails.extension} Channel
                  </span>
                </div>
                <div>
                  <span className="text-[9.5px] font-mono font-bold tracking-wide text-slate-400 uppercase">
                    Category Category
                  </span>
                  <span className="text-xs font-bold text-sky-700 block mt-1.5 uppercase leading-none">
                    {selectedPostDetails.type}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-slate-195">
                  <span className="text-[9.5px] font-mono font-bold tracking-wide text-slate-400 uppercase">
                    Launch Dispatch Date
                  </span>
                  <span className="text-xs font-sans font-semibold text-slate-850 block mt-1.5">
                    {selectedPostDetails.date}
                  </span>
                </div>
                <div className="pt-2.5 border-t border-slate-195">
                  <span className="text-[9.5px] font-mono font-bold tracking-wide text-slate-400 uppercase">
                    Public Dispatch Area
                  </span>
                  <span className="text-xs font-bold text-emerald-600 block mt-1.5 uppercase">
                    {selectedPostDetails.active
                      ? "● Published Live"
                      : "○ Staged Draft"}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold tracking-wide text-slate-400 uppercase font-bold">
                  Unformatted Message Headline
                </span>
                <p className="text-xs text-slate-650 leading-relaxed bg-slate-50 border p-3.5 rounded-xl block select-text">
                  Sample post content for {selectedPostDetails.title}.
                </p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
              <button
                type="button"
                className={`py-2 px-4 font-bold text-xs rounded-xl border transition cursor-pointer uppercase tracking-wider ${selectedPostDetails.active ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 border-emerald-205 text-emerald-800 hover:bg-emerald-110"}`}
              >
                <span>
                  {selectedPostDetails.active
                    ? "Toggle Demote to Draft"
                    : "Approve Publication"}
                </span>
              </button>
              <button
                onClick={() => setSelectedPostDetails(null)}
                className="py-2 px-5 bg-sky-600 text-slate-900 font-extrabold text-xs rounded-xl hover:bg-slate-900 hover:text-white transition flex items-center gap-1.5 shadow cursor-pointer uppercase tracking-wider"
              >
                <Check className="h-4.5 w-4.5" />
                <span>Understood</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Confirmation */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-5 border max-w-sm w-full text-left font-sans space-y-4">
            <div className="flex gap-3 text-rose-600">
              <ShieldAlert className="h-6 w-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm uppercase">
                  Revoke / Delete User Credentials
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Are you absolutely sure you want to delete this member
                  account? This terminates their active session passes and
                  deletes their profile credentials.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setDeletingUserId(null)}
                className="py-1.5 px-3.5 border font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition text-xs cursor-pointer"
              >
                Cancel Purge
              </button>
              <button
                onClick={() => setDeletingUserId(null)}
                className="py-1.5 px-4 bg-rose-600 text-white font-extrabold rounded-lg hover:bg-rose-700 transition text-xs cursor-pointer uppercase tracking-wide flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Erase Member Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Member */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col font-sans">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center border-b border-indigo-950">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm tracking-wider uppercase">
                  Register Member Account
                </h3>
              </div>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    First Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800"
                    placeholder="e.g. Junel"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800"
                    placeholder="e.g. Diel"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Email Address *
                </label>
                <input
                  type="email"
                  className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800"
                  placeholder="pastor@church.org"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Phone Credentials
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800"
                  placeholder="+63 9xx xxx xxxx"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Role Badge
                  </label>
                  <select className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800 cursor-pointer font-medium">
                    <option>Regular Church Member</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Campus Extension
                  </label>
                  <select className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800 cursor-pointer font-medium">
                    <option>Naga Extension</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Initial Password Account Entry
                </label>
                <input
                  type="password"
                  className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800"
                  placeholder="Type temporary passcode..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="py-2 px-4 border border-slate-300 font-semibold text-slate-650 rounded-lg hover:bg-slate-50 transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-lg transition text-xs cursor-pointer uppercase tracking-wide flex items-center gap-1.5 shadow"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Publish Member Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Member */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col font-sans">
            <div className="bg-indigo-950 px-6 py-4 text-white flex justify-between items-center border-b border-indigo-900">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm tracking-wider uppercase">
                  Edit User Credentials
                </h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-xs leading-relaxed text-indigo-955 flex items-start gap-2.5">
                <AlertCircle className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Subject Account Selected:</p>
                  <p className="font-mono font-black text-[12px] mt-0.5 text-slate-900">
                    {editingMember.firstName} {editingMember.lastName}
                  </p>
                  <p className="font-mono text-slate-500 text-[11px] break-all">
                    {editingMember.email}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Assign Security Role
                </label>
                <select className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800 font-medium cursor-pointer">
                  <option>Administrator (Superuser Access)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Home Extension Campus
                </label>
                <select className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800 font-medium cursor-pointer">
                  <option>Global HQ Office</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Account Status State
                </label>
                <select className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800 font-medium cursor-pointer">
                  <option>Active & Compliant</option>
                </select>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Force Password Reset
                  </label>
                  <span className="text-[9px] text-rose-600 font-black uppercase tracking-wider">
                    Security Force Update
                  </span>
                </div>
                <input
                  type="password"
                  className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800 placeholder:text-slate-400"
                  placeholder="Type new secure credentials string if forcing reset..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setEditingMember(null)}
                  className="py-2 px-4 border border-slate-300 font-semibold text-slate-650 rounded-lg hover:bg-slate-50 transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-lg transition text-xs cursor-pointer uppercase tracking-wide flex items-center gap-1.5 shadow"
                >
                  <Save className="h-4 w-4" />
                  <span>Commit Account Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Post */}
      {isAddPostModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col font-sans">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center border-b border-indigo-950">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-400" />
                <h3 className="font-extrabold text-sm tracking-wider uppercase">
                  Compose News Broadcast
                </h3>
              </div>
              <button
                onClick={() => setIsAddPostModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Dispatch Headline Topic *
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800 font-semibold"
                  placeholder="e.g. Naga Thanksgiving Service Update"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Subject Category
                  </label>
                  <select className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800 cursor-pointer font-bold">
                    <option>Announcement Notice</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Channel Extension Targeting
                  </label>
                  <select className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-800 cursor-pointer font-bold">
                    <option>Global HQ Channels</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  Dispatch Core Contents *
                </label>
                <textarea
                  rows={6}
                  className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-600 text-slate-850 font-sans leading-relaxed"
                  placeholder="Type dynamic publication bulletin or sermon guides..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsAddPostModalOpen(false)}
                  className="py-2 px-4 border border-slate-300 font-semibold text-slate-650 rounded-lg hover:bg-slate-50 transition text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold rounded-lg transition text-xs cursor-pointer uppercase tracking-wide flex items-center gap-1.5 shadow"
                >
                  <Plus className="h-4 w-4" />
                  <span>Publish Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
