import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function UserDashboard({ userData, session, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const [showNotification, setShowNotification] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

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
    { id: 1, message: "New sermon uploaded: The Power of Faith", time: "2 hours ago", read: false },
    { id: 2, message: "Reminder: Youth Bible Study tomorrow at 6:30 PM", time: "1 day ago", read: false },
    { id: 3, message: "Your prayer request has been answered", time: "2 days ago", read: true },
  ]);

  // Update date every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30">
        <div className="flex-1 py-6 px-4">
          <div className="space-y-1">
            {/* Menu Console Header */}
            <div className="pb-3 mb-3 border-b border-slate-100 px-2 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
                Member Menu
              </span>
              <span className="text-[8px] font-mono bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full font-black">
                MEMBER
              </span>
            </div>

            {/* Home Button */}
            <button
              onClick={() => setActiveTab("home")}
              className={`group relative w-full flex items-center gap-3 px-4 py-3 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                activeTab === "home"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Home className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${activeTab === "home" ? "text-white" : "text-slate-400"}`} />
              <span className="flex-1 text-left">Home Dashboard</span>
              {activeTab === "home" && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                </div>
              )}
            </button>

            {/* Sermons Button */}
            <button
              onClick={() => setActiveTab("sermons")}
              className={`group relative w-full flex items-center gap-3 px-4 py-3 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                activeTab === "sermons"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Video className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${activeTab === "sermons" ? "text-white" : "text-slate-400"}`} />
              <span className="flex-1 text-left">Sermons & Broadcasts</span>
              {activeTab === "sermons" && (
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
              <Calendar className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${activeTab === "events" ? "text-white" : "text-slate-400"}`} />
              <span className="flex-1 text-left">Events Calendar</span>
              {activeTab === "events" && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                </div>
              )}
            </button>

            {/* Announcements Button */}
            <button
              onClick={() => setActiveTab("announcements")}
              className={`group relative w-full flex items-center gap-3 px-4 py-3 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                activeTab === "announcements"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Bell className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${activeTab === "announcements" ? "text-white" : "text-slate-400"}`} />
              <span className="flex-1 text-left">Announcements</span>
              {unreadCount > 0 && (
                <span className="absolute right-8 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
              {activeTab === "announcements" && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                </div>
              )}
            </button>
          </div>

          {/* Footer Section */}
          <div className="absolute bottom-6 left-4 right-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-700">
                  Member Access
                </span>
              </div>
              <p className="text-[9px] text-slate-500 leading-tight">
                Welcome to your spiritual hub. Stay connected with your church community.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 ml-64">
        {/* Top Notification Bar */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-3 flex justify-end items-center">
          {/* Notifications */}
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

            {/* Notification Dropdown */}
            {showNotification && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50">
                <div className="p-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map(notif => (
                    <div key={notif.id} className={`p-3 hover:bg-slate-50 cursor-pointer ${!notif.read ? "bg-indigo-50/30" : ""}`}>
                      <p className="text-sm text-slate-700">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <main className="p-6">
          
          {/* HOME TAB */}
          {activeTab === "home" && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="relative">
                  <h1 className="text-2xl font-bold">
                    {getGreeting()}, {userData?.firstName || "Beloved"}! 👋
                  </h1>
                  <p className="text-indigo-100 mt-1">Welcome to your spiritual journey dashboard</p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{userStats.sermonsWatched}</p>
                      <p className="text-xs text-slate-500">Sermons Watched</p>
                    </div>
                    <Video className="h-8 w-8 text-indigo-400" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{userStats.eventsAttended}</p>
                      <p className="text-xs text-slate-500">Events Attended</p>
                    </div>
                    <Calendar className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-amber-600">{userStats.givingStreak}</p>
                      <p className="text-xs text-slate-500">Week Streak</p>
                    </div>
                    <Flame className="h-8 w-8 text-amber-400" />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{userStats.prayerRequests}</p>
                      <p className="text-xs text-slate-500">Prayer Requests</p>
                    </div>
                    <Heart className="h-8 w-8 text-rose-400" />
                  </div>
                </div>
              </div>

              {/* Recent Sermons Preview */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-slate-800">🎬 Recent Sermons</h2>
                  <button onClick={() => setActiveTab("sermons")} className="text-xs text-indigo-600 hover:text-indigo-700">View All →</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentSermons.slice(0, 3).map(sermon => (
                    <div key={sermon.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer">
                      <div className="h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mb-3">
                        <Video className="h-12 w-12 text-indigo-400" />
                      </div>
                      <h3 className="font-bold text-slate-900">{sermon.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{sermon.preacher}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{sermon.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{sermon.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{sermon.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="bg-white rounded-xl p-4 text-center border border-slate-200 hover:shadow-md transition group">
                  <div className="h-12 w-12 rounded-full bg-indigo-50 mx-auto flex items-center justify-center mb-2 group-hover:bg-indigo-100 transition">
                    <BookOpen className="h-6 w-6 text-indigo-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Bible Reading</p>
                </button>
                <button className="bg-white rounded-xl p-4 text-center border border-slate-200 hover:shadow-md transition group">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 mx-auto flex items-center justify-center mb-2 group-hover:bg-emerald-100 transition">
                    <Heart className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Prayer Wall</p>
                </button>
                <button className="bg-white rounded-xl p-4 text-center border border-slate-200 hover:shadow-md transition group">
                  <div className="h-12 w-12 rounded-full bg-amber-50 mx-auto flex items-center justify-center mb-2 group-hover:bg-amber-100 transition">
                    <Gift className="h-6 w-6 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Give Online</p>
                </button>
                <button className="bg-white rounded-xl p-4 text-center border border-slate-200 hover:shadow-md transition group">
                  <div className="h-12 w-12 rounded-full bg-rose-50 mx-auto flex items-center justify-center mb-2 group-hover:bg-rose-100 transition">
                    <Users className="h-6 w-6 text-rose-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Join Ministry</p>
                </button>
              </div>
            </div>
          )}

          {/* SERMONS TAB */}
          {activeTab === "sermons" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">📺 Sermons & Broadcasts</h1>
                <p className="text-slate-500 mt-1">Watch and be inspired by God's Word</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recentSermons.map(sermon => (
                  <div key={sermon.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-lg transition cursor-pointer group">
                    <div className="h-44 bg-gradient-to-br from-indigo-100 to-purple-100 relative flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition">
                      <Video className="h-14 w-14 text-indigo-400 group-hover:scale-110 transition" />
                      <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {sermon.duration}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900">{sermon.title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{sermon.preacher}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{sermon.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>{sermon.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(sermon.date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === "events" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">📅 Church Events Calendar</h1>
                <p className="text-slate-500 mt-1">Stay updated with upcoming activities</p>
              </div>

              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl bg-indigo-50 flex flex-col items-center justify-center">
                          <span className="text-xl font-bold text-indigo-600">
                            {new Date(event.date).getDate()}
                          </span>
                          <span className="text-[10px] text-indigo-500">
                            {new Date(event.date).toLocaleString("default", { month: "short" })}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{event.title}</h3>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition">
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS TAB */}
          {activeTab === "announcements" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">📢 Announcements</h1>
                <p className="text-slate-500 mt-1">Stay informed with church news and updates</p>
              </div>

              <div className="space-y-4">
                {announcements.map(ann => (
                  <div key={ann.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${ann.priority === "high" ? "bg-red-100" : "bg-indigo-100"}`}>
                        <Bell className={`h-5 w-5 ${ann.priority === "high" ? "text-red-600" : "text-indigo-600"}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{ann.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{ann.content}</p>
                        <p className="text-xs text-slate-400 mt-2">{formatDate(ann.date)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}