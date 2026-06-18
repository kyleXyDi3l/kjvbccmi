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
  LayoutDashboard,
  NotebookPen,
  BookOpen,
  Menu,
  Bell,
  Home,
  Clock,
  Star,
  Clipboard,
  File,
  Download,
  Eye,
  RefreshCw,
  AlertCircle,
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

// Allowed statuses for secretary
const SECRETARY_STATUSES = [9, 10]; // 9 = For Data Input, 10 = For Review
const EDITABLE_STATUSES = [9, 13]; // 9 = For Data Input, 13 = Rejected in Review

export default function SecretaryDashBoard({ userData, session }) {
  const [activeTab, setActiveTab] = useState("registry");
  const [successMemo, setSuccessMemo] = useState("");
  const [errorMemo, setErrorMemo] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  //Loading State
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 1. Managing Active/Edit Member Form State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  // Custom states added for Printable ID & Pagination
  const [selectedIdMember, setSelectedIdMember] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Signature drawing pad states & helper ref
  const canvasRef = useRef(null);

  const [sigType, setSigType] = useState("typed");
  const [hasDrawnSig, setHasDrawnSig] = useState(false);
  const [isSignActive, setIsSignActive] = useState(false);

  //For Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("joinDate");

  const [statusOptions, setStatusOptions] = useState([]);

  // Meeting Notes
  const [meetingNotes, setMeetingNotes] = useState([]);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    summary: "",
    actionItems: "",
    attendees: "",
  });

  // Events
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("2026-06-15");
  const [eventTime, setEventTime] = useState("17:00");
  const [ministryType, setMinistryType] = useState("General");

  // Rejection modal
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingMember, setRejectingMember] = useState(null);

  // Drawing signature pad event callbacks
  const startSignDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#c7d2fe";
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

  const [photoFile, setPhotoFile] = useState(null);

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
    statusId: 1, // Default to "For Data Input"
    joinDate: "",
    notes: "",
    profilePic: "",
    formPdfUrl: "",
  });

  const resetMember = () => {
    setNewMember({
      id: "",
      firstName: "",
      lastName: "",
      emailAdd: "",
      phoneNumber: "",
      birthDate: "",
      churchID: userData.churches.id,
      statusId: 9,
      joinDate: new Date().toISOString().split("T")[0],
      notes: "",
      profilePic: "",
      formPdfUrl: "",
    });
    setPdfFile(null);
    setPdfPreviewUrl(null);
  };

  // Check if member can be set to "For Review"
  const canSetForReview = (member) => {
    return [
      member.firstName,
      member.lastName,
      member.emailAdd,
      member.phoneNumber,
      member.birthDate,
      member.formPdfUrl,
    ].every(field =>
      field !== null &&
      field !== undefined &&
      (typeof field !== "string" || field.trim() !== "")
    );
  };

  // Upload PDF to Supabase Storage
  const uploadPdf = async (file, memberId) => {
    if (!file) return null;
    
    setUploadingPdf(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${memberId}_${Date.now()}.${fileExt}`;
    const filePath = `member-forms/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("member-forms")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading PDF:", uploadError);
      setErrorMemo("Failed to upload PDF file");
      setUploadingPdf(false);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("member-forms")
      .getPublicUrl(filePath);

    setUploadingPdf(false);
    return publicUrl;
  };

  // Handle PDF file selection
  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setErrorMemo("Please select a PDF file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMemo("Please select a PDF file under 5MB");
        return;
      }
      setPdfFile(file);
      setPdfPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Remove PDF
  const removePdf = () => {
    setPdfFile(null);
    setPdfPreviewUrl(null);
    setNewMember({ ...newMember, formPdfUrl: "" });
  };

  useEffect(() => {
    const channel = supabase
      .channel("members-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "members" },
        (payload) => {
          const newMember = payload.new;
          setMembers((prevMembers) => [newMember, ...prevMembers]);
        },
      )
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
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "members" },
        (payload) => {
          const deletedMemberId = payload.old;
          setMembers((prevMembers) =>
            prevMembers.filter((prevMembers) => prevMembers.id !== deletedMemberId.id),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchStatuses();
    fetchEvents();
    fetchMeetingNotes();
  }, []);

  const fetchMembers = async () => {
    setIsDataLoading(true);

    const { data, error } = await supabase
      .from("members")
      .select(`
        *,
        churches(id, name),
        members_status!inner(id,status)
      `)
      .eq("churchID", userData.churches.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching members:", error.message);
      setErrorMemo("Failed to load members");
    } else {
      const transformedMembers = data.map(member => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        emailAdd: member.emailAdd,
        phoneNumber: member.phoneNumber,
        birthDate: member.birthDate,
        joinDate: member.joinDate,
        notes: member.notes,
        profilePic: member.profilePic,
        role: member.role,
        churchId: member.churchID,
        churchName: member.churches?.name,
        statusId: member.statusId,
        status: member.members_status?.status,
        formPdfUrl: member.formPdfUrl,
        reviewNotes: member.reviewNotes,
        rejectedReason: member.rejectedReason,
        createdAt: member.created_at,
        createdBy: member.createdBy,
      }));
      setMembers(transformedMembers);
      console.log("fetchMembers", transformedMembers);
    }
    setIsDataLoading(false);
  };

  // Fetch statuses for filter dropdown
  const fetchStatuses = async () => {
    const { data, error } = await supabase
      .from("members_status")
      .select("*")
      .order("id");

    if (!error && data) {
      setStatusOptions(data);
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("churchID", userData.churches.id)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error.message);
    } else {
      setEvents(data || []);
    }
  };

  const fetchMeetingNotes = async () => {
    const { data, error } = await supabase
      .from("meeting_notes")
      .select("*")
      .eq("churchID", userData.churches.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching meeting notes:", error.message);
    } else {
      setMeetingNotes(data || []);
    }
  };

  const triggerAddMember = () => {
    setEditingMember(null);
    resetMember();
    setShowMemberModal(true);
  };

  const triggerEditMember = (m) => {
    // Check if member is editable (For Data Input or Rejected in Review)
    if (!EDITABLE_STATUSES.includes(m.statusId)) {
      setErrorMemo(`Cannot edit member with status: ${m.status}. Only members in "For Data Input" or "Rejected in Review" status can be edited.`);
      setTimeout(() => setErrorMemo(""), 3000);
      return;
    }

    setEditingMember(m);
    setNewMember({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      emailAdd: m.emailAdd,
      phoneNumber: m.phoneNumber,
      birthDate: m.birthDate,
      churchID: userData.churches.id,
      statusId: m.statusId,
      joinDate: m.joinDate,
      notes: m.notes,
      profilePic: m.profilePic,
      formPdfUrl: m.formPdfUrl || "",
    });
    if (m.formPdfUrl) {
      setPdfPreviewUrl(m.formPdfUrl);
    }
    setShowMemberModal(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    let profileImgUrl = newMember.profilePic;
    let pdfUrl = newMember.formPdfUrl;

    if (photoFile) {
      profileImgUrl = await uploadImage(photoFile);
    }

    if (pdfFile) {
      const tempId = editingMember?.id || `temp_${Date.now()}`;
      pdfUrl = await uploadPdf(pdfFile, tempId);
    }

    if (!editingMember) {
        console.log("New member Data", newMember);


      if (newMember.statusId == 10 && !canSetForReview(newMember)) {
            setErrorMemo("Cannot set to For Review. Please ensure all fields are filled and application form is attached.");
            //setShowMemberModal(false);
            //setTimeout(() => setErrorMemo(""), 3000);
            return;
          }

      const memberData = {
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        emailAdd: newMember.emailAdd,
        phoneNumber: newMember.phoneNumber,
        birthDate: newMember.birthDate,
        joinDate: newMember.joinDate || new Date().toISOString().split("T")[0],
        notes: newMember.notes,
        profilePic: profileImgUrl,
        formPdfUrl: pdfUrl,
        statusId: newMember.statusId,
        churchID: userData.churches.id,
        createdBy: session.user.id,
      };

      const { error } = await supabase.from("members").insert([memberData]);
      if (error) {
        console.error("Error adding new Member:", error.message);
        setErrorMemo(error.message);
        return;
      }
      setSuccessMemo(`Successfully registered new member ${newMember.firstName} ${newMember.lastName}.`);
    } else {

        if (newMember.statusId == 10 && !canSetForReview(newMember)) {
        setErrorMemo("Cannot set to For Review. Please ensure all fields are filled and application form is attached.");
        //setShowMemberModal(false);
        //setTimeout(() => setErrorMemo(""), 3000);
        return;
      }

      const updates = {
        firstName: newMember.firstName,
        lastName: newMember.lastName,
        emailAdd: newMember.emailAdd,
        phoneNumber: newMember.phoneNumber,
        birthDate: newMember.birthDate,
        joinDate: newMember.joinDate,
        notes: newMember.notes,
        profilePic: profileImgUrl,
        formPdfUrl: pdfUrl,
        statusId: newMember.statusId,
      };


      const { error } = await supabase
        .from("members")
        .update(updates)
        .eq("id", editingMember.id);

      if (error) {
        console.error("Error editing member:", error.message);
        setErrorMemo(error.message);
        return;
      }
      setSuccessMemo(`Successfully updated registry files for ${newMember.firstName} ${newMember.lastName}.`);
    }

    resetMember();
    setShowMemberModal(false);
    //fetchMembers();
    setTimeout(() => setSuccessMemo(""), 4500);
  };

  // Handle setting member to "For Review"
  const handleSetForReview = async (member) => {
    if (!canSetForReview(member)) {
      setErrorMemo("Cannot set to For Review. Please ensure all fields are filled and application form is attached.");
      setTimeout(() => setErrorMemo(""), 3000);
      return;
    }

    const { error } = await supabase
      .from("members")
      .update({ statusId: 10 }) // 2 = For Review
      .eq("id", member.id);

    if (error) {
      setErrorMemo(error.message);
    } else {
      setSuccessMemo(`${member.firstName} ${member.lastName} has been submitted for review.`);
      fetchMembers();
    }
    setTimeout(() => setSuccessMemo(""), 3000);
  };

  // Show rejection modal
  const handleRejectMember = (member) => {
    setRejectingMember(member);
    setRejectionReason("");
    setShowRejectionModal(true);
  };

  // Submit rejection
  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      setErrorMemo("Please provide a reason for rejection");
      return;
    }

    const { error } = await supabase
      .from("members")
      .update({ 
        status: 5, // 5 = Rejected in Review
        rejectedReason: rejectionReason,
        reviewedBy: session.user.id,
        reviewedAt: new Date().toISOString(),
      })
      .eq("id", rejectingMember.id);

    if (error) {
      setErrorMemo(error.message);
    } else {
      setSuccessMemo(`Application for ${rejectingMember.firstName} ${rejectingMember.lastName} has been rejected.`);
      fetchMembers();
      setShowRejectionModal(false);
    }
    setTimeout(() => setSuccessMemo(""), 3000);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const eventData = {
      title: eventTitle,
      description: eventDesc,
      date: eventDate,
      time: eventTime,
      ministryType: ministryType,
      churchID: userData.churches.id,
      createdBy: session.user.id,
    };

    const { error } = await supabase.from("events").insert(eventData);
    if (error) {
      console.error("Error adding event:", error.message);
      setErrorMemo(error.message);
    } else {
      setSuccessMemo("Event scheduled successfully!");
      fetchEvents();
      setShowEventModal(false);
      setEventTitle("");
      setEventDesc("");
      setEventDate("2026-06-15");
      setEventTime("17:00");
      setMinistryType("General");
    }
    setTimeout(() => setSuccessMemo(""), 3000);
  };

  const handleDeleteEvent = async (eventId) => {
    if (confirm("Are you sure you want to delete this event?")) {
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) {
        console.error("Error deleting event:", error.message);
        setErrorMemo(error.message);
      } else {
        setSuccessMemo("Event deleted successfully!");
        fetchEvents();
      }
      setTimeout(() => setSuccessMemo(""), 3000);
    }
  };

  const handleSaveMeeting = async (e) => {
    e.preventDefault();
    const meetingData = {
      title: newMeeting.title,
      date: newMeeting.date,
      summary: newMeeting.summary,
      actionItems: newMeeting.actionItems,
      attendees: newMeeting.attendees,
      churchID: userData.churches.id,
      createdBy: session.user.id,
    };

    if (editingMeeting) {
      const { error } = await supabase
        .from("meeting_notes")
        .update(meetingData)
        .eq("id", editingMeeting.id);
      if (error) {
        console.error("Error updating meeting note:", error.message);
        setErrorMemo(error.message);
      } else {
        setSuccessMemo("Meeting note updated successfully!");
      }
    } else {
      const { error } = await supabase.from("meeting_notes").insert(meetingData);
      if (error) {
        console.error("Error adding meeting note:", error.message);
        setErrorMemo(error.message);
      } else {
        setSuccessMemo("Meeting note added successfully!");
      }
    }
    fetchMeetingNotes();
    setShowMeetingModal(false);
    setEditingMeeting(null);
    setNewMeeting({
      title: "",
      date: new Date().toISOString().split("T")[0],
      summary: "",
      actionItems: "",
      attendees: "",
    });
    setTimeout(() => setSuccessMemo(""), 3000);
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (confirm("Are you sure you want to delete this meeting note?")) {
      const { error } = await supabase.from("meeting_notes").delete().eq("id", meetingId);
      if (error) {
        console.error("Error deleting meeting note:", error.message);
        setErrorMemo(error.message);
      } else {
        setSuccessMemo("Meeting note deleted successfully!");
        fetchMeetingNotes();
      }
      setTimeout(() => setSuccessMemo(""), 3000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMemo("Please select an image file under 2MB.");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setNewMember({ ...newMember, profilePic: reader.result });
          setSuccessMemo('Custom profile picture uploaded. Click "Save Profile Changes" below to sync.');
          setTimeout(() => setSuccessMemo(""), 5000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const filePath = `${file.name}-${Date.now()}`;
    const { error } = await supabase.storage.from("members-pic").upload(filePath, file);
    if (error) {
      console.log("Error uploading Image:", error.message);
      return null;
    }
    const { data } = await supabase.storage.from("profile-pic").getPublicUrl(filePath);
    return data.publicUrl;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  const phoneNumberChangeHandler = (e) => {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.startsWith("639")) {
      digits = "09" + digits.slice(3);
    }
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }
    setNewMember({ ...newMember, phoneNumber: digits });
    const plainDigits = digits.replace(/-/g, "");
    if (plainDigits.length !== 11 && plainDigits.length > 0) {
      setErrorMemo("Phone number must be exactly 11 digits.");
    } else {
      setErrorMemo("");
    }
  };

  const filteredMembers = useMemo(() => {
    let filtered = [...members];
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((m) => {
        const phoneNumberStr = m.phoneNumber ? String(m.phoneNumber) : "";
        return (
          m.firstName?.toLowerCase().includes(searchLower) ||
          m.lastName?.toLowerCase().includes(searchLower) ||
          m.emailAdd?.toLowerCase().includes(searchLower) ||
          m.id?.toString().toLowerCase().includes(searchLower) ||
          phoneNumberStr.toLowerCase().includes(searchLower)
        );
      });
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter((m) => m.statusId === parseInt(statusFilter));
    }
    filtered.sort((a, b) => {
      if (sortBy === "joinDate") {
        return new Date(b.joinDate) - new Date(a.joinDate);
      } else if (sortBy === "name") {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortBy === "status") {
        return (a.status || "").localeCompare(b.status || "");
      }
      return 0;
    });
    return filtered;
  }, [members, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  
  const paginatedMembers = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(offset, offset + itemsPerPage);
  }, [filteredMembers, currentPage]);

  const navigationItems = [
    { id: "registry", icon: Users, label: "Member Files" },
    { id: "scheduler", icon: Calendar, label: "Calendar Events" },
    { id: "meetingNotes", icon: NotebookPen, label: "Meeting Notes" },
  ];

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
    <div className="flex min-h-screen bg-slate-50">
      {/* LEFT SIDEBAR NAVIGATION */}
      <div className={`${sidebarCollapsed ? "w-20" : "w-64"} shrink-0 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30 transition-all duration-300`}>
        <div className="flex-1 py-6 px-4">
          <div className="space-y-1">
            <div className="pb-3 mb-3 border-b border-slate-100 px-2 flex items-center justify-between">
              <span className={`text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider ${sidebarCollapsed ? "hidden" : "block"}`}>
                Menu Console
              </span>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <Menu className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group relative w-full flex items-center gap-3 px-4 py-3 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${activeTab === item.id ? "text-white" : "text-slate-400"}`} />
                <span className={`flex-1 text-left ${sidebarCollapsed ? "hidden" : "block"}`}>
                  {item.label}
                </span>
                {activeTab === item.id && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                )}
              </button>
            ))}
          </div>



          <div className="absolute bottom-6 left-4 right-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-700 ${sidebarCollapsed ? "hidden" : "block"}`}>
                  Clerk Access
                </span>
              </div>
              <p className={`text-[9px] text-slate-500 leading-tight ${sidebarCollapsed ? "hidden" : "block"}`}>
                Authorized to manage {userData?.churches?.name} members.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className={`flex-1 ${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}>
        {successMemo && (
          <div className="mx-6 mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>{successMemo}</span>
          </div>
        )}
        {/* {errorMemo && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span>{errorMemo}</span>
          </div>
        )} */}

        <main className="p-6">
          
          {/* VIEW 1: MEMBERS REGISTRY */}
          {activeTab === "registry" && (
            <div className="space-y-6">
              {/* Header Banner - Keep your existing banner */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950/30 text-white rounded-2xl p-6 md:p-8 border border-slate-700/50 overflow-hidden shadow-xl">
                {/* ... existing banner content ... */}
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Member Registry Workspace</span>
                        </span>
                      </div>
                      <div className="h-3 w-px bg-slate-600 hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-sans">Localized Context:</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {userData.churches.name || ""} Extension Only
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
                      Member Registry &{" "}
                      <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Profile Management
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
                      Add, edit, and manage congregation member profiles, track membership status, and maintain accurate church records.
                    </p>
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
                        <span className="text-[10px] text-slate-300">Member Database</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center">
                          <Shield className="h-3 w-3 text-sky-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">Secure Records</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Member Registry Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-sm font-sans font-extrabold text-slate-800 uppercase tracking-wider">Congregation Registry</h2>
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">SECURE MODE</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans ml-10">
                        Clerks are authorized to alter records strictly within the bounds of the{" "}
                        <span className="font-bold text-indigo-600">{userData?.churches?.name || "Naga"}</span> Church.
                      </p>
                    </div>
                    <button
                      onClick={triggerAddMember}
                      className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 shrink-0 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <UserPlus className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                      <span>Add New Member</span>
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
                        placeholder="Search by name, email, ID, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 hover:bg-white transition"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                      >
                        <option value="All">All Status</option>
                        {statusOptions.map((status) => (
                          <option key={status.id} value={status.id}>{status.status}</option>
                        ))}
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                      >
                        <option value="joinDate">Sort by: Join Date (Newest)</option>
                        <option value="name">Sort by: Name (A-Z)</option>
                        <option value="status">Sort by: Status</option>
                      </select>
                    </div>
                  </div>
                  {searchTerm && (
                    <div className="mt-2 text-xs text-slate-500">
                      Found {filteredMembers.length} result{filteredMembers.length !== 1 ? "s" : ""} for "{searchTerm}"
                    </div>
                  )}
                </div>

                {/* Members Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-mono font-bold uppercase tracking-wider border-b-2 border-slate-200">
                        <th className="p-4">Ref ID</th>
                        <th className="p-4">Member</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Birthday</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Form</th>
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
                                {searchTerm ? `No members found matching "${searchTerm}"` : `No members registered yet.`}
                              </p>
                              {!searchTerm && (
                                <button onClick={triggerAddMember} className="mt-2 text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1">
                                  <UserPlus className="h-3.5 w-3.5" />
                                  Add your first member
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedMembers.map((m, idx) => (
                          <tr key={m.id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-200 group">
                            <td className="p-4">
                              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                {idx + 1 + (currentPage - 1) * itemsPerPage}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {m.profilePic ? (
                                  <img src={m.profilePic} alt={`${m.firstName}`} className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                    {m.firstName?.[0] || "U"}{m.lastName?.[0] || "s"}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-slate-800">{m.firstName} {m.lastName}</div>
                                  <div className="text-[10px] text-slate-400 font-mono">{m.emailAdd}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span className="font-mono text-[11px] text-slate-600">{m.phoneNumber || "N/A"}</span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                <span className="font-mono text-[11px] text-slate-600">{m.birthDate || "Not set"}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold font-mono uppercase shadow-sm ${
                                m.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                                m.status === "For Review" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                m.status === "Rejected in Review" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                                "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  m.status === "Active" ? "bg-emerald-500 animate-pulse" :
                                  m.status === "For Review" ? "bg-amber-500" :
                                  m.status === "Rejected in Review" ? "bg-rose-500" : "bg-slate-400"
                                }`} />
                                {m.status}
                              </span>
                              {m.rejectedReason && (
                                <div className="mt-1 text-[8px] text-rose-500 italic">{m.rejectedReason}</div>
                              )}
                            </td>
                            <td className="p-4">
                              {m.formPdfUrl ? (
                                <a href={m.formPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800">
                                  <File className="h-4 w-4" />
                                  <span className="text-[10px]">View Form</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[10px]">No form</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => triggerEditMember(m)}
                                  disabled={!EDITABLE_STATUSES.includes(m.statusId)}
                                  className={`group/edit inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all duration-200 ${
                                    EDITABLE_STATUSES.includes(m.statusId)
                                      ? "bg-slate-100 hover:bg-slate-800 text-slate-600 hover:text-white"
                                      : "bg-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                                  }`}
                                  title={!EDITABLE_STATUSES.includes(m.statusId) ? `Cannot edit member with status: ${m.status}` : "Edit Member"}
                                >
                                  <Edit2 className="h-3 w-3" />
                                  <span>Edit</span>
                                </button>
                                {m.statusId === 9 && m.formPdfUrl && (
                                  <button
                                    onClick={() => handleSetForReview(m)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-600 text-amber-700 hover:text-white rounded-lg text-[10px] font-semibold transition-all duration-200"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    <span>For Review</span>
                                  </button>
                                )}
                                {m.statusId === 13 && (
                                  <button
                                    onClick={() => handleSetForReview(m)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg text-[10px] font-semibold transition-all duration-200"
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                    <span>Resubmit</span>
                                  </button>
                                )}
                                {m.statusId === 14 && (
                                <button
                                  onClick={() => setSelectedIdMember(m)}
                                  className="group/print inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer shadow-sm hover:shadow"
                                  title="Generate & View Printable Member ID"
                                >
                                  <Printer className="h-3 w-3 group-hover/print:scale-110 transition-transform" />
                                  <span>ID Card</span>
                                </button>
                                )}
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
                  <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Users className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                        <p className="text-xs text-slate-600 font-sans">
                          Showing{" "}
                          <span className="font-extrabold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                          <span className="font-extrabold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredMembers.length)}</span> of{" "}
                          <span className="font-extrabold text-indigo-600">{filteredMembers.length}</span> registered members
                          {searchTerm && <span className="text-slate-400"> (filtered)</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center rounded-l-xl px-3 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="ml-1 text-xs font-medium hidden sm:inline">Previous</span>
                        </button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) pageNum = i + 1;
                          else if (currentPage <= 3) pageNum = i + 1;
                          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                          else pageNum = currentPage - 2 + i;
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
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center rounded-r-xl px-3 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <span className="mr-1 text-xs font-medium hidden sm:inline">Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

         {/* VIEW 2: CALENDAR EVENTS */}
          {activeTab === "scheduler" && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950/30 text-white rounded-2xl p-6 md:p-8 border border-slate-700/50 overflow-hidden shadow-xl">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-sky-500 blur-3xl" />
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-emerald-500 blur-3xl" />
                </div>
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
                  <Calendar className="h-64 w-64 translate-x-20 -translate-y-10" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-500/30 text-sky-300 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                          <Calendar className="h-3 w-3" />
                          <span>Event Management Workspace</span>
                        </span>
                      </div>
                      <div className="h-3 w-px bg-slate-600 hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-sans">
                          Localized Context:
                        </span>
                        <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md">
                          {userData.churches.name || ""} Extension Only
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
                      Event Calendar &{" "}
                      <span className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                        Ministry Scheduler
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
                      Schedule church services, coordinate ministry events, and manage calendar updates for the congregation.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                        </div>
                        <span className="text-[10px] text-slate-300">Live Sync</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Calendar className="h-3 w-3 text-blue-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">Event Planning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <Users className="h-3 w-3 text-teal-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">Ministry Coordination</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Events Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-sky-600" />
                        Chapel Calendar Events & Ministry Promos
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Schedule services and manage church events
                      </p>
                    </div>
                    <button
                      onClick={() => setShowEventModal(true)}
                      className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition shrink-0 flex items-center gap-2 shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      Schedule New Event
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {events.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      No events scheduled yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {events.map((event) => (
                        <div key={event.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-10 w-10 rounded-lg bg-sky-100 flex flex-col items-center justify-center">
                                  <span className="text-lg font-bold text-sky-600">
                                    {new Date(event.date).getDate()}
                                  </span>
                                  <span className="text-[8px] text-sky-500">
                                    {new Date(event.date).toLocaleString("default", { month: "short" })}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-800">{event.title}</h3>
                                  <p className="text-xs text-slate-500">{event.time} • {event.ministryType}</p>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600">{event.description}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: MEETING NOTES */}
          {activeTab === "meetingNotes" && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950/30 text-white rounded-2xl p-6 md:p-8 border border-slate-700/50 overflow-hidden shadow-xl">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500 blur-3xl" />
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-500 blur-3xl" />
                </div>
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
                  <NotebookPen className="h-64 w-64 translate-x-20 -translate-y-10" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                          <NotebookPen className="h-3 w-3" />
                          <span>Meeting Documentation Workspace</span>
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
                    <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
                      Meeting Notes &{" "}
                      <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Minutes Archive
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
                      Document meeting minutes, track action items, and maintain organized records of church leadership discussions.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <span className="text-[10px] text-slate-300">Live Sync</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <NotebookPen className="h-3 w-3 text-teal-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">Minutes Archive</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <Clipboard className="h-3 w-3 text-amber-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">Action Items</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meeting Notes Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <NotebookPen className="h-5 w-5 text-emerald-600" />
                        Meeting Notes & Minutes
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Document and track meeting minutes and action items
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMeetingModal(true)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition shrink-0 flex items-center gap-2 shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      Add Meeting Note
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {meetingNotes.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      No meeting notes yet
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {meetingNotes.map((note) => (
                        <div key={note.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                  <NotebookPen className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-800">{note.title}</h3>
                                  <p className="text-xs text-slate-400">{note.date}</p>
                                </div>
                              </div>
                              {note.summary && (
                                <p className="text-sm text-slate-600 mt-2">{note.summary.substring(0, 150)}</p>
                              )}
                              {note.actionItems && (
                                <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                                  <p className="text-xs font-semibold text-amber-700">Action Items:</p>
                                  <p className="text-xs text-amber-600">{note.actionItems.substring(0, 100)}</p>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteMeeting(note.id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MEMBER REGISTRATION MODAL - Updated with PDF upload */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col my-8 animate-in zoom-in-95 duration-300">
            <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2 border border-emerald-500/30">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-mono uppercase font-bold text-emerald-300 tracking-wider">DATABASE TRANSACTION</span>
                  </div>
                  <h3 className="font-sans font-bold text-white text-lg tracking-tight">
                    {editingMember ? `Update Profile: ${newMember.firstName || ""} ${newMember.lastName || ""}` : "Add New Member Profile Record"}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {editingMember ? "Edit member information securely" : "Register a new member to the congregation"}
                  </p>
                </div>
                <button onClick={() => setShowMemberModal(false)} className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

                {/* Error Message Display INSIDE Modal */}
              {errorMemo && (
                <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>{errorMemo}</span>
                  <button 
                    onClick={() => setErrorMemo("")} 
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Success Message Display INSIDE Modal */}
              {/* {successMemo && (
                <div className="mx-6 mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>{successMemo}</span>
                  <button 
                    onClick={() => setSuccessMemo("")} 
                    className="ml-auto text-emerald-500 hover:text-emerald-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}            */}

            <form onSubmit={handleSaveMember} className="p-6 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar">
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
                      onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                      placeholder="Enter first name"
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
                      onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                      placeholder="Enter last name"
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
                      onChange={(e) => setNewMember({ ...newMember, emailAdd: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                      placeholder="member@church.org"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={newMember.phoneNumber}
                      onChange={phoneNumberChangeHandler}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                      placeholder="+63 9xx xxx xxxx"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Status */}
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
                      onChange={(e) => setNewMember({ ...newMember, birthDate: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
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
                      onChange={(e) => setNewMember({ ...newMember, joinDate: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Affiliated Extension & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Affiliated Extension
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={userData?.churches?.name || "Naga"}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-100 text-slate-600 font-semibold cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Status
                  </label>
                  <select
                    value={newMember.statusId}
                    onChange={(e) => setNewMember({ ...newMember, statusId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer transition-all"
                  >
                    {statusOptions
                      .filter(s => SECRETARY_STATUSES.includes(s.id))
                      .map((status) => (
                        <option key={status.id} value={status.id}>{status.status}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Notes / Favorite Verse
                </label>
                <textarea
                  value={newMember.notes}
                  onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[80px] bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white resize-none"
                  placeholder="Insert notes, Favorite verse, or special concerns..."
                />
              </div>

              {/* Profile Photo Section */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <Image className="h-3.5 w-3.5" />
                  Member Profile Photo
                </label>
                <div className="flex gap-4 items-start">
                  <div className="shrink-0">
                    {newMember.profilePic ? (
                      <img src={newMember.profilePic} alt="Preview" className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-200 shadow-md" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-200 flex items-center justify-center shadow-md">
                        <Image className="h-6 w-6 text-indigo-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="https://example.com/photo.jpg or paste image URL"
                      value={newMember.profilePic}
                      onChange={(e) => setNewMember({ ...newMember, profilePic: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] text-slate-500 font-medium">Quick presets:</span>
                      {MOCK_AVATAR_PRESETS.map((avatar, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewMember({ ...newMember, profilePic: avatar.url })}
                          className="group relative text-[9px] bg-slate-100 hover:bg-indigo-100 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-700 px-2 py-1 rounded-lg transition-all duration-200 cursor-pointer"
                        >
                          {avatar.label}
                        </button>
                      ))}
                      <label className="flex items-center gap-1 text-[9px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-1 rounded-lg cursor-pointer hover:bg-indigo-100 transition-all duration-200 font-medium">
                        <Upload className="h-2.5 w-2.5" />
                        <span>Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* PDF Application Form Upload Section */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <File className="h-3.5 w-3.5" />
                  Application Form (PDF)
                  {newMember.statusId === 2 && <span className="text-rose-500 ml-1">* Required for For Review</span>}
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-400 transition-all">
                  {pdfPreviewUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <File className="h-8 w-8 text-indigo-600" />
                          <span className="text-sm text-slate-600 truncate max-w-[200px]">
                            {pdfFile ? pdfFile.name : "Application Form.pdf"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <a href={pdfPreviewUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                            <Eye className="h-4 w-4" />
                          </a>
                          <button type="button" onClick={removePdf} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfChange} />
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-slate-400" />
                        <span className="text-sm text-slate-500">Click to upload or drag and drop</span>
                        <span className="text-xs text-slate-400">PDF files only, max 5MB</span>
                      </div>
                    </label>
                  )}
                </div>
                {newMember.statusId === 2 && !newMember.formPdfUrl && !pdfFile && (
                  <p className="text-[10px] text-rose-500">Application form is required for "For Review" status</p>
                )}
              </div>
            </form>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button type="button" onClick={() => setShowMemberModal(false)} className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer uppercase tracking-wide">
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSaveMember}
                disabled={uploadingPdf}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide disabled:opacity-50"
              >
                {uploadingPdf ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>{editingMember ? "Save Changes" : "Register Member"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-rose-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Reject Application</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Please provide a reason for rejecting {rejectingMember?.firstName} {rejectingMember?.lastName}'s application.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none mb-4"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3">
              <button onClick={() => setShowRejectionModal(false)} className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={submitRejection} className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">Schedule Event</h2>
              <button onClick={() => setShowEventModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEvent} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Event Title *</label>
                <input type="text" required value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Description</label>
                <textarea value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} rows="3" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Date *</label>
                  <input type="date" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Time</label>
                  <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Ministry Type</label>
                <select value={ministryType} onChange={(e) => setMinistryType(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                  <option value="General">General</option>
                  <option value="Youth">Youth</option>
                  <option value="Worship">Worship</option>
                  <option value="Outreach">Outreach</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowEventModal(false)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold">Schedule Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEETING NOTES MODAL */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">Add Meeting Note</h2>
              <button onClick={() => setShowMeetingModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMeeting} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Meeting Title *</label>
                <input type="text" required value={newMeeting.title} onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Date</label>
                <input type="date" value={newMeeting.date} onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Attendees</label>
                <input type="text" value={newMeeting.attendees} onChange={(e) => setNewMeeting({ ...newMeeting, attendees: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="Names" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Summary</label>
                <textarea value={newMeeting.summary} onChange={(e) => setNewMeeting({ ...newMeeting, summary: e.target.value })} rows="4" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Action Items</label>
                <textarea value={newMeeting.actionItems} onChange={(e) => setNewMeeting({ ...newMeeting, actionItems: e.target.value })} rows="3" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowMeetingModal(false)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold">Save Meeting Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE ID MODAL */}
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