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
  ShieldCheck,
  Mail,
  Phone,
  CalendarDays,
  Key,
  HeartPulse,
  Printer,
  ChevronLeft,
  ChevronRight,
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
            prevPosts.filter((posts) => posts.id !== deletedMemberId.id),
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
    const { data, error } = await supabase
      .from("members")
      .select(`*, churches(id, name)`)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching members:", error.message);
      return;
    }
    setMembers(data);
    console.log("Fetched members:", data);
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
      digits,
    });
    // setPhoneNumber();

    // Validation: must be exactly 11 digits (ignoring dashes)
    const plainDigits = digits.replace(/-/g, "");
    if (plainDigits.length !== 11) {
      setErrorMsg("Phone number must be exactly 11 digits.");
    } else {
      setErrorMsg("");
    }
  };

  return (
    <div className="space-y-6" id="secretary-dashboard-view">
      {/* Header Info */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>Location Clerk Authority</span>
            </span>
            <span className="text-xs text-slate-400 font-sans">
              | Localized Context:{" "}
              <strong>
                {/* {currentExtension}  */}
                Extension
              </strong>{" "}
              Only
            </span>
          </div>
          <h1 className="text-2xl font-sans font-bold tracking-tight">
            Registry & Event Scheduler Workspace
          </h1>
          <p className="text-xs text-slate-400 font-sans">
            Add/edit local member profiles, coordinate local ministry cohorts,
            and publish calendar updates with interactive media.
          </p>
        </div>

        {/* View Toggle tabs */}
        <div className="bg-slate-800 p-1 rounded-lg flex gap-1 border border-slate-700 shrink-0">
          <button
            onClick={() => setActiveTab("registry")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold font-sans tracking-wide transition ${activeTab === "registry" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"}`}
          >
            Member Files
            {/* ({filteredMembers.length}) */}
          </button>
          <button
            //onClick={() => setActiveTab("scheduler")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold font-sans tracking-wide transition ${activeTab === "scheduler" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"}`}
            id="scheduler-tab-btn"
          >
            Calendar Events
            {/* ({filteredEvents.length}) */}
          </button>
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
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
          id="member-registry-panel"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Users className="h-4.5 w-4.5 text-indigo-600" />
                <span>Congregation Registry (Secure Mode)</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-sans">
                Clerks are authorized to alter records strictly within the
                bounds of the {userData.churches.name} Church.
              </p>
            </div>

            <button
              onClick={triggerAddMember}
              id="add-member-trigger"
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-3.5 py-1.8 rounded-lg transition shrink-0 flex items-center gap-1.5 shadow"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Member Profile</span>
            </button>
          </div>

          {/* Members Desktop List */}
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-mono font-semibold border-b border-slate-200">
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Birthday</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Membership Dates</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* filteredMembers.length */}
                {paginatedMembers === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-slate-400 italic font-sans"
                    >
                      No members registered under the
                      {userData.churches.name}
                      chapel database.
                    </td>
                  </tr>
                ) : (
                  paginatedMembers.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50 text-slate-700 select-none"
                    >
                      <td className="p-3 font-mono text-[10px] text-slate-500">
                        {m.id}
                      </td>
                      <td className="p-3 font-semibold font-sans">
                        <div className="flex items-center gap-2">
                          {m.profilePic ? (
                            <img
                              src={m.profilePic}
                              alt={`${m.firstName}`}
                              className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-[10px] text-indigo-700 font-bold">
                              {m.firstName[0]}
                              {m.lastName[0]}
                            </div>
                          )}
                          <span>
                            {m.firstName} {m.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-sans font-medium">
                        {m.emailAdd}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {m.phoneNumber || "N/A"}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {m.birthDate}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold font-mono uppercase border ${
                            m.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : m.status === "Inactive"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] font-sans">
                        Joined: {m.joinDate}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedIdMember(m)}
                            className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 transition px-2.5 py-1.5 rounded text-[11px] font-bold cursor-pointer"
                            id={`print-id-btn-${m.id}`}
                            title="Generate & View Printable Member ID"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            <span>Printable ID</span>
                          </button>
                          <button
                            onClick={() =>
                              triggerEditMember({
                                ...m,
                                churchName: userData.churches.name,
                              })
                            }
                            className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-900 hover:text-white transition px-2.5 py-1.5 rounded text-[11px] font-semibold text-slate-700"
                            id={`edit-btn-${m.id}`}
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Edit Info</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-xs">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-750 hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-750 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-slate-650 font-sans">
                    Showing{" "}
                    <span className="font-bold text-slate-900">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-slate-900">
                      {Math.min(currentPage * itemsPerPage, members.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-slate-900">
                      {members.length}
                    </span>{" "}
                    members
                  </p>
                </div>
                <div>
                  <nav
                    className="isolate inline-flex -space-x-px rounded-md shadow-2xs"
                    aria-label="Pagination"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 border border-slate-300 bg-white hover:bg-slate-50 focus:z-20 disabled:opacity-50 cursor-pointer text-xs"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`relative z-10 inline-flex items-center px-3 py-2 text-xs font-bold focus:z-20 border ${
                            currentPage === page
                              ? "bg-indigo-600 text-white border-indigo-600 focus-visible:outline-indigo-600"
                              : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                          } cursor-pointer`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 border border-slate-300 bg-white hover:bg-slate-50 focus:z-20 disabled:opacity-50 cursor-pointer text-xs"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          id="member-profile-modal"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col my-8">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono uppercase bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded block w-fit mb-1 font-bold">
                  DATABASE TRANSACTION
                </span>
                <h3 className="font-sans font-semibold text-sm">
                  {editingMember
                    ? `Registry Update: ${newMember.firstName} ${newMember.lastName}`
                    : "Add New Member Profile Record"}
                </h3>
              </div>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveMember}
              className="p-5 space-y-3.5 overflow-y-auto max-h-[70vh]"
              id="member-file-form"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.firstName}
                    onChange={(e) =>
                      setNewMember({ ...newMember, firstName: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                    placeholder="Enter first name"
                    id="mem-input-fname"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMember.lastName}
                    onChange={(e) =>
                      setNewMember({ ...newMember, lastName: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                    placeholder="Enter last name"
                    id="mem-input-lname"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newMember.emailAdd}
                    onChange={(e) =>
                      setNewMember({ ...newMember, emailAdd: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                    placeholder="member@email.com"
                    id="mem-input-email"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newMember.phoneNumber}
                    onChange={phoneNumberChangeHandler}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                    placeholder="+63 9xx xxx xxxx"
                    id="mem-input-phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={newMember.birthDate}
                    onChange={(e) =>
                      setNewMember({ ...newMember, birthDate: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                    id="mem-input-birthday"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Affiliated Extension *
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={userData.churches.name}
                    className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded-lg p-2 text-xs focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Membership Status
                  </label>
                  <select
                    value={newMember.status}
                    onChange={(e) =>
                      setNewMember({ ...newMember, status: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                    id="mem-input-status"
                  >
                    <option value="Active">Active Participant</option>
                    <option value="Inactive">Inactive Fellow</option>
                    <option value="Outreach">Outreach Contact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Join Date (First Visited)
                  </label>
                  <input
                    type="date"
                    value={newMember.joinDate}
                    onChange={(e) =>
                      setNewMember({ ...newMember, joinDate: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                    id="mem-input-joindate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Notes / Care Records
                </label>
                <textarea
                  value={newMember.notes}
                  onChange={(e) =>
                    setNewMember({ ...newMember, notes: e.target.value })
                  }
                  className="w-full border border-slate-300 p-2 text-xs rounded-lg min-h-[60px] bg-white text-slate-800 focus:outline-none"
                  placeholder="Insert pastoral notes, prayer request highlights or cell group references..."
                  id="mem-input-notes"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Member Profile Photo
                </label>
                <div className="flex gap-3 items-center">
                  {newMember.profilePic ? (
                    <img
                      src={newMember.profilePic}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover border border-indigo-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
                      <FileImage className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/... or paste image URL"
                      value={newMember.profilePic}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          profilePic: e.target.value,
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                      id="mem-input-photo-url"
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1 items-center">
                      <span className="text-[9px] text-slate-500 font-medium shrink-0">
                        Presets:
                      </span>
                      {MOCK_AVATAR_PRESETS.map((avatar, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) =>
                            setNewMember({
                              ...newMember,
                              profilePic: avatar.url,
                            })
                          }
                          className="text-[9px] bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded transition cursor-pointer shrink-0"
                        >
                          {avatar.label}
                        </button>
                      ))}
                      <label className="text-[9px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-indigo-100 transition flex items-center gap-1 font-semibold shrink-0">
                        <Upload className="h-2.5 w-2.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                          // onChange={(e) => {
                          //   const file = e.target.files?.[0];
                          //   if (file) {
                          //     const reader = new FileReader();
                          //     reader.onload = (event) => {
                          //       if (event.target?.result) {
                          //         setNewMember({
                          //           ...newMember,
                          //           profilePic: event.target.result,
                          //         });
                          //       }
                          //     };
                          //     reader.readAsDataURL(file);
                          //   }
                          // }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="flex-1 py-1.8 border text-slate-600 font-semibold border-slate-300 hover:bg-slate-50 text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="mem-submit-btn"
                  className="flex-1 py-1.8 bg-slate-900 text-white font-semibold hover:bg-slate-850 text-xs rounded-lg transition flex items-center justify-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    {editingMember
                      ? "Save Modifications"
                      : "Save and File Profile"}
                  </span>
                </button>
              </div>
            </form>
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
                    value={currentExtension}
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
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto"
          id="printable-id-modal"
        >
          {/* Dynamic Style block to isolate the ID card when physical printing is initiated */}
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
          `}</style>

          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col md:flex-row my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Left: The Printable Card View Screen */}
            <div
              className="flex-1 bg-slate-50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200"
              id="printable-id-card-frame"
            >
              <div className="text-center mb-4 no-print">
                <span className="text-[10px] font-mono tracking-wider font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">
                  Official ID card preview
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-sans">
                  Card size is prepared for absolute CR-80 standard
                  specifications (3.37" x 2.125").
                </p>
              </div>

              {/* TWO SIDED CARDS DECK */}
              <div
                className="space-y-6 flex flex-col items-center justify-center w-full"
                id="id-double-sides-deck"
              >
                {/* CARD FRONT SIDE */}
                <div
                  className="w-[340px] h-[215px] bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl shadow-xl p-4.5 relative overflow-hidden border border-slate-700 select-none flex flex-col justify-between shrink-0"
                  id="id-card-front"
                >
                  {/* Decorative corner ambient glow */}
                  <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="absolute left-0 bottom-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

                  {/* Top Header Row with SVG KJV logo */}
                  <div className="flex items-center gap-2 pb-2 border-b border-indigo-500/20">
                    <svg viewBox="0 0 100 100" className="w-9 h-9 shrink-0">
                      <circle
                        cx="50"
                        cy="50"
                        r="46"
                        fill="transparent"
                        stroke="#D4AF37"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="41"
                        fill="#0F172A"
                        stroke="#D4AF37"
                        strokeWidth="1"
                      />
                      <circle cx="50" cy="50" r="30" fill="#1E293B" />
                      <path
                        d="M35 55 C 42 50, 48 53, 50 55 C 52 53, 58 50, 65 55 L 65 42 C 58 37, 52 40, 50 42 C 48 40, 42 37, 35 42 Z"
                        fill="#FFFFFF"
                        stroke="#D4AF37"
                        strokeWidth="1"
                      />
                      <line
                        x1="50"
                        y1="42"
                        x2="50"
                        y2="55"
                        stroke="#D4AF37"
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
                        fill="#D4AF37"
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
                    </svg>
                    <div className="text-left font-sans flex-1 min-w-0">
                      <h4 className="text-[9.5px] font-extrabold uppercase text-white tracking-tight leading-none">
                        King James Version Bible Christian Church
                      </h4>
                      <p className="text-[7.5px] text-indigo-200 mt-0.5 leading-tight tracking-wider uppercase font-mono">
                        Ministries Inc. • SEC No. CN2011300373
                      </p>
                    </div>
                  </div>

                  {/* Core Details Row */}
                  <div className="flex gap-3.5 pt-2 flex-grow">
                    {/* User profile pic */}
                    <div className="shrink-0 flex flex-col items-center justify-start gap-1">
                      {selectedIdMember.profilePic ? (
                        <img
                          src={selectedIdMember.profilePic}
                          alt="Member"
                          className="w-[66px] h-[66px] bg-slate-800 border-2 border-indigo-400 rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-[66px] h-[66px] bg-indigo-950 border-2 border-indigo-400 rounded-lg flex items-center justify-center font-sans font-extrabold text-indigo-300 text-lg">
                          {selectedIdMember.firstName[0].toUpperCase()}
                          {selectedIdMember.lastName
                            ? selectedIdMember.lastName[0].toUpperCase()
                            : ""}
                        </div>
                      )}
                      {/* Membership active tag */}
                      <span className="text-[6.5px] font-mono tracking-widest bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded-full uppercase font-bold text-center">
                        Verified
                      </span>
                    </div>

                    {/* Member properties description lists */}
                    <div className="flex-1 text-left space-y-1 py-0.5 font-sans min-w-0">
                      <div className="leading-none select-text">
                        <span className="text-[6.5px] text-indigo-300 font-mono tracking-wider font-semibold block leading-none uppercase">
                          Full Registered Name
                        </span>
                        <h5 className="text-[12.5px] font-extrabold text-white leading-tight font-sans tracking-tight truncate mt-0.5">
                          {selectedIdMember.firstName}{" "}
                          {selectedIdMember.lastName}
                        </h5>
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-1 border-t border-indigo-950 leading-none select-text">
                        <div>
                          <span className="text-[6.5px] text-indigo-300 font-mono font-semibold block leading-none uppercase">
                            ID Credentials
                          </span>
                          <span className="text-[9.5px] font-mono font-bold text-white block mt-0.5">
                            {selectedIdMember.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-[6.5px] text-indigo-300 font-mono font-semibold block leading-none uppercase">
                            Extension
                          </span>
                          <span className="text-[9.5px] font-sans font-medium text-white block mt-0.5 truncate">
                            {userData.churches.name} Branch
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-1 leading-none select-text">
                        <div>
                          <span className="text-[6.5px] text-indigo-300 font-mono font-semibold block leading-none uppercase">
                            Valid Registry
                          </span>
                          <span className="text-[9px] font-mono font-medium text-white block mt-0.5">
                            {selectedIdMember.joinDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-[6.5px] text-indigo-300 font-mono font-semibold block leading-none uppercase">
                            Role Status
                          </span>
                          <span className="text-[9px] font-mono font-bold text-indigo-200 block mt-0.5 uppercase">
                            {selectedIdMember.role || "Member"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ID card front footer containing signature pad */}
                  <div className="flex justify-between items-end border-t border-indigo-950 pt-1.5 leading-none">
                    <div className="text-[5.5px] text-indigo-300 font-mono uppercase tracking-widest text-left">
                      Official Church Identification Pass (KJV BCCMI)
                    </div>

                    {/* Visual Signature slot context */}
                    <div className="flex flex-col items-center">
                      <div className="relative w-28 h-6.5 bg-indigo-950/60 border border-indigo-900 hover:border-indigo-400 rounded flex items-center justify-center overflow-hidden transition">
                        {sigType === "typed" ? (
                          <span className="font-serif italic lowercase text-[10px] tracking-wide text-indigo-200 underline">
                            {selectedIdMember.firstName.toLowerCase()}{" "}
                            {selectedIdMember.lastName.toLowerCase()} d.
                          </span>
                        ) : (
                          // Renders interactive whiteboard pad for drawn signature
                          <canvas
                            ref={canvasRef}
                            width={112}
                            height={26}
                            onMouseDown={startSignDraw}
                            onMouseMove={drawSign}
                            onMouseUp={endSignDraw}
                            onMouseLeave={endSignDraw}
                            onTouchStart={startSignDraw}
                            onTouchMove={drawSign}
                            onTouchEnd={endSignDraw}
                            className="bg-indigo-950/5 hover:bg-white/10 cursor-crosshair h-full w-full"
                          />
                        )}
                      </div>
                      <span className="text-[5.5px] text-indigo-300 font-mono uppercase tracking-widest mt-0.5">
                        Holder Signature
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD BACK SIDE */}
                <div
                  className="w-[340px] h-[215px] bg-white text-slate-800 rounded-2xl shadow-xl p-4.5 relative overflow-hidden border border-slate-300 select-none flex flex-col justify-between shrink-0"
                  id="id-card-back"
                >
                  <div className="space-y-2 text-left font-sans">
                    <h5 className="text-[7.5px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                      TERMS & COVENANT CONDITIONS
                    </h5>
                    <p className="text-[6.5px] text-slate-500 leading-tight">
                      This digital identification key certifies that the bearer
                      is a fully-baptized and validated active member of the
                      King James Version Bible Christian Church and Ministries
                      Inc. congregation ecosystem.
                    </p>
                    <p className="text-[6.5px] text-slate-500 leading-tight">
                      Members pledge to faithfully walk together in brotherly
                      love, seek the spiritual progress of the assembly, sustain
                      its worship, ordinances, discipline, and contribute
                      cheerfully to expenditures.
                    </p>
                    <p className="text-[6.5px] text-slate-500 leading-tight">
                      If lost or discovered in public spaces, please return
                      coordinates immediately to:
                      <strong className="block text-slate-800 font-mono text-[7px] mt-0.5">
                        Global Headquarters Office, Naga Branch, Cebu City,
                        Philippines. (Tel. 032-489-3300)
                      </strong>
                    </p>
                  </div>

                  {/* Officers signatures and official seal representation */}
                  <div
                    className="flex justify-between items-end border-t border-slate-100 pt-3 relative"
                    id="officers-signature-deck"
                  >
                    <div className="text-left font-sans">
                      <div className="h-6 flex items-baseline">
                        <span className="font-serif italic text-[11px] text-slate-800 leading-none">
                          {/* Junel Diel */}
                        </span>
                      </div>
                      <div className="text-[5.5px] font-mono uppercase text-slate-400 tracking-wider font-extrabold leading-none">
                        {/* Secretary Signature */}
                      </div>
                    </div>

                    {/* Simulating QR/Bar-code for high fidelity verification pass */}
                    <div className="flex flex-col items-center">
                      <div className="bg-slate-105 w-16 h-4 border border-slate-205 rounded flex gap-0.5 px-1 py-0.5 items-center justify-around select-none">
                        <div className="bg-slate-900 w-0.5 h-full opacity-90" />
                        <div className="bg-slate-900 w-1.5 h-full opacity-90" />
                        <div className="bg-slate-900 w-0.5 h-full opacity-90" />
                        <div className="bg-slate-950 w-2.5 h-full" />
                        <div className="bg-slate-900 w-1 h-full opacity-90" />
                        <div className="bg-slate-900 w-0.5 h-full opacity-90" />
                        <div className="bg-slate-950 w-2 h-full" />
                        <div className="bg-slate-900 w-0.5 h-full opacity-90" />
                      </div>
                      <span className="text-[5.5px] font-mono text-slate-400 mt-1 uppercase tracking-widest">
                        {selectedIdMember.id}
                      </span>
                    </div>

                    <div className="text-right font-sans">
                      <div className="h-6 flex items-baseline justify-end">
                        <span className="font-serif italic text-[11px] text-indigo-700 leading-none">
                          {/* Pastor J. Diel */}
                        </span>
                      </div>
                      <div className="text-[5.5px] font-mono uppercase text-slate-400 tracking-wider font-extrabold leading-none">
                        {/* Pastor Signature */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Controller Dashboard Config Panel (Print Option) */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between space-y-6 bg-white no-print">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase block w-fit mb-1">
                      Identity Engine
                    </span>
                    <h3 className="font-sans font-black text-slate-900 leading-tight text-base uppercase">
                      ID Parameters
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIdMember(null);
                      setHasDrawnSig(false);
                      setIsSignActive(false);
                    }}
                    className="p-1 px-2.2 text-slate-450 hover:text-slate-800 font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Configurations parameters */}
                <div className="space-y-5 mt-6 border-t border-slate-100 pt-5 text-xs text-slate-750 font-sans">
                  {/* Select Signature Method */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-mono tracking-wider font-bold text-slate-500 uppercase">
                      1. Member Signature Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSigType("typed")}
                        className={`py-2 px-3 border text-xs font-bold rounded-xl transition cursor-pointer text-center ${
                          sigType === "typed"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white border-slate-350 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        Typed (Cursive)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSigType("drawn")}
                        className={`py-2 px-3 border text-xs font-bold rounded-xl transition cursor-pointer text-center ${
                          sigType === "drawn"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white border-slate-350 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        Draw (Manual)
                      </button>
                    </div>
                  </div>

                  {/* Signature manual canvas draw desk */}
                  {sigType === "drawn" && (
                    <div
                      className="bg-amber-50/60 border border-amber-200/80 p-3 rounded-xl space-y-1.5 text-left"
                      id="drawn-signature-control-desk"
                    >
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-800 leading-none">
                        Whiteboard Signature Pad
                      </span>
                      <p className="text-[9px] text-amber-700 leading-tight">
                        Use mouse cursor or contact touch screen directly inside
                        the <strong>"Holder Signature"</strong> slot inside the
                        credit card preview box to verify and record.
                      </p>

                      <button
                        type="button"
                        onClick={clearSignCanvas}
                        className="w-full py-1.5 bg-amber-100 font-bold text-amber-950 font-sans text-[10px] rounded hover:bg-amber-200 transition text-center focus:outline-none uppercase tracking-wide cursor-pointer"
                      >
                        Reset/Erase Drawing
                      </button>
                    </div>
                  )}

                  <div
                    className="space-y-2 block"
                    id="printer-friendly-instructions"
                  >
                    <span className="block text-[11px] font-mono tracking-wider font-bold text-slate-500 uppercase">
                      2. Print Alignment Specs
                    </span>
                    <ul className="space-y-1.5 list-disc pl-4 text-[10px] text-slate-500 leading-relaxed">
                      <li>
                        Use standard <strong>PVC card printers</strong> or
                        high-gloss matte thick paper (CR-80 size).
                      </li>
                      <li>
                        Select <strong>100% or "Actual Size"</strong> scaling in
                        browser print parameters.
                      </li>
                      <li>
                        Enable <strong>"Background graphics"</strong> to print
                        the custom Indigo gradients.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Print action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedIdMember(null);
                    setHasDrawnSig(false);
                    setIsSignActive(false);
                  }}
                  className="flex-1 py-3 border text-slate-600 border-slate-300 font-bold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer text-center uppercase tracking-wide"
                >
                  Close Console
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print ID Voucher</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
