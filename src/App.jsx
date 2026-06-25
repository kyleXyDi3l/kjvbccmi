import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginModule from "./components/LoginModule";
import AdminDashboard from "./components/AdminDashboard";
import ModeratorDashboard from "./components/ModeratorDashBoard";
import UserProfileDashboard from "./components/UserProfileDashboard";
import SecretaryDashBoard from "./components/SecretaryDashBoard";
import TreaseurerDashBoard from "./components/TreasurerDashBoard";
import SermonDashBoard from "./components/SermonDashBoard";
import UserDashBoard from "./components/UserDashBoard";
import EventAndRegDashBoard from "./components/EventAndRegDashBoard";
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
  Shield,
  Newspaper,
  Bell,
  Clock,
  Eye,
  Image,
  PenTool,
  Heading,
  Flag,
  Images,
  FileText,
  Send,
  X,
  Share2,
  Check,
  Home,
  Mic,
  LayoutDashboard,
  Menu, // Add this icon
} from "lucide-react";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  //Auth and Routing State
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isRoutingInitialized, setIsRoutingInitialized] = useState(false);

  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userFirstName, setUserFirstName] = useState(null);
  const [userLastName, setUserLastName] = useState(null);
  const [userChurch, setUserChurch] = useState(null);
  const [userPic, setUserPic] = useState(null);
  const [userRole, setUserRole] = useState("");
  //const [currentAffiliation, setCurrentAffiliation] = useState("Naga");

  // Navigation state
  const [activeMenu, setActiveMenu] = useState("Home");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [successMemo, setSuccessMemo] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Add mobile menu state

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

    // Clear navigation history and redirect to home
    navigate("/", { replace: true });

    // Clear any stored tokens from localStorage
    localStorage.removeItem("supabase.auth.token");

    // Optional: Reload the page to clear all state
    // window.location.reload();
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
    //console.log("Fetched posts:", data);
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
  // const fetchSession = async () => {
  //   const curerntSession = await supabase.auth.getSession();
  //   console.log("Current Session:", curerntSession);
  //   setSession(curerntSession.data.session);
  // };

  const fetchSession = async () => {
    setIsLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    //console.log("Current Session:", session);
    setSession(session);

    if (session) {
      await getUserData();
    }
    setIsLoading(false);
    setAuthChecked(true);
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
    //console.log("User Data: ", userData);
    return userData;
  };

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        //console.log("Auth Event:", event, "Session:", session);
        setSession(session);

        if (session) {
          await getUserData();
        } else {
          // User signed out, reset states
          resetState();
        }
        setAuthChecked(true);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserData();
      //console.log("useEffect fetched Role");
      if (userData && userData.role) {
        //console.log("Setting user role in useEffect:", userData.role);
        setUserRole(userData.role);
      }
    };
    fetchUser();
  }, []);

  // Initialize activeMenu from URL only once on mount
  useEffect(() => {
    const path = window.location.pathname.substring(1);
    const validMenus = ["Home", "Sermons", "Calendar", "Dashboard", "Profile"];
    if (validMenus.includes(path)) {
      setActiveMenu(path);
    }
    setIsRoutingInitialized(true);
  }, []);

  // Sync URL to menu (one-way sync only)
  useEffect(() => {
    if (!isRoutingInitialized) return;
    if (!authChecked) return;

    const currentPath = location.pathname.substring(1) || "Home";
    if (currentPath !== activeMenu && activeMenu !== "Home") {
      // If user navigates via back/forward buttons, update menu
      setActiveMenu(currentPath);
    }
  }, [location.pathname, authChecked, isRoutingInitialized]);

  // Redirect unauthenticated users away from protected views
  useEffect(() => {
    if (!authChecked) return;
    if (!session && (activeMenu === "Dashboard" || activeMenu === "Profile")) {
      setActiveMenu("Home");
      setShowLoginModal(true);
    }
  }, [authChecked, activeMenu, session]);

  // Update URL when menu changes (but only for non-Home)
  useEffect(() => {
    if (!isRoutingInitialized) return;
    if (!authChecked) return;

    const targetPath = activeMenu === "Home" ? "/" : `/${activeMenu}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [
    activeMenu,
    navigate,
    location.pathname,
    authChecked,
    isRoutingInitialized,
  ]);

  // In your App.jsx, add this effect to auto-show login modal when coming from reset password
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("showLogin") === "true") {
      setShowLoginModal(true);
      // Clean up URL
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // useEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search);
  //   if (urlParams.get("showLogin") === "true") {
  //     setShowLoginModal(true);
  //     // Clean up URL without page refresh
  //     window.history.replaceState({}, document.title, window.location.pathname);
  //   }
  // }, []);

  //prevent accessing reset-password with invalid tokens
  useEffect(() => {
    const checkResetPasswordRoute = async () => {
      if (location.pathname === "/reset-password") {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        // If no session and the URL has a token in hash, it might be expired
        if (!session && location.hash) {
          // Clear the URL and redirect to home
          window.history.replaceState({}, document.title, "/");
          navigate("/");
          setShowLoginModal(true);
        }
      }
    };

    checkResetPasswordRoute();
  }, [location.pathname, location.hash, navigate]);

  /*======================================================*/
  // Loading state
  if (!isRoutingInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading church portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-indigo-600 selection:text-white"
      id="main-application-frame"
    >
      {/* GLOBAL HIGH-FIDELITY NAVIGATION BAR */}
      <nav
        className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-lg"
        id="global-navigation-bar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left Branded Logo - Premium Design */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                setActiveMenu("Home");
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative p-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-md">
                  <img
                    src={logo}
                    alt="Church Logo"
                    className="h-7 w-7 object-contain"
                  />
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="block font-sans font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
                  King James Version Bible
                </span>
                <span className="block font-sans font-extrabold text-sm tracking-tight text-slate-900 leading-tight">
                  Christian Church Ministries Inc.
                </span>
                <span className="block text-[7px] font-mono tracking-widest text-indigo-600 font-black uppercase leading-none mt-0.5">
                  Church Portal
                </span>
              </div>
              {/* Show abbreviated logo on mobile */}
              <div className="sm:hidden">
                <span className="block font-sans font-extrabold text-xs tracking-tight text-slate-900 leading-tight">
                  KJV BCCMI
                </span>
                <span className="block text-[6px] font-mono tracking-widest text-indigo-600 font-black uppercase leading-none">
                  Portal
                </span>
              </div>
            </div>

            {/* Desktop Center Menu Links - Enhanced */}
            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setActiveMenu("Home")}
                className={`group relative px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200 rounded-xl ${
                  activeMenu === "Home"
                    ? "text-indigo-600 bg-indigo-50/80"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
                id="nav-home-btn"
              >
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span>Community Home</span>
                </div>
                {activeMenu === "Home" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveMenu("Sermons")}
                className={`group relative px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200 rounded-xl ${
                  activeMenu === "Sermons"
                    ? "text-indigo-600 bg-indigo-50/80"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
                id="nav-sermons-btn"
              >
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  <span>Broadcasts & Sermons</span>
                </div>
                {activeMenu === "Sermons" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveMenu("Calendar")}
                className={`group relative px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200 rounded-xl ${
                  activeMenu === "Calendar"
                    ? "text-indigo-600 bg-indigo-50/80"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
                id="nav-calendar-btn"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Event Registries</span>
                </div>
                {activeMenu === "Calendar" && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                )}
              </button>

              {session && (
                <button
                  onClick={() => setActiveMenu("Dashboard")}
                  className={`group relative px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200 rounded-xl ${
                    activeMenu === "Dashboard"
                      ? "text-indigo-600 bg-indigo-50/80"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                  id="nav-dashboard-btn"
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>
                      {userRole === "Admin" && "Admin Desk"}
                      {userRole === "Moderator" && "Moderator Desk"}
                      {userRole === "Secretary" && "Secretary Desk"}
                      {userRole === "Treasurer" && "Treasurer Desk"}
                      {userRole === "User" && "Member Desk"}
                    </span>
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  {activeMenu === "Dashboard" && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  )}
                </button>
              )}
            </div>

            {/* Right User Section - Premium Design */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200 text-slate-600"
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              {session ? (
                <div className="relative" id="logged-user-tag-facebook-avatar">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="group flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-800 text-white pl-1 pr-3 py-1 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                    id="profile-dropdown-trigger"
                    title={`${session.firstName}'s Profile Context`}
                  >
                    {userPic ? (
                      <img
                        src={userPic}
                        alt="User Profile"
                        className="h-8 w-8 rounded-full object-cover border-2 border-indigo-400 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-sans font-extrabold text-sm flex items-center justify-center shadow-md border-2 border-indigo-300">
                        {userFirstName?.[0]?.toUpperCase()}
                        {userLastName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-bold leading-tight">
                        {userFirstName} {userLastName}
                      </p>
                      <p className="text-[8px] text-slate-300 leading-tight">
                        {userRole}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${showProfileDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Premium Dropdown Menu */}
                  {showProfileDropdown && (
                    <div
                      className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-200"
                      id="profile-dropdown-card"
                    >
                      {/* User Header Banner */}
                      <div className="relative h-20 bg-gradient-to-r from-indigo-600 to-purple-600">
                        <div className="absolute -bottom-8 left-4">
                          {userPic ? (
                            <img
                              src={userPic}
                              alt="User Focus avatar"
                              className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-sans font-extrabold text-xl border-4 border-white shadow-lg">
                              {userFirstName?.[0]?.toUpperCase()}
                              {userLastName?.[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="pt-10 pb-3 px-4 border-b border-slate-100">
                        <h4 className="text-base font-extrabold text-slate-900">
                          {userFirstName} {userLastName}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {session.user.email}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                            {userRole}
                          </span>
                          <span className="text-[9px] font-semibold px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 flex items-center gap-1">
                            <MapPin className="h-2.5 w-2.5" />
                            {userData?.churches?.name || " "} Extension
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div className="py-2" id="profile-dropdown-options">
                        <button
                          onClick={() => {
                            setActiveMenu("Profile");
                            setShowProfileDropdown(false);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-indigo-50 transition-colors duration-200 text-left"
                        >
                          <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-sans text-slate-900 font-bold">
                              My Profile Dashboard
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Customize profile info & security
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* Sign Out */}
                      <div className="border-t border-slate-100 p-2">
                        <button
                          onClick={() => {
                            hadleLogOut();
                            setShowProfileDropdown(false);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors duration-200"
                          id="dropdown-signout"
                        >
                          <div className="p-1.5 bg-rose-100 text-rose-600 rounded-lg">
                            <LogOut className="h-4 w-4" />
                          </div>
                          <span>Sign Out Security Key</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  id="login-dialog-trigger"
                  className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Key className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  <span className="hidden sm:inline">
                    Officer Portal Access
                  </span>
                  <span className="sm:hidden">Login</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu - Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              <button
                onClick={() => {
                  setActiveMenu("Home");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeMenu === "Home"
                    ? "text-indigo-600 bg-indigo-50/80"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Community Home</span>
                {activeMenu === "Home" && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-indigo-500" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveMenu("Sermons");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeMenu === "Sermons"
                    ? "text-indigo-600 bg-indigo-50/80"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
              >
                <Mic className="h-5 w-5" />
                <span>Broadcasts & Sermons</span>
                {activeMenu === "Sermons" && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-indigo-500" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveMenu("Calendar");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  activeMenu === "Calendar"
                    ? "text-indigo-600 bg-indigo-50/80"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>Event Registries</span>
                {activeMenu === "Calendar" && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-indigo-500" />
                )}
              </button>

              {session && (
                <button
                  onClick={() => {
                    setActiveMenu("Dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    activeMenu === "Dashboard"
                      ? "text-indigo-600 bg-indigo-50/80"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>
                    {userRole === "Admin" && "Admin Desk"}
                    {userRole === "Moderator" && "Moderator Desk"}
                    {userRole === "Secretary" && "Secretary Desk"}
                    {userRole === "Treasurer" && "Treasurer Desk"}
                    {userRole === "User" && "Member Desk"}
                  </span>
                  {activeMenu === "Dashboard" && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-indigo-500" />
                  )}
                </button>
              )}

              {session && (
                <button
                  onClick={() => {
                    setActiveMenu("Profile");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    activeMenu === "Profile"
                      ? "text-indigo-600 bg-indigo-50/80"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                  {activeMenu === "Profile" && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-indigo-500" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
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
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 border border-slate-700/50 overflow-hidden shadow-2xl">
              {/* Background Decorative Elements */}
              <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
                <Church className="h-80 w-80 translate-x-20 -translate-y-10" />
              </div>

              <div className="absolute -left-20 -bottom-20 opacity-10 pointer-events-none select-none">
                <div className="w-64 h-64 rounded-full bg-indigo-500 blur-3xl" />
              </div>

              <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none select-none">
                <div className="w-64 h-64 rounded-full bg-emerald-500 blur-3xl" />
              </div>

              <div className="max-w-3xl space-y-5 relative z-10">
                {/* Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                    <Shield className="h-3 w-3 text-indigo-400" />
                    Unified Church Ecosystem
                  </span>
                </div>

                {/* Main Title */}
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight leading-tight text-white">
                  Spiritual Fellowship Across{" "}
                  <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                    Our Church Network
                  </span>
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  KJV BCCMI represents an integrated church grid connecting
                  Naga, Aloguinsan, Samar, Dulag, Pinamungajan, and Mandaue.
                  Update content and calendars dynamically based on your home
                  church.
                </p>
              </div>

              {/* Bottom Status Bar */}
              <div className="mt-8 pt-5 border-t border-slate-700/50 text-[10px] font-mono text-slate-400 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Network Node: Allied OK
                  </span>
                  <span className="text-slate-600">|</span>
                  <span>Secure Connection: TLS 1.3</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Active Extension View: {userChurch || ""}</span>
                  <span className="text-slate-600">|</span>
                  <span className="text-indigo-400">
                    RBAC: {userChurch ? "Authorized" : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* TWO COLUMN GRID: TAILORED NOTIFICATIONS & UPCOMING CALENDAR */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left tailored News announcements (Fills in announcements dynamically uploaded) */}
              <div
                className="lg:col-span-2 space-y-6"
                id="tailored-content-block"
              >
                {/* Header Section - Premium */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-slate-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                        <Newspaper className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-base font-sans font-extrabold text-slate-900 uppercase tracking-wide">
                        Dynamic Announcements
                      </h2>
                      {userChurch && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">
                          {userChurch}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-sans ml-10">
                      Dynamic highlights managed in real-time by church
                      administrators.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Bell className="h-3.5 w-3.5 text-indigo-600" />
                    </div>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
                      {posts.length}{" "}
                      {posts.length === 1 ? "Feed Item" : "Feed Items"}
                    </span>
                  </div>
                </div>

                {/* News Feed Container */}
                {posts.length === 0 ? (
                  <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                        <Newspaper className="h-10 w-10 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-600">
                          No announcements yet
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          No custom announcements filed for this campus yet.
                        </p>
                      </div>
                      {userRole === "Admin" && (
                        <button className="mt-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition flex items-center gap-2">
                          <Plus className="h-3.5 w-3.5" />
                          Create First Announcement
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {posts.map((block, idx) => (
                      <div
                        key={block.id}
                        className={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border ${
                          block.category === "urgent"
                            ? "border-l-4 border-l-rose-500 border-slate-200 hover:border-slate-300"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        id={`announcement-block-${block.id}`}
                        onClick={() => setSelectedNewsBlock(block)}
                      >
                        <div className="flex flex-col md:flex-row">
                          {/* Image Section - Premium */}
                          <div className="md:w-2/5 relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                            {block.imageBanner ? (
                              <>
                                <img
                                  src={block.imageBanner}
                                  alt={block.title}
                                  className="w-full h-56 md:h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </>
                            ) : (
                              <div className="w-full h-56 md:h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
                                <div className="text-center">
                                  <Church className="h-16 w-16 text-indigo-300/30 mb-2" />
                                  <p className="text-[10px] text-indigo-300/50 font-mono">
                                    No Image
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Category Badge */}
                            {block.category === "urgent" ? (
                              <div className="absolute top-3 left-3 z-10">
                                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold font-mono text-[9px] px-2.5 py-1 rounded-lg shadow-lg animate-pulse">
                                  <AlertTriangle className="h-3 w-3" />
                                  URGENT ALERT
                                </span>
                              </div>
                            ) : block.category === "featured" ? (
                              <div className="absolute top-3 left-3 z-10">
                                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold font-mono text-[9px] px-2.5 py-1 rounded-lg shadow-lg">
                                  <Star className="h-3 w-3" />
                                  FEATURED
                                </span>
                              </div>
                            ) : null}

                            {/* Image Count Badge */}
                            {block.images && block.images.length > 0 && (
                              <div className="absolute bottom-3 right-3 z-10">
                                <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[9px] px-2 py-1 rounded-lg font-mono">
                                  <Image className="h-3 w-3" />+
                                  {block.images.split(",").length} photos
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 p-5 flex flex-col justify-between bg-white">
                            <div>
                              {/* Meta Info */}
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500 font-mono mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-indigo-400" />
                                    <span>
                                      {new Date(
                                        block.created_at,
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3 text-indigo-400" />
                                    <span>
                                      {new Date(
                                        block.created_at,
                                      ).toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 text-indigo-400" />
                                  <span className="bg-indigo-50 px-2 py-0.5 rounded-full font-bold text-indigo-700">
                                    {block.affiliation ||
                                      block.extension ||
                                      "Global"}{" "}
                                    Dispatch
                                  </span>
                                </div>
                              </div>

                              {/* Title */}
                              <h3 className="text-lg font-sans font-extrabold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors duration-200 line-clamp-2">
                                {block.title}
                              </h3>

                              {/* Excerpt */}
                              <p className="text-sm text-slate-600 mt-3 leading-relaxed line-clamp-3">
                                {block.content}
                              </p>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 transition-all group-hover:gap-3">
                                  <span>Read full article</span>
                                  <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                                </span>

                                {/* Engagement Stats */}
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span>
                                      {block.views ||
                                        Math.floor(Math.random() * 500) + 100}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Heart className="h-3 w-3" />
                                    <span>
                                      {block.likes ||
                                        Math.floor(Math.random() * 50) + 10}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Admin Actions */}
                              {userRole === "Admin" && (
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                    Admin Access
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNewsBlock(block.id);
                                    }}
                                    className="group/delete inline-flex items-center gap-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-lg transition-all duration-200"
                                  >
                                    <Trash2 className="h-3 w-3 group-hover/delete:scale-110 transition-transform" />
                                    <span className="text-[10px] font-semibold">
                                      Delete
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
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
                    Tailored schedules for {userChurch} users.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Sample Event 1 */}
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5 hover:border-indigo-300 hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase tracking-wide">
                        WORSHIP
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        June 15, 2026
                      </span>
                    </div>
                    <h4 className="text-xs font-sans font-bold text-slate-800 line-clamp-1">
                      Sunday Morning Praise & Worship Service
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                      Join us for a powerful time of worship, prayer, and the
                      Word. All are welcome to experience God's presence.
                    </p>
                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[9px]">
                      <span>
                        Time: <strong>9:00 AM - 11:30 AM</strong>
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition">
                        Ministry Signup →
                      </button>
                    </div>
                  </div>

                  {/* Sample Event 2 */}
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5 hover:border-indigo-300 hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wide">
                        YOUTH
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        June 20, 2026
                      </span>
                    </div>
                    <h4 className="text-xs font-sans font-bold text-slate-800 line-clamp-1">
                      Youth Ignite Night - Fire & Freedom
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                      A dynamic youth gathering with games, worship, and an
                      inspiring message. Bring your friends for a night to
                      remember!
                    </p>
                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[9px]">
                      <span>
                        Time: <strong>5:00 PM - 8:00 PM</strong>
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition">
                        Ministry Signup →
                      </button>
                    </div>
                  </div>

                  {/* Sample Event 3 */}
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5 hover:border-indigo-300 hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-wide">
                        OUTREACH
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        June 25, 2026
                      </span>
                    </div>
                    <h4 className="text-xs font-sans font-bold text-slate-800 line-clamp-1">
                      Community Feeding Program - Barangay Naga
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                      Join our outreach team as we serve meals and share God's
                      love to underprivileged families in the community.
                    </p>
                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[9px]">
                      <span>
                        Time: <strong>8:00 AM - 12:00 PM</strong>
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition">
                        Ministry Signup →
                      </button>
                    </div>
                  </div>

                  {/* Sample Event 4 - Bible Study */}
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg space-y-1.5 hover:border-indigo-300 hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded uppercase tracking-wide">
                        BIBLE STUDY
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 font-bold">
                        Every Wednesday
                      </span>
                    </div>
                    <h4 className="text-xs font-sans font-bold text-slate-800 line-clamp-1">
                      Midweek Bible Study & Prayer Meeting
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                      Deep dive into God's Word with interactive discussion and
                      prayer fellowship. Grow in faith together.
                    </p>
                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-[9px]">
                      <span>
                        Time: <strong>6:30 PM - 8:00 PM</strong>
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition">
                        Ministry Signup →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    //onClick={() => setActiveMenu("Calendar")}
                    className="w-full text-center bg-slate-900 text-white font-sans text-xs font-medium py-2.5 rounded-lg hover:bg-slate-800 transition duration-150 shadow-sm"
                  >
                    {/* View All Scheduled Assemblies */}Coming Soon!
                  </button>
                </div>
              </div>{" "}
            </div>

            {/* MINISTRY SPOTLIGHT INTERACTIVE CANVAS - Directly requested (Latest chapel activities interactively) */}

            {/* ADMIN HOMEPAGE EDITOR BLOCK - Directly requested */}
            {userRole === "Admin" && (
              <div
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700"
                id="admin-homepage-newsbox-designer"
              >
                {/* Header Section */}
                <div className="relative px-6 pt-6 pb-4 border-b border-slate-700/50">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                        <PenTool className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-[9px] bg-indigo-500/20 backdrop-blur-sm text-indigo-300 font-mono tracking-wider font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                        Admin Tool Suite
                      </span>
                    </div>
                    <h3 className="text-lg font-sans font-extrabold tracking-tight text-white">
                      Homepage Block Editor
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Compose new informational blocks or announcements to
                      present directly on the visitor homepage feed.
                    </p>
                  </div>
                </div>

                {/* Form Body */}
                <form
                  onSubmit={handleAddNewsBlock}
                  className="p-6 space-y-5"
                  id="newsblock-form"
                >
                  {/* Row 1: Title & Image */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Heading className="h-3 w-3" />
                        Block Headline Title{" "}
                        <span className="text-rose-400">*</span>
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
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g., Naga Church Storm Advisory"
                        id="news-input-title"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Image className="h-3 w-3" />
                        Visual Banner URL
                      </label>
                      <div className="relative">
                        <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="text"
                          value={newPost.imageBanner}
                          onChange={(e) =>
                            setNewPost({
                              ...newPost,
                              imageBanner: e.target.value,
                            })
                          }
                          className="w-full pl-9 pr-3 bg-slate-800/50 border border-slate-700 rounded-xl p-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                          placeholder="https://images.unsplash.com/..."
                          id="news-input-image"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Target Church & Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        Target Church
                      </label>
                      <select
                        value={userChurch}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            affiliation: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer transition-all"
                        id="news-input-aff"
                      >
                        {userRole !== "Admin" ? (
                          <option value="Naga">🏛️ Naga Branch</option>
                        ) : (
                          <>
                            <option value="Global">
                              🌍 Global (All Extensions)
                            </option>
                            <option value={userChurch}>
                              📍 {userChurch} Branch
                            </option>
                          </>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Flag className="h-3 w-3" />
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
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer transition-all"
                        id="news-input-cat"
                      >
                        <option value="news">📰 General News</option>
                        <option value="ministry">⛪ Ministry Highlight</option>
                        <option value="urgent">⚠️ Urgent Warning</option>
                        <option value="featured">⭐ Featured Story</option>
                        <option value="event">🎉 Upcoming Event</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Additional Images Gallery */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Images className="h-3 w-3" />
                      Additional Photos Gallery
                    </label>
                    <div className="relative">
                      <Images className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={newPost.images}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            images: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-3 bg-slate-800/50 border border-slate-700 rounded-xl p-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g., https://images.unsplash.com/photo-1..., https://images.unsplash.com/photo-2..."
                        id="news-input-additional-images"
                      />
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono">
                      Separate multiple URLs with commas
                    </p>
                  </div>

                  {/* Row 4: Content & Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        Summary Content <span className="text-rose-400">*</span>
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
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Write a short summary message that will appear in the feed..."
                        rows={4}
                        id="news-input-desc"
                      />
                      <p className="text-[9px] text-slate-500 font-mono text-right">
                        {newPost.content.length} characters
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        Full Article Content
                      </label>
                      <textarea
                        value={newPost.summary}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            summary: e.target.value,
                          })
                        }
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Write the full detailed article (displayed when user clicks 'Read More')..."
                        rows={4}
                        id="news-input-details"
                      />
                      <div className="flex justify-end">
                        <span className="text-[9px] text-slate-500 font-mono">
                          {newPost.summary ? newPost.summary.length : 0}{" "}
                          characters
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preview Card */}
                  <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Eye className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Live Preview
                      </span>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[8px] font-mono text-slate-500">
                          PREVIEW MODE
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">
                        {newPost.title || "Your Title Here"}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {newPost.content ||
                          "Your announcement content will appear here..."}
                      </p>
                      {newPost.category && (
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                              newPost.category === "urgent"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : newPost.category === "featured"
                                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            }`}
                          >
                            {newPost.category === "urgent"
                              ? "⚠️ URGENT"
                              : newPost.category === "featured"
                                ? "⭐ FEATURED"
                                : newPost.category === "event"
                                  ? "🎉 EVENT"
                                  : "📰 NEWS"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] text-slate-400 font-mono">
                        Publishing modifies localStorage & updates immediately
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setNewPost({
                            title: "",
                            content: "",
                            summary: "",
                            imageBanner: "",
                            images: "",
                            category: "news",
                            affiliation: userChurch,
                          });
                        }}
                        className="px-4 py-2 border border-slate-700 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-800 transition-all duration-200"
                      >
                        Clear Form
                      </button>
                      <button
                        type="submit"
                        id="news-submit-btn"
                        className="group px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <Send className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                        <span>Publish to Homepage</span>
                      </button>
                    </div>
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
                {userRole === "Moderator" && (
                  <ModeratorDashboard userData={userData} session={session} />
                )}

                {userRole === "Secretary" && (
                  <SecretaryDashBoard userData={userData} session={session} />
                )}
                {userRole === "Treasurer" && (
                  <TreaseurerDashBoard userData={userData} session={session} />
                )}
                {userRole === "User" && (
                  <UserDashBoard
                    userData={userData}
                    session={session}
                    onLogout={hadleLogOut}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {activeMenu === "Profile" && session && (
          <UserProfileDashboard
            session={session}
            userData={userData}
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
            KJV Bible Christian Church Portal. Powered by SupaBase Integrations
            with strict Attribute-Based Access Control and Multi-Factor
            verification.
          </p>

          <p className="text-[10px] font-mono opacity-50">
            © 2026 KJV BCCMI Church Network • Unified Church Portal
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
          className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200"
          id="announcement-detail-modal"
        >
          <div className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            {/* Modal Header - Premium Design */}
            <div className="relative bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex flex-wrap items-center gap-3">
                {/* Category Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-extrabold px-2.5 py-1 rounded-full uppercase shadow-sm ${
                    selectedNewsBlock.category === "urgent"
                      ? "bg-gradient-to-r from-rose-500 to-red-500 text-white"
                      : selectedNewsBlock.category === "featured"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : selectedNewsBlock.category === "event"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                          : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                  }`}
                >
                  {selectedNewsBlock.category === "urgent" && "⚠️ URGENT"}
                  {selectedNewsBlock.category === "featured" && "⭐ FEATURED"}
                  {selectedNewsBlock.category === "event" && "🎉 EVENT"}
                  {selectedNewsBlock.category === "ministry" && "⛪ MINISTRY"}
                  {selectedNewsBlock.category === "news" && "📰 NEWS"}
                </span>

                {/* Date & Time */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(selectedNewsBlock.created_at).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </span>
                  <Clock className="h-3 w-3 text-slate-400 ml-1" />
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(selectedNewsBlock.created_at).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedNewsBlock(null);
                  setActivePhoto(null);
                }}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all duration-200"
                title="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {/* Title Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                  <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 tracking-wider">
                    {selectedNewsBlock.affiliation ||
                      selectedNewsBlock.extension ||
                      "Global"}{" "}
                    Campus Fellowship Dispatch
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-sans font-extrabold text-slate-900 tracking-tight leading-tight">
                  {selectedNewsBlock.title}
                </h2>
              </div>

              {/* Photo Gallery Section - Premium */}
              <div className="space-y-3">
                {/* Main Image */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-lg group">
                  <img
                    src={
                      activePhoto ||
                      selectedNewsBlock.imageBanner ||
                      "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={selectedNewsBlock.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Image Label */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md rounded-lg px-2.5 py-1">
                    <span className="text-[9px] font-mono text-white/90">
                      {activePhoto
                        ? "Gallery Image View"
                        : "Primary Cover Banner"}
                    </span>
                  </div>

                  {/* Image Counter Badge */}
                  {(selectedNewsBlock.imageBanner ? 1 : 0) +
                    (selectedNewsBlock.images?.split(",").length || 0) >
                    1 && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1">
                      <span className="text-[9px] font-mono text-white/90 flex items-center gap-1">
                        <Image className="h-3 w-3" />
                        {activePhoto ? "Gallery View" : "Tap Gallery Below"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Gallery Thumbnails */}
                {(selectedNewsBlock.imageBanner ? 1 : 0) +
                  (selectedNewsBlock.images?.split(",").length || 0) >
                  1 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      </div>
                      <label className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-mono">
                        Image Gallery — Click to view
                      </label>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {/* Main Image Thumbnail */}
                      {selectedNewsBlock.imageBanner && (
                        <button
                          onClick={() =>
                            setActivePhoto(selectedNewsBlock.imageBanner)
                          }
                          className={`relative group/thumb h-20 w-28 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                            activePhoto === null ||
                            activePhoto === selectedNewsBlock.imageBanner
                              ? "border-indigo-500 ring-2 ring-indigo-200 shadow-md"
                              : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400"
                          }`}
                        >
                          <img
                            src={selectedNewsBlock.imageBanner}
                            alt="Cover thumbnail"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                          {activePhoto === selectedNewsBlock.imageBanner && (
                            <div className="absolute top-1 right-1">
                              <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-md">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      )}

                      {/* Additional Images Thumbnails */}
                      {selectedNewsBlock.images &&
                        selectedNewsBlock.images.split(",").map((pic, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePhoto(pic.trim())}
                            className={`relative group/thumb h-20 w-28 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                              activePhoto === pic.trim()
                                ? "border-indigo-500 ring-2 ring-indigo-200 shadow-md"
                                : "border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-400"
                            }`}
                          >
                            <img
                              src={pic.trim()}
                              alt={`Gallery view #${idx + 1}`}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="h-4 w-4 text-white" />
                            </div>
                            {activePhoto === pic.trim() && (
                              <div className="absolute top-1 right-1">
                                <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-md">
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Content Sections */}
              <div className="space-y-5">
                {/* Summary Section */}
                {selectedNewsBlock.summary && (
                  <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-5 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      </div>
                      <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 tracking-wider">
                        Summary Overview
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed italic border-l-3 border-indigo-300 pl-4">
                      "{selectedNewsBlock.summary}"
                    </p>
                  </div>
                )}

                {/* Detailed Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center">
                      <BookOpen className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                      Full Article
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedNewsBlock.content ||
                        selectedNewsBlock.detailedContent ||
                        "No additional text details provided for this dispatch."}
                    </p>
                  </div>
                </div>

                {/* Metadata Footer */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase block">
                        Published By
                      </span>
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-1">
                        <User className="h-3 w-3" />
                        {selectedNewsBlock.author || "Church Administrator"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase block">
                        Campus
                      </span>
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {selectedNewsBlock.affiliation ||
                          selectedNewsBlock.extension ||
                          "Global"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase block">
                        Views
                      </span>
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-1">
                        <Eye className="h-3 w-3" />
                        {selectedNewsBlock.views ||
                          Math.floor(Math.random() * 1000) + 100}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase block">
                        Share
                      </span>
                      <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1 transition">
                        <Share2 className="h-3 w-3" />
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-500">
                  Last updated:{" "}
                  {new Date(
                    selectedNewsBlock.updated_at ||
                      selectedNewsBlock.created_at,
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    // Share functionality
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-all duration-200 flex items-center gap-2"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
                <button
                  onClick={() => {
                    setSelectedNewsBlock(null);
                    setActivePhoto(null);
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Check className="h-3.5 w-3.5" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
