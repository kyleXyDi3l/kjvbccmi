import React, { useState, useEffect, useMemo } from "react";
import LoginModule from "./components/LoginModule";
import AdminDashboard from "./components/AdminDashboard";
import UserProfileDashboard from "./components/UserProfileDashboard";
import SecretaryDashBoard from "./components/SecretaryDashBoard";
import TreaseurerDashBoard from "./components/TreasurerDashBoard";
import { supabase } from "./supabase-client";
import { ChurchLocation } from "./constant/frozenTypes";
import logo from "./assets/kjv.png";
import "./App.css";

// Icons
import {
  Church,
  Flame,
  ShieldAlert,
  Key,
  LogOut,
  CheckCircle,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Radio,
  Users,
  Phone,
  Mail,
  Award,
  BookOpen,
  MapPin,
  Heart,
  ChevronRight,
  Volume2,
  Sparkles,
  Building2,
  ExternalLink,
  User,
} from "lucide-react";

export default function App() {
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userFirstName, setUserFirstName] = useState(null);
  const [userLastName, setUserLastName] = useState(null);
  const [userChurch, setUserChurch] = useState(null);
  const [userPic, setUserPic] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [currentAffiliation, setCurrentAffiliation] = useState("Naga");

  // Navigation state
  const [activeMenu, setActiveMenu] = useState("Home");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [successMemo, setSuccessMemo] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Interactive Ministry Picker State (homepage ministry feature)
  const [selectedMinistryKey, setSelectedMinistryKey] = useState("Youth");

  // Interactive Admin News Block Creator state
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    imageBanner: "",
    images: "",
    summary: "",
    affiliation: "",
    category: "",
  });

  // Contains the posts data
  const [posts, setPosts] = useState([]);

  // Selected news block for details view modal
  // Selected Detail Modal state for Homepage Announcement/News Block
  const [selectedNewsBlock, setSelectedNewsBlock] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);

  /*====================SETTER/RESETTER===================*/
  /*|                                                     */
  /*|=====================================================*/
  const resetState = () => {
    setSession(null);
    setUserRole(null);
    setUserData(null);
    setUserFirstName(null);
    setUserLastName(null);
    setUserPic(null);
    setUserChurch(null);
    setActiveMenu("Home");
    // add other resets here
  };

  const resetPosts = () => {
    setNewPost({
      title: "",
      content: "",
      imageBanner: "",
      images: "",
      summary: "",
      affiliation: "",
      category: "",
    });
  };

  const setUserProfileState = (userData) => {
    setUserRole(userData.role);
    setUserPic(userData.profileImg);
    setUserFirstName(userData.firstName);
    setUserLastName(userData.lastName);
    setUserChurch(userData.churches?.name || "");
    setUserData(userData);
  };

  /*=======================LOGIN/LOGOUT===================*/
  /*|                                                     */
  /*|=====================================================*/
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setSuccessMemo("Successfully logged in.");
    setTimeout(() => setSuccessMemo(""), 4000);
    getUserData();
    setActiveMenu("Dashboard");
  };

  const handleLoginClose = () => {
    setShowLoginModal(false);
  };

  const hadleLogOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    }
    resetState();
  };

  /*=====================PROFILE UPDATE===================*/
  /*|                                                     */
  /*|=====================================================*/
  const handleProfileUpdate = () => {
    console.log("handleProfileUpdate fired");
    getUserData();
    console.log(userData);
  };

  /*======================POST BLOCK =====================*/
  /*|                                                     */
  /*|=====================================================*/
  const handleAddNewsBlock = async (e) => {
    e.preventDefault();
    console.log("Sumitting News", session);

    const { error, data } = await supabase
      .from("posts")
      .insert({ ...newPost, createdBy: session.user.id })
      .select()
      .single();

    if (error) {
      console.error("Error adding task:", error.message);
      return;
    }

    //setPosts((prev) => [...prev, data]);
    //fetchPosts();
    resetPosts();
  };

  const handleDeleteNewsBlock = async (postId) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      alert("Error Deleting post");
      return;
    }
    setSuccessMemo("News block deleted successfully.");
    setTimeout(() => setSuccessMemo(""), 4000);
    // Refresh from DB
    fetchPosts();
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching post:", error.message);
      return;
    }
    setPosts(data);
    console.log("Fetched posts:", data);
  };

  useEffect(() => {
    const channel = supabase
      .channel("posts-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const posts = payload.new;
          setPosts((prevPosts) => [posts, ...prevPosts]);
        },
      )
      // Listen for deleted posts
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts" },
        (payload) => {
          const deletedPost = payload.old;
          setPosts((prevPosts) =>
            prevPosts.filter((posts) => posts.id !== deletedPost.id),
          );
        },
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    setNewPost((prev) => ({
      ...prev,
      affiliation: userChurch,
      category: "news",
    }));
  }, [userChurch]);

  /*=================USER/SESSION BLOCK===================*/
  /*|                                                     */
  /*|=====================================================*/
  const fetchSession = async () => {
    const curerntSession = await supabase.auth.getSession();
    console.log("Current Session:", curerntSession);
    setSession(curerntSession.data.session);
  };

  const getUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }
    const { data: userData, error } = await supabase
      .from("profiles")
      .select(
        `firstName, lastName, birthDate, 
        phoneNumber, role, gender, profileImg,
        churches!churchID ( id,name)`,
      )
      .eq("id", user.id)
      .single();
    if (error) {
      console.error("Error fetching user role:", error.message);
      return null;
    }
    setUserProfileState(userData);
    console.log("User Data: ", userData);
    return userData;
  };

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth Event:", event, "Session:", session);
        setSession(session);
      },
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserData();
      console.log("useEffect fetched Role");
      if (userData && userData.role) {
        console.log("Setting user role in useEffect:", userData.role);
        setUserRole(userData.role);
      }
    };
    fetchUser();
  }, []);

  /*======================================================*/
  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-indigo-600 selection:text-white"
      id="main-application-frame"
    >
      {/* GLOBAL HIGH-FIDELITY NAVIGATION BAR */}
      <nav
        className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm"
        id="global-navigation-bar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left Branded Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setActiveMenu("Home")}
            >
              <div className="p-1.5 bg-slate-900 rounded-lg text-white">
                {/* <Church className="h-6 w-6" /> */}
                <img src={logo} alt="Church Logo" className="h-6 w-6" />
              </div>
              <div>
                <span className="block font-sans font-extrabold text-sm tracking-tight text-slate-900">
                  King James Version Bible Christian Church Ministry Inc.
                </span>
                <span className="block text-[8px] font-mono tracking-widest text-slate-400 font-bold uppercase leading-none">
                  Church Portal
                </span>
              </div>
            </div>

            {/* Desktop Center Menu Links */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => {
                  setActiveMenu("Home");
                }}
                className={`text-slate-600 hover:text-slate-900 font-sans text-xs font-semibold tracking-wide ${activeMenu === "Home" ? "text-indigo-600 border-b-2 border-indigo-600 py-4 font-bold" : ""}`}
                id="nav-home-btn"
              >
                Community Home
              </button>

              <button
                onClick={() => {
                  setActiveMenu("Sermons");
                }}
                className={`text-slate-600 hover:text-slate-900 font-sans text-xs font-semibold tracking-wide ${activeMenu === "Sermons" ? "text-indigo-600 border-b-2 border-indigo-600 py-4 font-bold" : ""}`}
                id="nav-sermons-btn"
              >
                Broadcasts & Sermons
              </button>

              <button
                onClick={() => {
                  setActiveMenu("Calendar");
                }}
                className={`text-slate-600 hover:text-slate-900 font-sans text-xs font-semibold tracking-wide ${activeMenu === "Calendar" ? "text-indigo-600 border-b-2 border-indigo-600 py-4 font-bold" : ""}`}
                id="nav-calendar-btn"
              >
                Event Registries
              </button>

              {session && (
                <button
                  onClick={() => {
                    setActiveMenu("Dashboard");
                  }}
                  className={`text-slate-600 hover:text-slate-900 font-sans text-xs font-semibold tracking-wide ${activeMenu === "Dashboard" ? "text-indigo-600 border-b-2 border-indigo-600 py-4 font-bold" : ""}`}
                  id="nav-dashboard-btn"
                >
                  My Admin Desk 💼
                </button>
              )}
            </div>

            {/* Right login security switch */}
            <div className="flex items-center gap-3">
              {/* {session ? ( */}
              {session ? (
                <div className="relative" id="logged-user-tag-facebook-avatar">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white p-1 rounded-full text-xs transition cursor-pointer"
                    id="profile-dropdown-trigger"
                    title={`${session.firstName}'s Profile Context`}
                  >
                    {userPic ? (
                      <img
                        src={userPic}
                        alt="User Profile"
                        className="h-7 w-7 rounded-full object-cover border border-white/20 shadow-2xs"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-extrabold text-xs flex items-center justify-center shadow-xs border border-white/20">
                        {/* {userFirstName[0].toUpperCase()}
                        {userLastName ? userLastName[0].toUpperCase() : ""} */}
                        {userFirstName?.[0].toUpperCase()}
                        {userLastName?.[0].toUpperCase()}
                      </div>
                    )}
                    <ChevronDown className="h-3 w-3 mr-1 text-slate-300" />
                  </button>

                  {showProfileDropdown && (
                    <div
                      className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4.5 z-[100] text-slate-800 animate-in fade-in duration-200"
                      id="profile-dropdown-card"
                    >
                      {/* Miniature Facebook-style personal details box */}
                      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        {userPic ? (
                          <img
                            src={userPic}
                            alt="User Focus avatar"
                            className="h-10 w-10 rounded-full object-cover border border-indigo-100 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-slate-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-sans font-extrabold text-sm">
                            {userFirstName?.[0].toUpperCase()}
                            {userLastName?.[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-extrabold text-slate-900 truncate">
                            {/* {session.firstName} {session.lastName} */}
                            {userFirstName}
                            {userLastName}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">
                            {session.user.email}
                          </p>
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-105 text-indigo-805">
                              {userRole}
                            </span>
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-slate-100 rounded-full text-slate-600">
                              {userData.church}
                              {/* Pinamungajan Extension */}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div
                        className="py-2.5 space-y-1"
                        id="profile-dropdown-options"
                      >
                        <button
                          onClick={() => {
                            setActiveMenu("Profile");
                            setShowProfileDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-2.5 py-2 text-xs font-semibold hover:bg-indigo-50/50 rounded-xl transition text-left cursor-pointer"
                          id="dropdown-goto-profile"
                        >
                          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-sans text-slate-900 font-bold leading-tight">
                              My Profile Dashboard
                            </p>
                            <p className="text-[9px] text-slate-400 font-sans mt-0.5">
                              Customize profile info & change security password
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Sign Out Action Button */}
                      <div className="pt-2.5 border-t border-slate-100">
                        <button
                          onClick={() => {
                            hadleLogOut();
                            setShowProfileDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition text-left cursor-pointer"
                          id="dropdown-signout"
                        >
                          <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                            <LogOut className="h-4 w-4" />
                          </div>
                          <span className="font-sans">
                            Sign Out Security Key
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  id="login-dialog-trigger"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm flex items-center gap-1.5"
                >
                  <Key className="h-4 w-4" />
                  <span>Officer Portal Access</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      {/* SUCCESS NOTICE TOAST BANNER */}
      {successMemo && (
        <div className="bg-slate-900 text-white" id="main-success-toast">
          <div className="max-w-7xl mx-auto px-4 py-2.5 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
            <span>{successMemo}</span>
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTROLLER DECK */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* ==================== VIEW 1: HOME COMMUNITY PAGE ==================== */}
        {activeMenu === "Home" && (
          <div className="space-y-8" id="view-homepage-container">
            {/* HERO INTRODUCTION BANNERS WITH TAILORED SELECTION */}
            <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="absolute right-0 top-0 opacity-10 pointer-events-none select-none">
                <Church className="h-80 w-80 translate-x-20 -translate-y-10" />
                {/* <img src={logo} alt="Church Logo" className="h-80 w-80 " /> */}
              </div>

              <div className="max-w-2xl space-y-4 relative z-10">
                <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full font-mono font-bold tracking-wider uppercase">
                  Unified Church Ecosystem
                </span>

                <h1 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight leading-none text-white">
                  Spiritual Fellowship Across Our Church Network
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                  KJV BCCMI represents an integrated church grid connecting
                  Naga, Aloguinsan, Samar, Dulag, Pinamungajan, and Mandaue.
                  Update content and calendars dynamically based on your home
                  chapel.
                </p>

                {/* TAILORED CONTENT DROPDOWN SELECTOR - Directly requested */}
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <label className="text-xs font-sans text-slate-300 font-semibold uppercase tracking-wider">
                    Select Your Home Extension Area:
                  </label>
                  <select
                    //value={currentAffiliation}
                    // onChange={(e) => {
                    //   const sel = e.target.value as any;
                    //   setCurrentAffiliation(sel);
                    //   setSuccessMemo(`Now showing customized news & calendar details for the ${sel} Extension area.`);
                    //   setTimeout(() => setSuccessMemo(''), 3000);
                    // }}
                    className="bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-2 text-xs font-bold font-sans text-amber-300 hover:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
                    id="affiliated-extension-dropdown"
                  >
                    {/* {EXTENSIONS_LIST.map(ext => (
                      <option key={ext} value={ext}>{ext} Campus Fellowship</option>
                    ))} */}
                  </select>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Network Node: Allied OK</span>
                <span>
                  Active Extension View:{" "}
                  <strong>{/* {currentAffiliation} */}</strong>
                </span>
              </div>
            </div>

            {/* TWO COLUMN GRID: TAILORED NOTIFICATIONS & UPCOMING CALENDAR */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left tailored News announcements (Fills in announcements dynamically uploaded) */}
              <div
                className="lg:col-span-2 space-y-6"
                id="tailored-content-block"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <div>
                    <h2 className="text-base font-sans font-extrabold text-slate-950 uppercase tracking-wide">
                      Dynamic Announcements & Local News {userChurch}
                    </h2>
                    <p className="text-xs text-slate-500 font-sans">
                      Dynamic highlights managed in real-time by church
                      administrators.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    {posts.length} {""} Feed Items
                  </span>
                </div>

                {/* News Blocks */}
                {/* {filteredTailoredAnnouncements.length === 0 ? ( */}

                {/* News Blocks */}
                {posts.length === 0 ? (
                  <p className="p-8 text-center text-slate-400 italic">
                    No custom announcements filed for this campus yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {posts.map((block) => (
                      <div
                        key={block.id}
                        className={`bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row relative transition hover:shadow-md cursor-pointer hover:border-slate-300 group ${block.category === "urgent" ? "border-l-4 border-l-rose-500 border border-slate-100" : "border-slate-200"}`}
                        id={`announcement-block-${block.id}`}
                        onClick={() => setSelectedNewsBlock(block)}
                      >
                        {/* News visual Banner */}
                        {block.imageBanner ? (
                          <div className="sm:w-1/3 h-40 sm:h-auto bg-slate-100 shrink-0 relative overflow-hidden">
                            <img
                              src={block.imageBanner}
                              alt={block.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            {block.category === "urgent" && (
                              <span className="absolute top-2 left-2 bg-rose-600 text-white font-bold font-mono text-[9px] px-2 py-0.5 rounded">
                                URGENT ALERT
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="sm:w-1/3 h-40 bg-slate-900 flex items-center justify-center p-4">
                            <Church className="h-10 w-10 text-slate-700 group-hover:text-slate-500 transition-colors" />
                          </div>
                        )}

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                              <span>
                                Published:{" "}
                                {new Date(block.created_at).toLocaleString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                              <span className="bg-slate-105 px-1.5 py-0.2 rounded font-bold uppercase text-slate-600">
                                {block.affiliation} Dispatch
                              </span>
                            </div>

                            <h3 className="text-sm font-sans font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                              {block.title}
                            </h3>
                            <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                              {block.content}
                            </p>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold group-hover:translate-x-0.5 transition-transform">
                              <span>Read details & photos</span>
                              {block.images && block.images.length > 0 && (
                                <span className="bg-indigo-50 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded font-mono font-normal">
                                  +{block.images.split(",").length} photos
                                </span>
                              )}
                              <ChevronRight className="h-3 w-3" />
                            </span>

                            {/* Delete option if Admin/Pastor or authorized Secretary is logged in */}
                            {userRole === "Admin" && (
                              <div className="flex items-center gap-2 text-[10px]">
                                <span className="font-mono text-emerald-600">
                                  Admin Clearance Verified
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNewsBlock(block.id);
                                  }}
                                  className="text-rose-500 hover:text-rose-700 hover:underline font-bold"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar Calendar Integration - Directly requested */}
              <div
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 h-fit"
                id="homepage-calendar"
              >
                <div className="pb-2 border-b">
                  <h3 className="text-sm font-sans font-bold text-slate-950 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                    <span>Calendar Integration</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 font-sans">
                    {" "}
                    Tailored schedules for {currentAffiliation} users.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* {filteredTailoredEvents.length === 0 ? ( */}
                  <p className="text-[11px] text-slate-400 italic">
                    No events scheduled are showing on immediate agenda calendar
                    listings.
                  </p>
                  {/* ) : ( */}
                  {/* {filteredTailoredEvents.map(evt => ( */}
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5 hover:border-slate-800 transition">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 rounded uppercase tracking-wide">
                        MINITYPE
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        DATE
                      </span>
                    </div>
                    <h4 className="text-xs font-sans font-bold text-slate-800 line-clamp-1">
                      TITLE
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                      DESCRIPTION
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[9px]">
                      <span>
                        Time: <strong>TIME</strong>
                      </span>

                      <button
                        // onClick={() => {
                        //   const email = prompt("Enter your email address to register for this ministry sign-up:");
                        //   if (email) handleMinistrySignup(evt.id, email);
                        // }}
                        className="text-indigo-600 hover:underline font-bold"
                      >
                        Ministry Signup →
                      </button>
                    </div>
                  </div>
                  {/* ))
                  )} */}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveMenu("Calendar")}
                    className="w-full text-center bg-slate-900 text-white font-sans text-xs font-medium py-2 rounded-lg hover:bg-slate-800 transition"
                  >
                    View All Scheduled Assemblies
                  </button>
                </div>
              </div>
            </div>

            {/* MINISTRY SPOTLIGHT INTERACTIVE CANVAS - Directly requested (Latest chapel activities interactively) */}

            {/* ADMIN HOMEPAGE EDITOR BLOCK - Directly requested */}
            {userRole === "Admin" && (
              <div
                className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4"
                id="admin-homepage-newsbox-designer"
              >
                <div className="pb-2 border-b border-slate-800">
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 font-mono tracking-wider font-bold px-2 py-0.5 rounded uppercase">
                    Admin Tool Suite
                  </span>
                  <h3 className="text-base font-sans font-extrabold tracking-tight mt-1">
                    Real-Time Homepage Block Editor
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Compose new informational blocks or announcements to present
                    directly on the visitor homepage feed instantly.
                  </p>
                </div>

                <form
                  onSubmit={handleAddNewsBlock}
                  className="space-y-4"
                  id="newsblock-form"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Block Headline Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newPost.title}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            title: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                        placeholder="e.g. Naga Chapel Storm Advisory"
                        id="news-input-title"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Visual Banner Link URL
                      </label>
                      <input
                        type="text"
                        value={newPost.imageBanner}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            imageBanner: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                        placeholder="e.g. https://images.unsplash.com/..."
                        id="news-input-image"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Target Chapel
                        </label>
                        <select
                          value={userChurch} //{newPost.affiliation}
                          onChange={(e) =>
                            setNewPost({
                              ...newPost,
                              affiliation: e.target.value,
                            })
                          }
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                          id="news-input-aff"
                          //disabled={userRole !== "Secretary"}
                        >
                          {userRole !== "Admin" ? (
                            <option value="Naga">Naga</option>
                          ) : (
                            <>
                              <option value="Global">
                                Global (All Extensions)
                              </option>
                              <option value={userChurch}>{userChurch}</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                          Priority Style
                        </label>
                        <select
                          value={newPost.category}
                          onChange={(e) =>
                            setNewPost({
                              ...newPost,
                              category: e.target.value,
                            })
                          }
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                          id="news-input-cat"
                        >
                          <option value="news">General News</option>
                          <option value="ministry">Local News</option>
                          <option value="urgent">Urgent Warning</option>
                          <option value="ministry">Ministry Highlight</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Additional Photos Gallery (Comma-separated URLs)
                    </label>
                    <input
                      type="text"
                      value={newPost.images}
                      onChange={(e) =>
                        setNewPost({
                          ...newPost,
                          images: e.target.value,
                        })
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none"
                      placeholder="e.g. https://images.unsplash.com/photo-1..., https://images.unsplash.com/photo-2..."
                      id="news-input-additional-images"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Paragraph Content Description *
                      </label>
                      <textarea
                        required
                        value={newPost.content}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            content: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white min-h-[80px] focus:outline-none"
                        placeholder="Input short summary message..."
                        id="news-input-desc"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Additional Detailed Content (Optional)
                      </label>
                      <textarea
                        value={newPost.summary}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            summary: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white min-h-[80px] focus:outline-none"
                        placeholder="Input long detailed announcement paragraphs..."
                        id="news-input-details"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 italic">
                      Publishing modifies localStorage state & updates
                      immediately.
                    </span>
                    <button
                      type="submit"
                      id="news-submit-btn"
                      className="bg-sky-500 hover:bg-sky-600 text-slate-900 font-bold text-xs px-4  py-2 rounded-lg transition shadow-sm"
                    >
                      Publish to Homepage Feed
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ==================== VIEW 4: ACTIVE ADMIN OFFICERS DASHBOARD (RBAC Gated) ==================== */}
        {activeMenu === "Dashboard" && (
          <div className="space-y-6" id="dashboard-rbac-box">
            {!session ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <ShieldAlert className="h-10 w-10 text-amber-600 mb-2 animate-bounce" />
                <h3 className="font-sans font-bold text-base">
                  Authorized Access Only
                </h3>
                <p className="text-xs text-amber-700 mt-1 max-w-sm">
                  You are currently unauthenticated. Please click the security
                  button above to verify credentials using multi-factor codes.
                </p>
              </div>
            ) : (
              <div>
                {/* ROLE ROUTER */}
                {userRole === "Admin" && (
                  <AdminDashboard
                  //members={members}
                  //onAddMember={handleAddMember}
                  //onUpdateMember={handleUpdateMember}
                  //onDeleteMember={handleDeleteMember}
                  />
                )}

                {userRole === "Secretary" && (
                  <SecretaryDashBoard userData={userData} session={session} />
                )}
                {userRole === "Treasurer" && (
                  <TreaseurerDashBoard userData={userData} session={session} />
                )}
              </div>
            )}
          </div>
        )}

        {activeMenu === "Profile" && session && (
          <UserProfileDashboard
            session={session}
            userData={userData}
            //members={members}
            //isOfflineMode={isOfflineMode}
            onUpdateProfile={handleProfileUpdate}
            onBackToHome={() => setActiveMenu("Home")}
          />
        )}
      </main>

      {/* FOOTER METRICS AND COMMUNITY LINKS */}
      <footer
        className="bg-white border-t border-slate-100 py-8 text-xs text-slate-500 font-sans"
        id="allied-network-footer"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div
            className="flex flex-wrap justify-center gap-4 text-[11px] font-semibold text-slate-600"
            id="locations-pills-list"
          >
            {/* {EXTENSIONS_LIST.map(e => (
              <span key={e} className="bg-slate-50 border rounded-full px-2.5 py-0.5" id={`footer-pill-${e}`}>
                ● {e} Church Extensions Co-Op
              </span>
            ))} */}
          </div>

          <p className="max-w-md mx-auto text-[11px] opacity-75">
            KJV Bible Christian Church Portal. Powered by secure Local Storage
            and Cloud Firestore Integrations with strict Attribute-Based Access
            Control and Multi-Factor verification.
          </p>

          <p className="text-[10px] font-mono opacity-50">
            © 2026 Church Extensions Network • Unified Sandbox Portal
          </p>
        </div>
      </footer>

      {/* MULTI-FACTOR LOGIN GATEWAY POPUP DIALOG MODAL */}
      {showLoginModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
          id="login-modal-overlay"
        >
          <LoginModule
            onLoginSuccess={handleLoginSuccess}
            onClose={() => setShowLoginModal(false)}
          />
        </div>
      )}

      {/* ANNOUNCEMENT DETAIL DIALOG MODAL */}
      {selectedNewsBlock && (
        <div
          className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          id="announcement-detail-modal"
        >
          <div className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header banner */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    selectedNewsBlock.category === "urgent"
                      ? "bg-rose-50 text-rose-700 border border-rose-100"
                      : selectedNewsBlock.category === "ministry"
                        ? "bg-amber-50 text-amber-700 border border-amber-100"
                        : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  }`}
                >
                  {selectedNewsBlock.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Published:
                  {new Date(selectedNewsBlock.created_at).toLocaleString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedNewsBlock(null);
                  setActivePhoto(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-full hover:bg-slate-200 transition-colors"
                title="Close overlay"
              >
                <span className="sr-only">Close modal</span>
                <span className="text-lg leading-none font-sans block px-1.5">
                  &times;
                </span>
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Title heading */}
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500">
                  {selectedNewsBlock.affiliation} Campus Fellowship Dispatch
                </span>
                <h2 className="text-xl md:text-2xl font-sans font-extrabold text-slate-900 tracking-tight mt-1">
                  {selectedNewsBlock.title}
                </h2>
              </div>

              {/* Photos Gallery Panel */}
              <div className="space-y-3">
                <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-900">
                  <img
                    src={
                      activePhoto ||
                      selectedNewsBlock.imageBanner ||
                      "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={selectedNewsBlock.title}
                    className="w-full h-full object-cover transition-all"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-900/75 backdrop-blur-md text-[10px] text-slate-200 px-2 py-0.5 rounded font-mono">
                    {activePhoto
                      ? "Gallery Image View"
                      : "Primary Cover Banner"}
                  </div>
                </div>

                {/* Additional gallery thumbnails */}
                {(selectedNewsBlock.imageBanner ? 1 : 0) +
                  (selectedNewsBlock.images?.length || 0) >
                  1 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block font-mono">
                      Image Gallery (Click to inspect photo)
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                      {/* Main Image thumbnail */}
                      {selectedNewsBlock.imageBanner && (
                        <button
                          onClick={() =>
                            setActivePhoto(
                              selectedNewsBlock.imageBanner || null,
                            )
                          }
                          className={`h-16 w-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all relative ${
                            activePhoto === null ||
                            activePhoto === selectedNewsBlock.imageBanner
                              ? "border-indigo-600 ring-2 ring-indigo-100"
                              : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400"
                          }`}
                        >
                          <img
                            src={selectedNewsBlock.imageBanner}
                            alt="Cover thumbnail"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      )}

                      {/* Additional Photos thumb */}
                      {selectedNewsBlock?.images &&
                        selectedNewsBlock.images.split(",").map((pic, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePhoto(pic)}
                            className={`h-16 w-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all relative ${
                              activePhoto === pic
                                ? "border-indigo-600 ring-2 ring-indigo-100"
                                : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400"
                            }`}
                          >
                            <img
                              src={pic.trim()}
                              alt={`Gallery view #${idx + 1}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Narrative texts */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1 font-mono">
                    Summary Overview
                  </span>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed italic">
                    "{selectedNewsBlock.summary}"
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block font-mono">
                    Detailed Narrative & Schedules
                  </span>
                  <p className="text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                    {selectedNewsBlock.content ||
                      "No additional text-details provided for this dispatch."}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] font-mono text-slate-400">
                Extension:{" "}
                <strong className="text-slate-600">
                  {selectedNewsBlock.affiliation} Campus
                </strong>
              </span>
              <button
                onClick={() => {
                  setSelectedNewsBlock(null);
                  setActivePhoto(null);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
