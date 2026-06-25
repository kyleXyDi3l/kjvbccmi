import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "../supabase-client";
import {
  Home,
  Calendar,
  BookOpen,
  Heart,
  Bell,
  Church,
  Users,
  Video,
  Music,
  MapPin,
  Eye,
  ThumbsUp,
  Clock,
  Mail,
  Phone,
  Crown,
  Flame,
  Gift,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Star,
  Award,
  User,
  Wallet,
  FolderKanban,
  Search,
  X,
  Shield,
  CheckCircle,
  Landmark,
  TrendingDown,
  PhilippinePeso,
  FileText,
  Download,
  Printer,
  Copy,
} from "lucide-react";

// Reusable Components
import LoadingSpinner from "./Shared/LoadingSpinner";
import DigitalIDCard from "./Shared/DigitalIDCard";
import CollapsibleSidebar from "./Shared/CollapsibleSidebar";

export default function UserDashboard({ userData, session, onLogout }) {
  // --- Navigation State ---
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Member Data
  const [memberData, setMemberData] = useState(null);
  const [memberChurch, setMemberChurch] = useState(null);

  // Church Financial Data
  const [churchFinances, setChurchFinances] = useState([]);
  const [churchStats, setChurchStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    offering: 0,
    donations: 0,
  });

  // Events Data
  const [churchEvents, setChurchEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventTransactions, setEventTransactions] = useState([]);
  const [eventStats, setEventStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
  });
  const [showEventDetail, setShowEventDetail] = useState(false);

  // Members Data for Search
  const [allMembers, setAllMembers] = useState([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Mock data for user dashboard
  const [userStats] = useState({
    sermonsWatched: 24,
    eventsAttended: 8,
    givingStreak: 3,
    prayerRequests: 5,
  });

  const [upcomingEvents] = useState([
    {
      id: 1,
      title: "Sunday Worship Service",
      date: "2026-06-15",
      time: "09:00 AM",
      location: "Main Sanctuary",
      type: "worship",
    },
    {
      id: 2,
      title: "Youth Bible Study",
      date: "2026-06-17",
      time: "06:30 PM",
      location: "Youth Center",
      type: "youth",
    },
    {
      id: 3,
      title: "Prayer Meeting",
      date: "2026-06-19",
      time: "07:00 PM",
      location: "Prayer Room",
      type: "prayer",
    },
    {
      id: 4,
      title: "Women's Fellowship",
      date: "2026-06-22",
      time: "10:00 AM",
      location: "Fellowship Hall",
      type: "fellowship",
    },
  ]);

  const [recentSermons] = useState([
    {
      id: 1,
      title: "The Power of Faith",
      preacher: "Rey Siaboc",
      date: "2026-06-08",
      duration: "45 min",
      views: 234,
      likes: 89,
    },
    {
      id: 2,
      title: "Walking in Love",
      preacher: "Vengie Alterado",
      date: "2026-06-01",
      duration: "52 min",
      views: 187,
      likes: 67,
    },
    {
      id: 3,
      title: "The Grace of God",
      preacher: "Pastor Rey Siaboc",
      date: "2026-05-25",
      duration: "48 min",
      views: 156,
      likes: 54,
    },
  ]);

  const [announcements] = useState([
    {
      id: 1,
      title: "Church Anniversary Celebration",
      content: "Join us for our 25th Church Anniversary on June 30th!",
      date: "2026-06-10",
      priority: "high",
    },
    {
      id: 2,
      title: "New Member Orientation",
      content: "Welcome new members! Orientation this Saturday at 10 AM.",
      date: "2026-06-09",
      priority: "normal",
    },
    {
      id: 3,
      title: "Bible Study Series",
      content: "New series on the Book of Romans starts this Wednesday.",
      date: "2026-06-08",
      priority: "normal",
    },
  ]);

  const [notifications] = useState([
    {
      id: 1,
      message: "New sermon uploaded: The Power of Faith",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      message: "Reminder: Youth Bible Study tomorrow at 6:30 PM",
      time: "1 day ago",
      read: false,
    },
    {
      id: 3,
      message: "Your prayer request has been answered",
      time: "2 days ago",
      read: true,
    },
  ]);

  // Navigation Items
  const navigationItems = [
    { id: "home", icon: Home, label: "Home Dashboard", color: "indigo" },
    { id: "id-card", icon: User, label: "Digital ID", color: "emerald" },
    { id: "finances", icon: Landmark, label: "Church Finances", color: "sky" },
    {
      id: "events",
      icon: FolderKanban,
      label: "Event Finances",
      color: "amber",
    },
    { id: "members", icon: Users, label: "Members Directory", color: "rose" },
  ];

  // ============================================================
  // DATA FETCHING
  // ============================================================

  const fetchMemberData = useCallback(async () => {
    if (!userData?.id) return;

    const { data, error } = await supabase
      .from("members")
      .select("*, churches(id, name, address, phone, email)")
      .eq("id", userData.id)
      .single();

    if (error) {
      setError("Failed to load member data");
      return;
    }

    setMemberData(data);
    setMemberChurch(data.churches);
  }, [userData]);

  const fetchChurchFinances = useCallback(async () => {
    if (!userData?.churches?.id) return;

    const { data, error } = await supabase
      .from("finances")
      .select("*")
      .eq("churchID", userData.churches.id)
      .is("event_id", null);
    if (error) {
      setError("Failed to load church finances");
      return;
    }

    setChurchFinances(data || []);

    const stats = data.reduce(
      (acc, t) => {
        if (t.amount > 0) {
          acc.totalIncome += t.amount;
          if (t.transType === "Offering") acc.offering += t.amount;
          else if (t.transType === "Donation") acc.donations += t.amount;
        } else {
          acc.totalExpenses += Math.abs(t.amount);
        }
        return acc;
      },
      {
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        offering: 0,
        donations: 0,
      },
    );
    stats.netBalance = stats.totalIncome - stats.totalExpenses;
    setChurchStats(stats);
  }, [userData]);

  const fetchChurchEvents = useCallback(async () => {
    if (!userData?.churches?.id) return;

    const { data, error } = await supabase
      .from("church_events")
      .select("*")
      .eq("churchId", userData.churches.id)
      .order("event_date", { ascending: false });

    if (error) {
      setError("Failed to load church events");
      return;
    }

    setChurchEvents(data || []);
  }, [userData]);

  const fetchEventTransactions = useCallback(async (eventId) => {
    const { data, error } = await supabase
      .from("finances")
      .select("*")
      .eq("event_id", eventId)
      .order("date", { ascending: false });

    if (error) {
      setError("Failed to load event transactions");
      return;
    }

    setEventTransactions(data || []);

    const stats = data.reduce(
      (acc, t) => {
        if (t.amount > 0) acc.totalIncome += t.amount;
        else acc.totalExpenses += Math.abs(t.amount);
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0, netBalance: 0 },
    );
    stats.netBalance = stats.totalIncome - stats.totalExpenses;
    setEventStats(stats);
  }, []);

  const fetchAllMembers = useCallback(async () => {
    if (!userData?.churches?.id) return;

    const { data, error } = await supabase
      .from("members")
      .select(
        "id, firstName, lastName, emailAdd, phoneNumber, role, membershipStatus",
      )
      .eq("churchID", userData.churches.id)
      .order("firstName", { ascending: true });

    if (error) {
      setError("Failed to load members");
      return;
    }

    setAllMembers(data || []);
    setSearchResults(data || []);
  }, [userData]);

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      //setIsLoading(true);
      await Promise.all([
        fetchMemberData(),
        fetchChurchFinances(),
        fetchChurchEvents(),
        fetchAllMembers(),
      ]);
      //setIsLoading(false);
    };
    loadData();
  }, [
    fetchMemberData,
    fetchChurchFinances,
    fetchChurchEvents,
    fetchAllMembers,
  ]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleSearchMembers = (searchTerm) => {
    setMemberSearchTerm(searchTerm);
    if (!searchTerm.trim()) {
      setSearchResults(allMembers);
      return;
    }

    const filtered = allMembers.filter((m) => {
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        m.firstName?.toLowerCase().includes(searchLower) ||
        m.lastName?.toLowerCase().includes(searchLower) ||
        m.emailAdd?.toLowerCase().includes(searchLower)
      );
    });
    setSearchResults(filtered);
  };

  const handleViewEvent = async (event) => {
    setSelectedEvent(event);
    await fetchEventTransactions(event.id);
    setShowEventDetail(true);
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const fullName = memberData
    ? `${memberData.firstName} ${memberData.lastName}`
    : "Beloved";

  // ============================================================
  // RENDER
  // ============================================================

  if (isLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CollapsibleSidebar
        title="Member Portal"
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeItem={activeTab}
        onSelect={setActiveTab}
        items={navigationItems}
        footerTitle={memberChurch?.name || "Member Access"}
        footerText="Welcome to your spiritual hub. Stay connected with your church community."
      />

      {/* RIGHT MAIN CONTENT AREA */}
      <div className={`flex-1 transition-all duration-300`}>
        {/* Top Bar */}
        {/* <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-3 flex justify-end items-center">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">
              {memberChurch?.name || "Church"}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowNotification(!showNotification)}
                className="relative p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <Bell className="h-5 w-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
              {showNotification && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                  <div className="p-3 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 hover:bg-slate-50 cursor-pointer ${!notif.read ? "bg-indigo-50/30" : ""}`}
                      >
                        <p className="text-sm text-slate-700">
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {notif.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div> */}

        {/* Main Content */}
        <main className="p-6">
          {/* ============================================================
              HOME TAB
          ============================================================ */}
          {activeTab === "home" && (
            <div className="space-y-6">
              <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="relative">
                  <h1 className="text-2xl font-bold">
                    {getGreeting()}, {memberData?.firstName || "Beloved"}! 👋
                  </h1>
                  <p className="text-indigo-100 mt-1">
                    Welcome to your spiritual journey dashboard
                  </p>
                  <p className="text-indigo-200 text-sm mt-2">
                    {memberChurch?.name || "Your Church"}
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        {userStats.sermonsWatched}
                      </p>
                      <p className="text-xs text-slate-500">Sermons Watched</p>
                    </div>
                    <Video className="h-8 w-8 text-indigo-400" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        {userStats.eventsAttended}
                      </p>
                      <p className="text-xs text-slate-500">Events Attended</p>
                    </div>
                    <Calendar className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-amber-600">
                        {userStats.givingStreak}
                      </p>
                      <p className="text-xs text-slate-500">Week Streak</p>
                    </div>
                    <Flame className="h-8 w-8 text-amber-400" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-800">
                        {userStats.prayerRequests}
                      </p>
                      <p className="text-xs text-slate-500">Prayer Requests</p>
                    </div>
                    <Heart className="h-8 w-8 text-rose-400" />
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="bg-white rounded-xl p-4 text-center border border-slate-200 hover:shadow-md transition group">
                  <div className="h-12 w-12 rounded-full bg-indigo-50 mx-auto flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    Bible Reading
                  </p>
                </button>
                <button className="bg-white rounded-xl p-4 text-center border border-slate-200 hover:shadow-md transition group">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-2 group-hover:bg-emerald-100 transition">
                    <Heart className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    Prayer Wall
                  </p>
                </button>
                <button className="bg-white rounded-xl p-4 text-center border border-slate-200 hover:shadow-md transition group">
                  <div className="h-12 w-12 rounded-full bg-amber-50 mx-auto flex items-center justify-center mb-2 group-hover:bg-amber-100 transition">
                    <Gift className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    Give Online
                  </p>
                </button>
                <button className="bg-white rounded-xl p-4 text-center border border-slate-200 hover:shadow-md transition group">
                  <div className="h-12 w-12 rounded-full bg-rose-50 mx-auto flex items-center justify-center mb-2 group-hover:bg-rose-100 transition">
                    <Users className="h-6 w-6 text-rose-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    Join Ministry
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================
              DIGITAL ID TAB
          ============================================================ */}
          {activeTab === "id-card" && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-slate-800">
                  🪪 Digital Church ID
                </h1>
                <p className="text-slate-500 mt-1">
                  Your official church membership identification
                </p>
              </div>

              <div className="flex justify-center">
                <DigitalIDCard
                  memberData={memberData}
                  churchName={memberChurch?.name}
                  churchAddress={memberChurch?.address}
                  isDark={false} // Set to true for dark mode version
                />
              </div>
            </div>
          )}

          {/* ============================================================
              CHURCH FINANCES TAB
          ============================================================ */}
          {activeTab === "finances" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  💰 Church Financial Status
                </h1>
                <p className="text-slate-500 mt-1">
                  Overview of {memberChurch?.name || "your church's"} finances
                </p>
              </div>

              {/* Financial Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">
                        Total Income
                      </p>
                      <p className="text-2xl font-bold text-emerald-600">
                        ₱{churchStats.totalIncome.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-emerald-500" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">
                        Total Expenses
                      </p>
                      <p className="text-2xl font-bold text-rose-600">
                        ₱{churchStats.totalExpenses.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center">
                      <TrendingDown className="h-6 w-6 text-rose-500" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">
                        Net Balance
                      </p>
                      <p
                        className={`text-2xl font-bold ${churchStats.netBalance >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        ₱{churchStats.netBalance.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center">
                      <Landmark className="h-6 w-6 text-indigo-500" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">
                        Total Transactions
                      </p>
                      <p className="text-2xl font-bold text-slate-800">
                        {churchFinances.length}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-slate-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">
                    Income Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        Offerings
                      </span>
                      <span className="font-bold text-emerald-600">
                        ₱{churchStats.offering.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        Donations
                      </span>
                      <span className="font-bold text-indigo-600">
                        ₱{churchStats.donations.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        Income/Expense Ratio
                      </span>
                      <span className="font-bold text-slate-800">
                        {churchStats.totalExpenses > 0
                          ? (
                              churchStats.totalIncome /
                              churchStats.totalExpenses
                            ).toFixed(2)
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">
                        Average Income
                      </span>
                      <span className="font-bold text-emerald-600">
                        ₱
                        {churchFinances.length > 0
                          ? (
                              churchStats.totalIncome /
                              churchFinances.filter((t) => t.amount > 0).length
                            ).toLocaleString()
                          : "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800">
                    Recent Transactions
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Date
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Type
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                          Description
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {churchFinances.slice(0, 5).map((t, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-5 py-3 text-slate-600">{t.date}</td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                t.transType === "Offering"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : t.transType === "Donation"
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {t.transType}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            {t.description}
                          </td>
                          <td
                            className={`px-5 py-3 text-right font-medium ${t.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {t.amount >= 0 ? "+" : ""}₱
                            {Math.abs(t.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {churchFinances.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-8 text-center text-slate-400"
                          >
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              EVENT FINANCES TAB
          ============================================================ */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  🎯 Event Finances
                </h1>
                <p className="text-slate-500 mt-1">
                  Track financials for church events
                </p>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {churchEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
                    onClick={() => handleViewEvent(event)}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">
                            {event.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {event.event_date}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            event.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-sky-100 text-sky-700"
                          }`}
                        >
                          {event.status || "Active"}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400">Income</p>
                          <p className="text-sm font-bold text-emerald-600">
                            ₱{event.total_income?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400">Expenses</p>
                          <p className="text-sm font-bold text-rose-600">
                            ₱{event.total_expenses?.toLocaleString() || 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-slate-400">Net</p>
                          <p
                            className={`text-sm font-bold ${(event.net_balance || 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            ₱{event.net_balance?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {churchEvents.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-400">
                    No events found for this church
                  </div>
                )}
              </div>

              {/* Event Detail Modal */}
              {showEventDetail && selectedEvent && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                    <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 sticky top-0 z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-white text-lg">
                            {selectedEvent.title}
                          </h3>
                          <p className="text-sm text-white/80">
                            {selectedEvent.event_date}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowEventDetail(false)}
                          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-6 overflow-y-auto max-h-[70vh]">
                      {/* Event Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">
                            Income
                          </p>
                          <p className="text-lg font-bold text-emerald-700">
                            ₱{eventStats.totalIncome.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-rose-50 rounded-xl p-3 text-center border border-rose-200">
                          <p className="text-[10px] text-rose-600 font-bold uppercase">
                            Expenses
                          </p>
                          <p className="text-lg font-bold text-rose-700">
                            ₱{eventStats.totalExpenses.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`rounded-xl p-3 text-center border ${eventStats.netBalance >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}
                        >
                          <p
                            className={`text-[10px] ${eventStats.netBalance >= 0 ? "text-emerald-600" : "text-rose-600"} font-bold uppercase`}
                          >
                            Net Balance
                          </p>
                          <p
                            className={`text-lg font-bold ${eventStats.netBalance >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                          >
                            ₱{eventStats.netBalance.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Transactions */}
                      <div>
                        <h4 className="font-bold text-slate-800 mb-3">
                          Transactions
                        </h4>
                        {eventTransactions.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-sm">
                            No transactions for this event
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {eventTransactions.map((t, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                        t.transType === "Offering"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : t.transType === "Donation"
                                            ? "bg-indigo-100 text-indigo-700"
                                            : "bg-amber-100 text-amber-700"
                                      }`}
                                    >
                                      {t.transType}
                                    </span>
                                    <span className="text-sm font-medium text-slate-700">
                                      {t.description}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-xs text-slate-400">
                                      {t.date}
                                    </span>
                                    {t.contributorName && (
                                      <span className="text-xs text-slate-400">
                                        • {t.contributorName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span
                                  className={`text-sm font-bold ${t.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                                >
                                  {t.amount >= 0 ? "+" : "-"}₱
                                  {Math.abs(t.amount).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-200 bg-slate-50/50">
                      <button
                        onClick={() => setShowEventDetail(false)}
                        className="w-full py-2.5 border-2 border-slate-200 text-slate-600 font-medium text-sm rounded-xl hover:bg-slate-100 transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================
              MEMBERS DIRECTORY TAB
          ============================================================ */}
          {activeTab === "members" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  👥 Members Directory
                </h1>
                <p className="text-slate-500 mt-1">
                  Find and connect with fellow church members
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search members by name or email..."
                  value={memberSearchTerm}
                  onChange={(e) => handleSearchMembers(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white shadow-sm"
                />
                {memberSearchTerm && (
                  <button
                    onClick={() => handleSearchMembers("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Results Count */}
              <p className="text-sm text-slate-500">
                Found {searchResults.length} member
                {searchResults.length !== 1 ? "s" : ""}
              </p>

              {/* Members Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-lg font-bold text-indigo-600 flex-shrink-0">
                        {member.firstName?.[0]}
                        {member.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                              member.membershipStatus === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {member.membershipStatus || "Active"}
                          </span>
                          {member.role && (
                            <span className="text-[10px] text-slate-400">
                              {member.role}
                            </span>
                          )}
                        </div>
                        {member.emailAdd && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {member.emailAdd}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {searchResults.length === 0 && (
                  <div className="col-span-full text-center py-12 text-slate-400">
                    {memberSearchTerm
                      ? "No members found matching your search"
                      : "No members found in this church"}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
