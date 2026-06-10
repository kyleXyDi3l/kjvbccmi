import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "../supabase-client";
import {
  Users,
  UserPlus,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Upload,
  FileVideo,
  FileImage,
  Mail,
  Phone,
  CalendarDays,
  Key,
  HeartPulse,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Search,
  Shield,
  X,
  PenTool,
  User,
  MapPin,
  FileText,
  Image,
} from "lucide-react";

const MOCK_AVATAR_PRESETS = [
  {
    label: "Male Active",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
  },
  {
    label: "Female Grace",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  },
  {
    label: "Youth Lead",
    url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
  },
  {
    label: "Female Lead",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
  },
];

export default function SecretaryDashBoard({ userData, session }) {
  const [activeTab, setActiveTab] = useState("registry");
  const [successMemo, setSuccessMemo] = useState("");
  const [errorMemo, setErrorMemo] = useState("");

  //Loading State
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 1. Managing Active/Edit Member Form State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  // Custom states added for Printable ID & Pagination
  const [selectedIdMember, setSelectedIdMember] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Signature drawing pad states & helper ref
  // Create a ref for the canvas
  const canvasRef = useRef(null);

  // Track whether signature is typed or drawn
  const [sigType, setSigType] = useState("typed");
  const [hasDrawnSig, setHasDrawnSig] = useState(false);
  const [isSignActive, setIsSignActive] = useState(false);

  // Drawing signature pad event callbacks
  const startSignDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#c7d2fe"; // light indigo stroke
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsSignActive(true);
    setHasDrawnSig(true);
  };

  const drawSign = (e) => {
    if (!isSignActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endSignDraw = () => {
    setIsSignActive(false);
  };

  const clearSignCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSig(false);
    setIsSignActive(false);
  };

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [userData]);

  const [photoFile, setPhotoFile] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [joinDate, setJoinDate] = useState("2026-06-01");
  const [status, setStatus] = useState("Active");
  const [notes, setNotes] = useState("");
  const [church, setChurch] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // 2. Managing Active Calendar Event Form State
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("2026-06-15");
  const [eventTime, setEventTime] = useState("17:00");
  const [ministryType, setMinistryType] = useState("General");

  // Contains members Data
  const [members, setMembers] = useState([]);

  // State of creating a member
  const [newMember, setNewMember] = useState({
    id: "",
    firstName: "",
    lastName: "",
    emailAdd: "",
    phoneNumber: "",
    birthDate: "",
    churchID: "",
    status: "",
    joinDate: "",
    notes: "",
    profilePic: "",
  });

  const resetMember = () => {
    (console.log("resetMember UserData: ", userData),
      setNewMember({
        id: "",
        firstName: "",
        lastName: "",
        emailAdd: "",
        phoneNumber: "",
        birthDate: "",
        churchID: userData.churches.id,
        status: "Active",
        joinDate: "",
        notes: "",
        profilePic: "",
      }));
  };

  useEffect(() => {
    const channel = supabase
      .channel("members-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "members" },
        (payload) => {
          const members = payload.new;
          setMembers((prevMembers) => [members, ...prevMembers]);
        },
      )
      // Listen for updated members
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "members" },
        (payload) => {
          const updatedMember = payload.new;
          setMembers((prevMembers) =>
            prevMembers.map((m) =>
              m.id === updatedMember.id ? updatedMember : m,
            ),
          );
        },
      )
      // Listen for deleted posts
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "members" },
        (payload) => {
          const deletedMemberId = payload.old;
          setMembers((prevMembers) =>
            prevMembers.filter(
              (prevMembers) => prevMembers.id !== deletedMemberId.id,
            ),
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
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    console.log("fetching members");
    setIsDataLoading(true);
    const { data, error } = await supabase
      .from("members")
      .select(`*, churches(id, name)`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching members:", error.message);
    } else {
      setMembers(data);
      console.log("Fetched members:", data);
    }
    setIsDataLoading(false);
  };

  const triggerAddMember = () => {
    setEditingMember(null);
    resetMember();
    setShowMemberModal(true);
  };

  // Handle member editing trigger
  const triggerEditMember = (m) => {
    console.log("Trigger Edit Member", m);
    setEditingMember(m);
    setNewMember({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      emailAdd: m.emailAdd,
      phoneNumber: m.phoneNumber,
      birthDate: m.birthDate,
      churchID: userData.churches.id,
      status: m.status,
      joinDate: m.joinDate,
      notes: m.notes,
      profilePic: m.profilePic,
    });
    setShowMemberModal(true);
  };

  // Handle member Printing of ID
  const triggerPrintIdMember = (m) => {
    console.log("Trigger to Print ID Member", m);
    setEditingMember(m);
    setSelectedIdMember({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      emailAdd: m.emailAdd,
      phoneNumber: m.phoneNumber,
      birthDate: m.birthDate,
      churchName: userData.churches.name,
      status: m.status,
      joinDate: m.joinDate,
      notes: m.notes,
      profilePic: m.profilePic,
    });
    //setShowMemberModal(true);
  };

  // Submit Member Registration Form (Upload & Edit)
  const handleSaveMember = async (e) => {
    e.preventDefault();
    let profileImgUrl = null;
    // if (!firstName || !lastName || !email || !birthday) {
    //   alert("Please populate required member fields.");
    //   return;
    // }
    if (photoFile) {
      profileImgUrl = await uploadImage(photoFile);
      setNewMember({
        ...newMember,
        profilePic: profileImgUrl,
      });

      //setPhotoUrl(profileImgUrl); // update preview immediately
    }

    if (!editingMember) {
      const { id, ...memberData } = newMember;
      // Here you would typically send the new post to your backend or database
      const { error } = await supabase
        .from("members")
        .insert({ ...memberData, createdBy: session.user.id });
      if (error) {
        console.error("Error adding new Member:", error.message);
        return;
      }
      setSuccessMemo(
        `Successfully registered new member ${firstName} ${lastName} to state files.`,
      );
    } else {
      // Build update object with only changed fields
      const updates = {};
      for (const key in newMember) {
        if (newMember[key] !== editingMember[key]) {
          updates[key] = newMember[key];
        }
      }
      if (Object.keys(updates).length > 0) {
        console.log("Updates", updates);
        const { error } = await supabase
          .from("members")
          .update(updates)
          .eq("id", newMember.id);

        if (error) {
          console.error("Error editing task:", error.message);
          return;
        }
        setSuccessMemo(
          `Successfully updated registry files for ${newMember.firstName} ${newMember.lastName}.`,
        );
      } else {
        // No changes detected
        setSuccessMemo("Nothing to update");
      }
    }

    resetMember();
    setShowMemberModal(false);
    setTimeout(() => setSuccessMemo(""), 4500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Restrict to reasonably sized files under 2MB to fit smoothly into Supabase strings
      if (file.size > 2 * 1024 * 1024) {
        setErrorMemo(
          "Please select an image file under 2MB to guarantee instant mobile sync.",
        );
        return;
      }

      setPhotoFile(file); // keep File object for Supabase upload

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setNewMember({
            ...newMember,
            profilePic: reader.result,
          });
          //setPhotoUrl(reader.result);
          setSuccessMemo(
            'Custom profile picture uploaded. Click "Save Profile Changes" below to sync.',
          );
          setTimeout(() => setSuccessMemo(""), 5000);
        }
      };
      reader.onerror = () => {
        setErrorMsg(
          "Error processing selected image file. Please try a different profile photo.",
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const filePath = `${file.name}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("members-pic")
      .upload(filePath, file);

    if (error) {
      console.log("Error uploading Image:", error.message);
      return null;
    }

    const { data } = await supabase.storage
      .from("profile-pic")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const totalPages = Math.ceil(members.length / itemsPerPage);

  const paginatedMembers = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return members.slice(offset, offset + itemsPerPage);
  }, [members, currentPage]);

  const phoneNumberChangeHandler = (e) => {
    // Remove all non-digits
    let digits = e.target.value.replace(/\D/g, "");

    // Convert +639... → 09...
    if (digits.startsWith("639")) {
      digits = "09" + digits.slice(3);
    }

    // Limit to max 11 digits
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }

    setNewMember({
      ...newMember,
      phoneNumber: digits,
    });
    // setPhoneNumber();

    // Validation: must be exactly 11 digits (ignoring dashes)
    const plainDigits = digits.replace(/-/g, "");
    if (plainDigits.length !== 11) {
      setErrorMemo("Phone number must be exactly 11 digits.");
    } else {
      setErrorMemo("");
    }
  };

  if (isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading registry data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="secretary-dashboard-view">
      {/* Header Info */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950/30 text-white rounded-2xl p-6 md:p-8 border border-slate-700/50 overflow-hidden shadow-xl">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-sky-500 blur-3xl" />
        </div>

        <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
          <ShieldCheck className="h-64 w-64 translate-x-20 -translate-y-10" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Content */}
          <div className="flex-1 space-y-3">
            {/* Badge Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Location Clerk Authority</span>
                </span>
              </div>
              <div className="h-3 w-px bg-slate-600 hidden sm:block" />
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-sans">
                  Localized Context:
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {userData.churches.name || ""} Extension Only
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
              Registry &{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Event Scheduler Workspace
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
              Add/edit local member profiles, coordinate local ministry cohorts,
              and publish calendar updates with interactive media.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] text-slate-300">Live Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                  <Users className="h-3 w-3 text-teal-400" />
                </div>
                <span className="text-[10px] text-slate-300">
                  Member Management
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center">
                  <Calendar className="h-3 w-3 text-sky-400" />
                </div>
                <span className="text-[10px] text-slate-300">
                  Event Planning
                </span>
              </div>
            </div>
          </div>

          {/* View Toggle Tabs - Redesigned */}
          <div className="relative">
            {/* Glow behind tabs */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur-xl opacity-50" />

            <div className="relative bg-slate-800/50 backdrop-blur-sm p-1 rounded-xl flex gap-1 border border-slate-700/50 shrink-0">
              <button
                onClick={() => setActiveTab("registry")}
                className={`group relative px-5 py-2.5 rounded-lg text-xs font-bold font-sans tracking-wide transition-all duration-200 flex items-center gap-2 ${
                  activeTab === "registry"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Users
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${activeTab === "registry" ? "scale-110" : ""}`}
                />
                <span>Member Files</span>
                {activeTab === "registry" && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>

              <button
                //onClick={() => setActiveTab("scheduler")}
                className={`group relative px-5 py-2.5 rounded-lg text-xs font-bold font-sans tracking-wide transition-all duration-200 flex items-center gap-2 ${
                  activeTab === "scheduler"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
                id="scheduler-tab-btn"
              >
                <Calendar
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${activeTab === "scheduler" ? "scale-110" : ""}`}
                />
                <span>Calendar Events</span>
                {activeTab === "scheduler" && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {successMemo && (
        <div
          className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 font-medium"
          id="sec-success-notice"
        >
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMemo}</span>
        </div>
      )}

      {/* VIEW PANEL 1: MEMBERS REGISTRY FILE MANAGER */}
      {activeTab === "registry" && (
        <div
          className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
          id="member-registry-panel"
        >
          {/* Header Section - Premium */}
          <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-sm font-sans font-extrabold text-slate-800 uppercase tracking-wider">
                    Congregation Registry
                  </h2>
                  <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">
                    SECURE MODE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans ml-10">
                  Clerks are authorized to alter records strictly within the
                  bounds of the{" "}
                  <span className="font-bold text-indigo-600">
                    {userData?.churches?.name || "Naga"}
                  </span>{" "}
                  Church.
                </p>
              </div>

              <button
                onClick={triggerAddMember}
                id="add-member-trigger"
                className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 shrink-0 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <UserPlus className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                <span>Add Member Profile</span>
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="px-6 pt-4 pb-2 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 hover:bg-white transition"
                />
              </div>
              <div className="flex gap-2">
                <select className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Pending</option>
                </select>
                <select className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer">
                  <option>Sort by: Join Date</option>
                  <option>Sort by: Name</option>
                  <option>Sort by: Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Members Table - Premium Design */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 font-mono font-bold uppercase tracking-wider border-b-2 border-slate-200">
                  <th className="p-4">Ref ID</th>
                  <th className="p-4">Member</th>
                  <th className="p-4">Contact Information</th>
                  <th className="p-4">Birthday</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                          <Users className="h-8 w-8 text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-400 italic font-sans">
                          No members registered under the{" "}
                          <span className="font-bold text-slate-600">
                            {userData?.churches?.name || "Naga"}
                          </span>{" "}
                          chapel database.
                        </p>
                        <button
                          onClick={triggerAddMember}
                          className="mt-2 text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          Add your first member
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedMembers.map((m, idx) => (
                    <tr
                      key={m.id}
                      className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-200 group"
                    >
                      <td className="p-4">
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          {m.id}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {m.profilePic ? (
                            <img
                              src={m.profilePic}
                              alt={`${m.firstName}`}
                              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                              {m.firstName?.[0] || "U"}
                              {m.lastName?.[0] || "s"}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-800">
                              {m.firstName} {m.lastName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {m.emailAdd}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span className="font-mono text-[11px] text-slate-600">
                            {m.phoneNumber || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="font-mono text-[11px] text-slate-600">
                            {m.birthDate || "Not set"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold font-mono uppercase shadow-sm ${
                            m.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : m.status === "Inactive"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              m.status === "Active"
                                ? "bg-emerald-500 animate-pulse"
                                : m.status === "Inactive"
                                  ? "bg-rose-500"
                                  : "bg-amber-500"
                            }`}
                          />
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-[11px] font-sans">
                          <div className="font-semibold text-slate-700">
                            {m.joinDate}
                          </div>
                          <div className="text-[9px] text-slate-400">
                            Member since
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedIdMember(m)}
                            className="group/print inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer shadow-sm hover:shadow"
                            id={`print-id-btn-${m.id}`}
                            title="Generate & View Printable Member ID"
                          >
                            <Printer className="h-3 w-3 group-hover/print:scale-110 transition-transform" />
                            <span>ID Card</span>
                          </button>
                          <button
                            onClick={() =>
                              triggerEditMember({
                                ...m,
                                churchName: userData?.churches?.name,
                              })
                            }
                            className="group/edit inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-800 text-slate-600 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer"
                            id={`edit-btn-${m.id}`}
                          >
                            <Edit2 className="h-3 w-3 group-hover/edit:scale-110 transition-transform" />
                            <span>Edit</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - Premium Design */}
          {totalPages > 1 && (
            <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <p className="text-xs text-slate-600 font-sans">
                    Showing{" "}
                    <span className="font-extrabold text-slate-900">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-extrabold text-slate-900">
                      {Math.min(currentPage * itemsPerPage, members.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-extrabold text-indigo-600">
                      {members.length}
                    </span>{" "}
                    registered members
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-xl px-3 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1 text-xs font-medium hidden sm:inline">
                      Previous
                    </span>
                  </button>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center justify-center min-w-[36px] px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-105"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300"
                        } cursor-pointer`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-xl px-3 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <span className="mr-1 text-xs font-medium hidden sm:inline">
                      Next
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW PANEL 2: EVENTS SCHEDULER & MINISTRY ROSTER */}
      {activeTab === "scheduler" && (
        <div
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
          id="secretary-scheduler-panel"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-4.5 w-4.5 text-indigo-600" />
                <span>Chapel Calendar Events & Ministry Promos</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-sans">
                Schedule services, and upload media slides to display in the
                community feed.
              </p>
            </div>

            <button
              onClick={() => setShowEventModal(true)}
              id="add-event-trigger-btn"
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-1.8 rounded-lg transition shrink-0 flex items-center gap-1.5 shadow"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule New Event</span>
            </button>
          </div>

          {/* Events Log Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.map((e) => (
              <div
                key={e.id}
                className="border border-slate-100 rounded-xl overflow-hidden flex flex-col md:flex-row bg-slate-50"
              >
                <div className="md:w-4/12 h-28 relative bg-slate-200">
                  <img
                    src={e.imageUrl}
                    alt={e.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute top-2 left-2 bg-slate-900 text-white text-[9px] font-mono tracking-wide font-bold uppercase rounded px-1.5 py-0.5 shadow-sm">
                    {e.ministryType}
                  </span>
                </div>

                <div className="p-3 md:w-8/12 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 font-sans leading-tight line-clamp-1">
                      {e.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {e.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 mt-2 flex items-center justify-between text-[10px] text-slate-500 font-sans">
                    <div>
                      <p>
                        Date:{" "}
                        <strong className="text-slate-700">{e.date}</strong>
                      </p>
                      <p>Time: {e.time}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {e.signups && (
                        <span className="bg-indigo-100 text-indigo-900 border border-indigo-200 rounded px-1.5 py-0.5 font-bold animate-pulse text-[9px]">
                          {e.signups.length} Signed Up
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete and unschedule the event "${e.title}"?`,
                            )
                          ) {
                            onDeleteEvent?.(e.id);
                          }
                        }}
                        className="p-1 text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                        title="Delete Event"
                        id={`del-btn-${e.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MEMBER REGISTRATION DIALOG MODAL (Add & Edit) */}
      {showMemberModal && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200"
          id="member-profile-modal"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col my-8 animate-in zoom-in-95 duration-300">
            {/* Header - Premium Design */}
            <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2 border border-emerald-500/30">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-mono uppercase font-bold text-emerald-300 tracking-wider">
                      DATABASE TRANSACTION
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-white text-lg tracking-tight">
                    {editingMember
                      ? `Update Profile: ${newMember.firstName || ""} ${newMember.lastName || ""}`
                      : "Add New Member Profile Record"}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {editingMember
                      ? "Edit member information securely"
                      : "Register a new member to the congregation"}
                  </p>
                </div>
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleSaveMember}
              className="p-6 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar"
              id="member-file-form"
            >
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={newMember.firstName}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          firstName: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                      placeholder="Enter first name"
                      id="mem-input-fname"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={newMember.lastName}
                      onChange={(e) =>
                        setNewMember({ ...newMember, lastName: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                      placeholder="Enter last name"
                      id="mem-input-lname"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={newMember.emailAdd}
                      onChange={(e) =>
                        setNewMember({ ...newMember, emailAdd: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                      placeholder="member@church.org"
                      id="mem-input-email"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={newMember.phoneNumber}
                      onChange={phoneNumberChangeHandler}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                      placeholder="+63 9xx xxx xxxx"
                      id="mem-input-phone"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Extension */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Date of Birth <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={newMember.birthDate}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          birthDate: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      id="mem-input-birthday"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Affiliated Extension
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      readOnly
                      value={userData?.churches?.name || "Naga"}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-100 text-slate-600 font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Join Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Membership Status
                  </label>
                  <select
                    value={newMember.status}
                    onChange={(e) =>
                      setNewMember({ ...newMember, status: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer transition-all"
                    id="mem-input-status"
                  >
                    <option value="Active">✅ Active Participant</option>
                    <option value="Inactive">⭕ Inactive Fellow</option>
                    <option value="Outreach">🌍 Outreach Contact</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Join Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={newMember.joinDate}
                      onChange={(e) =>
                        setNewMember({ ...newMember, joinDate: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      id="mem-input-joindate"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Notes / Pastoral Records
                </label>
                <textarea
                  value={newMember.notes}
                  onChange={(e) =>
                    setNewMember({ ...newMember, notes: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[80px] bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white resize-none"
                  placeholder="Insert pastoral notes, prayer request highlights, cell group references, or special concerns..."
                  id="mem-input-notes"
                />
              </div>

              {/* Profile Photo Section */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <Image className="h-3.5 w-3.5" />
                  Member Profile Photo
                </label>

                <div className="flex gap-4 items-start">
                  {/* Avatar Preview */}
                  <div className="shrink-0">
                    {newMember.profilePic ? (
                      <img
                        src={newMember.profilePic}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-200 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-200 flex items-center justify-center shadow-md">
                        <Image className="h-6 w-6 text-indigo-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* URL Input */}
                    <input
                      type="text"
                      placeholder="https://example.com/photo.jpg or paste image URL"
                      value={newMember.profilePic}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          profilePic: e.target.value,
                        })
                      }
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                      id="mem-input-photo-url"
                    />

                    {/* Avatar Presets & Upload */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] text-slate-500 font-medium">
                        Quick presets:
                      </span>
                      {MOCK_AVATAR_PRESETS.map((avatar, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setNewMember({
                              ...newMember,
                              profilePic: avatar.url,
                            })
                          }
                          className="group relative text-[9px] bg-slate-100 hover:bg-indigo-100 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          {avatar.label}
                        </button>
                      ))}

                      <label className="flex items-center gap-1 text-[9px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg cursor-pointer hover:bg-indigo-100 transition-all duration-200 font-medium">
                        <Upload className="h-2.5 w-2.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowMemberModal(false)}
                className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer uppercase tracking-wide"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSaveMember}
                id="mem-submit-btn"
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide"
              >
                <CheckCircle className="h-4 w-4" />
                <span>
                  {editingMember ? "Save Changes" : "Register Member"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVENT SCHEDULER DIALOG MODAL (Image & video upload features) */}
      {showEventModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          id="event-scheduler-modal"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col my-8">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono uppercase bg-indigo-900 text-indigo-200 px-2 py-0.5 rounded block w-fit mb-1 font-bold">
                  SCHEDULER ENGINE
                </span>
                <h3 className="font-sans font-semibold text-sm">
                  Create Branch Calendar Event
                </h3>
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveEvent}
              className="p-5 space-y-3.5 overflow-y-auto max-h-[75vh]"
              id="event-scheduler-form"
            >
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Event Activity Title *
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  //   onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                  placeholder="e.g. Couples Thanksgiving Potluck"
                  id="evt-input-title"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  value={eventDesc}
                  //onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full border border-slate-300 p-2 text-xs rounded-lg min-h-[50px] bg-white text-slate-800 focus:outline-none animate-none"
                  placeholder="Provide schedule details, dress preferences, or general announcements..."
                  id="evt-input-desc"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Service Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    //onChange={(e) => setEventDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                    id="evt-input-date"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    //onChange={(e) => setEventTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                    id="evt-input-time"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Ministry Category
                  </label>
                  <select
                    value={ministryType}
                    //onChange={(e) => setMinistryType(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                    id="evt-input-category"
                  >
                    <option value="General">General Congregation</option>
                    <option value="Youth">Youth Ignite</option>
                    <option value="Worship">Praise & Worship</option>
                    <option value="Couples">Couples Enrichment</option>
                    <option value="Kids">Kids/Sunday School</option>
                    <option value="Outreach">Community Outreach</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Assigned Extension
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={userData.churches.name}
                    className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg p-2 text-xs focus:outline-none font-bold"
                  />
                </div>
              </div>

              {/* MEDIA UPLOAD CONSOLE - Directly requested: allows secretaries to upload image/videos for events */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="block text-[10px] font-mono tracking-wider font-bold text-indigo-800 uppercase">
                  Event Media Desk (Interactive File Uploader)
                </span>

                <div className="grid grid-cols-2 gap-3" id="clerk-media-choice">
                  {/* Image Attachment Choice */}
                  <label className="bg-white border rounded-lg p-2.5 flex flex-col items-center justify-center cursor-pointer hover:border-slate-800 hover:bg-slate-50 transition text-center">
                    <FileImage className="h-4.5 w-4.5 text-indigo-600 mb-1" />
                    <span className="block text-[10px] font-sans font-bold text-slate-700">
                      Attach Image Photo
                    </span>
                    <span className="block text-[9px] text-slate-400">
                      JPG, PNG, WebP format
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      //onChange={(e) => handleSimulatedFileUpload(e, 'image')}
                      className="hidden"
                    />
                  </label>

                  {/* Video Attachment Choice */}
                  <label className="bg-white border rounded-lg p-2.5 flex flex-col items-center justify-center cursor-pointer hover:border-slate-800 hover:bg-slate-50 transition text-center">
                    <FileVideo className="h-4.5 w-4.5 text-pink-600 mb-1" />
                    <span className="block text-[10px] font-sans font-bold text-slate-700">
                      Attach Video Promo
                    </span>
                    <span className="block text-[9px] text-slate-400">
                      MP4, MOV format
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      //onChange={(e) => handleSimulatedFileUpload(e, 'video')}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Simulated file display feedback */}
                {mediaFileName ? (
                  <div className="bg-white p-2 border rounded border-indigo-200 flex items-center justify-between text-[11px] text-slate-700">
                    <div className="flex items-center gap-1.5 truncate">
                      {mediaType === "image" ? (
                        <FileImage className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      ) : (
                        <FileVideo className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                      )}
                      <span className="truncate italic">
                        File: {mediaFileName}
                      </span>
                    </div>
                    <span className="text-[9px] text-emerald-600 font-mono font-bold bg-emerald-50 px-1.5 py-0.2 rounded shrink-0">
                      STAGED FOR UPLOAD
                    </span>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Optional: upload a visual file to render beautiful details
                    in calendar modules.
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 py-1.8 border text-slate-600 font-semibold border-slate-300 hover:bg-slate-50 text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-clerk-event-btn"
                  className="flex-1 py-1.8 bg-indigo-600 text-white font-semibold hover:bg-slate-900 text-xs rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Upload className="h-4 w-4" />
                  <span>Publish and Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER PRINTABLE ID CARD GENERATOR MODAL */}
      {selectedIdMember && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200"
          id="printable-id-modal"
        >
          {/* Dynamic Style block for printing */}
          <style>{`
      @media print {
        body * {
          visibility: hidden !important;
        }
        #printable-id-card-frame, #printable-id-card-frame * {
          visibility: visible !important;
        }
        #printable-id-card-frame {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          background: white !important;
          box-shadow: none !important;
          transform: none !important;
        }
        .no-print {
          display: none !important;
        }
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      .shimmer-effect {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
    `}</style>

          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col lg:flex-row my-8 animate-in zoom-in-95 duration-300">
            {/* Left: Printable Card View Screen - Premium Design */}
            <div
              className="flex-1 bg-gradient-to-br from-slate-100 to-slate-50 p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200"
              id="printable-id-card-frame"
            >
              {/* Header Info */}
              <div className="text-center mb-5 no-print">
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-slate-200">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono tracking-wider font-bold text-indigo-700 uppercase">
                    Official ID Card Preview
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-sans">
                  Card size: CR-80 Standard (3.37" x 2.125") • High-resolution
                  ready
                </p>
              </div>

              {/* Double-sided Cards Deck */}
              <div
                className="space-y-6 flex flex-col items-center justify-center w-full"
                id="id-double-sides-deck"
              >
                {/* CARD FRONT SIDE - Premium Redesign */}
                <div
                  className="w-[360px] h-[225px] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-2xl p-5 relative overflow-hidden border border-indigo-500/30 select-none flex flex-col justify-between shrink-0 transition-all hover:shadow-3xl hover:scale-[1.02]"
                  id="id-card-front"
                >
                  {/* Premium Decorative Elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Top Header with Premium Logo */}
                  <div className="flex items-center gap-3 pb-3 border-b border-indigo-500/30 relative z-10">
                    {/* Enhanced SVG Logo */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-400/20 blur-md rounded-full" />
                      <svg
                        viewBox="0 0 100 100"
                        className="w-10 h-10 shrink-0 relative z-10"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="46"
                          fill="transparent"
                          stroke="url(#goldGradient)"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="41"
                          fill="#0F172A"
                          stroke="url(#goldGradient)"
                          strokeWidth="1"
                        />
                        <circle cx="50" cy="50" r="30" fill="#1E293B" />
                        <path
                          d="M35 55 C 42 50, 48 53, 50 55 C 52 53, 58 50, 65 55 L 65 42 C 58 37, 52 40, 50 42 C 48 40, 42 37, 35 42 Z"
                          fill="#FFFFFF"
                          stroke="url(#goldGradient)"
                          strokeWidth="1"
                        />
                        <line
                          x1="50"
                          y1="42"
                          x2="50"
                          y2="55"
                          stroke="url(#goldGradient)"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M 48 45 L 52 45 M 50 43 L 50 49"
                          stroke="#E11D48"
                          strokeWidth="1"
                        />
                        <text
                          x="50"
                          y="32"
                          fill="url(#goldGradient)"
                          fontSize="5.5"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          KJV BCCMi
                        </text>
                        <text
                          x="50"
                          y="66"
                          fill="#FFFFFF"
                          fontSize="4.5"
                          fontWeight="semibold"
                          textAnchor="middle"
                        >
                          1611
                        </text>
                        <defs>
                          <linearGradient
                            id="goldGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#D4AF37" />
                            <stop offset="50%" stopColor="#FFD700" />
                            <stop offset="100%" stopColor="#B8860B" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[10px] font-extrabold uppercase text-white tracking-tight leading-tight">
                        King James Version Bible Christian Church
                      </h4>
                      <p className="text-[7px] text-indigo-300 mt-0.5 leading-tight tracking-wider uppercase font-mono">
                        Ministries Inc. • SEC No. CN2011300373
                      </p>
                    </div>
                  </div>

                  {/* Core Details - Premium Layout */}
                  <div className="flex gap-4 pt-3 flex-grow relative z-10">
                    {/* User Profile Picture */}
                    <div className="shrink-0 flex flex-col items-center gap-1.5">
                      {selectedIdMember.profilePic ? (
                        <img
                          src={selectedIdMember.profilePic}
                          alt="Member"
                          className="w-[70px] h-[70px] bg-slate-800 border-2 border-gradient-to-r from-indigo-400 to-gold-400 rounded-xl object-cover shadow-lg"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-[70px] h-[70px] bg-gradient-to-br from-indigo-600 to-purple-600 border-2 border-indigo-400 rounded-xl flex items-center justify-center font-sans font-extrabold text-indigo-100 text-2xl shadow-lg">
                          {selectedIdMember.firstName?.[0]?.toUpperCase() ||
                            "U"}
                          {selectedIdMember.lastName?.[0]?.toUpperCase() || "S"}
                        </div>
                      )}
                      <span className="text-[7px] font-mono tracking-wider bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded-full uppercase font-bold">
                        ✓ Verified Member
                      </span>
                    </div>

                    {/* Member Details */}
                    <div className="flex-1 space-y-2 py-0.5">
                      <div>
                        <span className="text-[6.5px] text-indigo-300 font-mono tracking-wider font-semibold block uppercase">
                          Full Registered Name
                        </span>
                        <h5 className="text-[13px] font-extrabold text-white leading-tight tracking-tight mt-0.5">
                          {selectedIdMember.firstName}{" "}
                          {selectedIdMember.lastName}
                        </h5>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-indigo-500/30">
                        <div>
                          <span className="text-[6px] text-indigo-300 font-mono font-semibold block uppercase">
                            ID Credentials
                          </span>
                          <span className="text-[9px] font-mono font-bold text-white block mt-0.5 bg-indigo-950/50 px-1.5 py-0.5 rounded">
                            {selectedIdMember.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-[6px] text-indigo-300 font-mono font-semibold block uppercase">
                            Extension
                          </span>
                          <span className="text-[9px] font-sans font-medium text-white block mt-0.5 truncate">
                            {userData?.churches?.name || "Naga"} Branch
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[6px] text-indigo-300 font-mono font-semibold block uppercase">
                            Valid Since
                          </span>
                          <span className="text-[8.5px] font-mono font-medium text-white block mt-0.5">
                            {selectedIdMember.joinDate || "2024-01-01"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[6px] text-indigo-300 font-mono font-semibold block uppercase">
                            Role
                          </span>
                          <span className="text-[8.5px] font-mono font-bold text-gold-300 block mt-0.5 uppercase">
                            {selectedIdMember.role || "Member"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer with Signature Section */}
                  <div className="flex justify-between items-end border-t border-indigo-500/30 pt-2 mt-1 relative z-10">
                    <div className="text-[5.5px] text-indigo-300 font-mono uppercase tracking-wider">
                      Official Church Identification Pass (KJV BCCMI)
                    </div>

                    {/* Signature Canvas Area */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-32 h-8 bg-indigo-950/40 border border-indigo-600/50 hover:border-indigo-400 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-200 group">
                        {sigType === "typed" ? (
                          <span className="font-serif italic lowercase text-[11px] tracking-wide text-indigo-200 group-hover:text-indigo-100 transition">
                            {selectedIdMember.firstName?.toLowerCase()}{" "}
                            {selectedIdMember.lastName?.toLowerCase()} d.
                          </span>
                        ) : (
                          <canvas
                            ref={canvasRef}
                            width={128}
                            height={32}
                            onMouseDown={startSignDraw}
                            onMouseMove={drawSign}
                            onMouseUp={endSignDraw}
                            onMouseLeave={endSignDraw}
                            onTouchStart={startSignDraw}
                            onTouchMove={drawSign}
                            onTouchEnd={endSignDraw}
                            className="bg-indigo-950/20 hover:bg-indigo-950/40 cursor-crosshair w-full h-full transition"
                          />
                        )}
                        {sigType === "drawn" && !hasDrawnSig && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[6px] text-indigo-400 font-mono">
                              Sign here
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-[5.5px] text-indigo-300 font-mono uppercase tracking-wider mt-0.5">
                        Member Signature
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD BACK SIDE - Premium Redesign */}
                <div
                  className="w-[360px] h-[225px] bg-white text-slate-800 rounded-2xl shadow-2xl p-5 relative overflow-hidden border border-slate-200 select-none flex flex-col justify-between shrink-0 transition-all hover:shadow-3xl"
                  id="id-card-back"
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />

                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <Shield className="h-32 w-32" />
                  </div>

                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Shield className="h-3.5 w-3.5 text-white" />
                      </div>
                      <h5 className="text-[8px] font-mono font-bold text-indigo-700 uppercase tracking-wider">
                        TERMS & COVENANT CONDITIONS
                      </h5>
                    </div>

                    <p className="text-[6.5px] text-slate-600 leading-relaxed">
                      This digital identification key certifies that the bearer
                      is a fully-baptized and validated active member of the
                      King James Version Bible Christian Church and Ministries
                      Inc. congregation ecosystem.
                    </p>

                    <p className="text-[6.5px] text-slate-600 leading-relaxed">
                      Members pledge to faithfully walk together in brotherly
                      love, seek the spiritual progress of the assembly, sustain
                      its worship, ordinances, discipline, and contribute
                      cheerfully to expenditures.
                    </p>

                    <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                      <p className="text-[6px] text-slate-700 leading-relaxed">
                        <strong className="text-amber-800">If found:</strong>{" "}
                        Please return to Global Headquarters Office, Naga
                        Branch, Cebu City, Philippines.
                        <br />
                        <span className="font-mono text-[6px]">
                          Tel. (032) 489-3300 • helpdesk@kjvbccmi.org
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Officers Signatures and Barcode */}
                  <div className="flex justify-between items-end border-t border-slate-200 pt-3 relative z-10">
                    <div className="text-left">
                      <div className="h-7 flex items-end">
                        <span className="font-serif italic text-[10px] text-slate-600 border-b border-slate-300 pb-0.5">
                          {selectedIdMember.secretarySig || "Vengie Alterado"}
                        </span>
                      </div>
                      <div className="text-[5px] font-mono uppercase text-slate-400 tracking-wider mt-1">
                        Church Secretary
                      </div>
                    </div>

                    {/* Enhanced Barcode */}
                    <div className="flex flex-col items-center">
                      <div className="bg-white h-10 w-24 border border-slate-200 rounded-md flex items-center justify-center gap-0.5 px-1 shadow-inner">
                        {Array.from({ length: 20 }).map((_, i) => (
                          <div
                            key={i}
                            className={`bg-slate-800 w-${Math.floor(Math.random() * 3) + 1} h-${Math.floor(Math.random() * 6) + 4} opacity-80`}
                            style={{
                              width: `${Math.floor(Math.random() * 3) + 1}px`,
                              height: `${Math.floor(Math.random() * 6) + 4}px`,
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-[5px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                        ID: {selectedIdMember.id}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="h-7 flex items-end justify-end">
                        <span className="font-serif italic text-[10px] text-indigo-700 border-b border-indigo-300 pb-0.5">
                          {selectedIdMember.pastorSig || "Rey Siaboc"}
                        </span>
                      </div>
                      <div className="text-[5px] font-mono uppercase text-slate-400 tracking-wider mt-1">
                        Senior Pastor
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Controller Dashboard - Premium Config Panel */}
            <div className="w-full lg:w-80 p-6 flex flex-col justify-between space-y-6 bg-white no-print">
              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 px-2.5 py-1 rounded-lg mb-2">
                      <Printer className="h-3 w-3 text-white" />
                      <span className="text-[8px] font-mono font-bold text-white uppercase tracking-wider">
                        Identity Engine
                      </span>
                    </div>
                    <h3 className="font-sans font-black text-slate-900 text-lg uppercase tracking-tight">
                      ID Parameters
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Configure card settings
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIdMember(null);
                      setHasDrawnSig(false);
                      setIsSignActive(false);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Configuration Options */}
                <div className="space-y-5 border-t border-slate-100 pt-5">
                  {/* Signature Method Selection */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <PenTool className="h-3 w-3" />
                      1. Member Signature Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSigType("typed")}
                        className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                          sigType === "typed"
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25"
                            : "bg-white border-2 border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                        }`}
                      >
                        📝 Typed (Cursive)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSigType("drawn")}
                        className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                          sigType === "drawn"
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25"
                            : "bg-white border-2 border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                        }`}
                      >
                        ✍️ Draw (Manual)
                      </button>
                    </div>
                  </div>

                  {/* Manual Signature Instructions */}
                  {sigType === "drawn" && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 space-y-2 animate-in slide-in-from-top duration-200">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-amber-100 flex items-center justify-center">
                          <PenTool className="h-3 w-3 text-amber-700" />
                        </div>
                        <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-amber-800">
                          Signature Pad
                        </span>
                      </div>
                      <p className="text-[9px] text-amber-700 leading-relaxed">
                        Click and drag inside the{" "}
                        <strong>"Member Signature"</strong> box on the ID card
                        preview to draw your signature.
                      </p>
                      <button
                        type="button"
                        onClick={clearSignCanvas}
                        className="w-full py-2 bg-amber-100 hover:bg-amber-200 font-bold text-amber-900 text-[9px] rounded-lg transition-all duration-200 text-center uppercase tracking-wide cursor-pointer"
                      >
                        🗑️ Reset / Clear Drawing
                      </button>
                    </div>
                  )}

                  {/* Officer Signatures Section */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <Users className="h-3 w-3" />
                      2. Officer Signatures (Optional)
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Secretary Name"
                        value={selectedIdMember.secretarySig || ""}
                        onChange={(e) =>
                          setSelectedIdMember({
                            ...selectedIdMember,
                            secretarySig: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Pastor Name"
                        value={selectedIdMember.pastorSig || ""}
                        onChange={(e) =>
                          setSelectedIdMember({
                            ...selectedIdMember,
                            pastorSig: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  {/* Print Instructions */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <Printer className="h-3 w-3" />
                      3. Print Specifications
                    </label>
                    <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                      <p className="text-[9px] text-slate-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        Use PVC card printer or glossy paper (CR-80)
                      </p>
                      <p className="text-[9px] text-slate-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        Select "Actual Size" in print dialog
                      </p>
                      <p className="text-[9px] text-slate-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        Enable "Background Graphics" option
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIdMember(null);
                    setHasDrawnSig(false);
                    setIsSignActive(false);
                  }}
                  className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer uppercase tracking-wide"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print ID Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
