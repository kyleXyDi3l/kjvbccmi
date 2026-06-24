import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "../supabase-client";

// Reusable Components
import LoadingSpinner from "./shared/LoadingSpinner";
import SuccessMessage from "./shared/SuccessMessage";
import ErrorMessage from "./shared/ErrorMessage";
import PrintableIDCard from "./shared/PrintableIDCard";
import PrintableBaptismalCertificate from "./shared/PrintableBaptismalCertificate";
import SecretarySidebar from "./Secretary/SecretarySidebar";
import MemberSearchBar from "./Secretary/MemberSearchBar";
import MemberFilters from "./Secretary/MemberFilters";
import PaginationControls from "./Secretary/PaginationControls";
import DeleteConfirmationModal from "./Secretary/DeleteConfirmationModal";
import RejectionModal from "./Secretary/RejectionModal";
import EventModal from "./Secretary/EventModal";
import MeetingNoteModal from "./Secretary/MeetingNoteModal";

// Icons
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
  Mail,
  Phone,
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
  NotebookPen,
  Menu,
  File,
  Eye,
  RefreshCw,
  AlertCircle,
  ShieldAlert,
  Cross,
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

const SECRETARY_STATUSES = [9, 10];
const EDITABLE_STATUSES = [9, 13];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SecretaryDashBoard({ userData, session }) {
  // --- State ---
  const [activeTab, setActiveTab] = useState("registry");
  const [successMemo, setSuccessMemo] = useState("");
  const [errorMemo, setErrorMemo] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Member Data
  const [members, setMembers] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  // Baptismal Certificate Modal State
  const [selectedBaptismalMember, setSelectedBaptismalMember] = useState(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("joinDate");

  // Member Modal
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [newMember, setNewMember] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    emailAdd: "",
    phoneNumber: "",
    birthDate: "",
    churchID: userData?.churches?.id || "",
    statusId: 9,
    joinDate: new Date().toISOString().split("T")[0],
    notes: "",
    profilePic: "",
    formPdfUrl: "",
    baptisedDate: "",
    signature_url: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rejection Modal
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingMember, setRejectingMember] = useState(null);

  // Events
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [ministryType, setMinistryType] = useState("General");

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

  // Printable ID
  const [selectedIdMember, setSelectedIdMember] = useState(null);

  // Signature Canvas
  const canvasRef = useRef(null);
  const [sigType, setSigType] = useState("typed");
  const [hasDrawnSig, setHasDrawnSig] = useState(false);
  const [isSignActive, setIsSignActive] = useState(false);

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
  const resetMember = () => {
    setNewMember({
      firstName: "",
      middleName: "",
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
      baptisedDate: "",
      signature_url: "",
    });
    setPdfFile(null);
    setPdfPreviewUrl(null);
    setSignatureFile(null);
    setSignaturePreviewUrl(null);
    setPhotoFile(null);
  };

  const canSetForReview = (member) => {
    return [
      member.firstName,
      member.lastName,
      member.emailAdd,
      member.phoneNumber,
      member.birthDate,
      member.formPdfUrl,
      member.baptisedDate,
      member.signature_url,
    ].every(
      (f) =>
        f !== null &&
        f !== undefined &&
        (typeof f !== "string" || f.trim() !== ""),
    );
  };

  // Validation function for member data
  const validateMemberData = (memberData, isEditing = false) => {
    const errors = [];

    console.log("memberData:", memberData);

    // 1. Required Field Validations
    if (!memberData.firstName || memberData.firstName.trim() === "") {
      errors.push("First name is required");
    } else if (memberData.firstName.length < 2) {
      errors.push("First name must be at least 2 characters");
    } else if (memberData.firstName.length > 50) {
      errors.push("First name must not exceed 50 characters");
    }

    if (!memberData.lastName || memberData.lastName.trim() === "") {
      errors.push("Last name is required");
    } else if (memberData.lastName.length < 2) {
      errors.push("Last name must be at least 2 characters");
    } else if (memberData.lastName.length > 50) {
      errors.push("Last name must not exceed 50 characters");
    }

    if (!memberData.emailAdd || memberData.emailAdd.trim() === "") {
      errors.push("Email address is required");
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(memberData.emailAdd)) {
        errors.push("Please enter a valid email address");
      }
    }

    // if (!memberData.phoneNumber) {
    //   errors.push("Phone number is required");
    // } else {
    //   // Phone number validation (Philippine format)
    //   const phoneStr = String(memberData.phoneNumber).replace(/\D/g, "");
    //   if (phoneStr.length !== 11) {
    //     errors.push(
    //       "Phone number must be exactly 11 digits (e.g., 09XXXXXXXXX)",
    //     );
    //   }
    //   if (!phoneStr.startsWith("09")) {
    //     errors.push("Phone number must start with '09'");
    //   }
    // }

    if (!memberData.birthDate) {
      errors.push("Date of birth is required");
    } else {
      // Check if birth date is in the future
      const birthDate = new Date(memberData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        errors.push("Date of birth cannot be in the future");
      }
      // Check if person is at least 1 year old
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 1) {
        errors.push("Member must be at least 1 year old");
      }
      if (age > 120) {
        errors.push("Please check the birth date");
      }
    }

    // 2. Baptised Date Validation (if provided)
    if (memberData.baptisedDate) {
      const baptisedDate = new Date(memberData.baptisedDate);
      const today = new Date();
      if (baptisedDate > today) {
        errors.push("Baptised date cannot be in the future");
      }
      // Check if baptised date is after birth date
      if (memberData.birthDate) {
        const birthDate = new Date(memberData.birthDate);
        if (baptisedDate < birthDate) {
          errors.push("Baptised date cannot be before birth date");
        }
      }
    }

    // 3. Status-specific validations
    if (memberData.statusId === 10) {
      // For Review
      if (!memberData.formPdfUrl || memberData.formPdfUrl.trim() === "") {
        errors.push(
          "Application form (PDF) is required for 'For Review' status",
        );
      }
      if (!memberData.baptisedDate) {
        errors.push("Baptised date is required for 'For Review' status");
      }
      if (!memberData.signature_url || memberData.signature_url.trim() === "") {
        errors.push("Member signature is required for 'For Review' status");
      }
    }

    // 4. Image/Signature validation
    if (memberData.profilePic && memberData.profilePic.trim() !== "") {
      // Check if it's a valid URL
      try {
        new URL(memberData.profilePic);
      } catch {
        // Allow data URLs for images
        if (!memberData.profilePic.startsWith("data:image/")) {
          errors.push("Profile picture must be a valid URL or image data");
        }
      }
    }

    if (memberData.signature_url && memberData.signature_url.trim() !== "") {
      // Check if signature is a valid URL from storage
      if (
        !memberData.signature_url.startsWith("data:image/") &&
        !memberData.signature_url.startsWith("http")
      ) {
        errors.push("Signature must be a valid image URL");
      }
    }

    // 5. Character limits for text fields
    if (memberData.notes && memberData.notes.length > 500) {
      errors.push("Notes must not exceed 500 characters");
    }

    if (memberData.middleName && memberData.middleName.length > 50) {
      errors.push("Middle name must not exceed 50 characters");
    }

    // 6. Check for duplicate email (if editing, exclude current member)
    // This should be done asynchronously, so we'll handle it separately

    return errors;
  };

  // Async validation for duplicate email
  const validateDuplicateEmail = async (email, excludeId = null) => {
    try {
      let query = supabase
        .from("members")
        .select("id, emailAdd")
        .eq("emailAdd", email);

      if (excludeId) {
        query = query.neq("id", excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error checking duplicate email:", error);
        return { isValid: true, error: null };
      }

      if (data && data.length > 0) {
        return {
          isValid: false,
          error: "Email address is already registered to another member",
        };
      }

      return { isValid: true, error: null };
    } catch (err) {
      console.error("Error in email validation:", err);
      return { isValid: true, error: null };
    }
  };

  // Main validation function that combines all validations
  const validateMember = async (memberData, isEditing = false) => {
    // 1. Run synchronous validations
    const syncErrors = validateMemberData(memberData, isEditing);
    if (syncErrors.length > 0) {
      return { isValid: false, errors: syncErrors };
    }

    // 2. Run async validations (e.g., duplicate email check)
    const emailCheck = await validateDuplicateEmail(
      memberData.emailAdd,
      isEditing ? memberData.id : null,
    );

    if (!emailCheck.isValid) {
      return { isValid: false, errors: [emailCheck.error] };
    }

    return { isValid: true, errors: [] };
  };

  // Upload PDF to Supabase Storage
  const uploadPdf = async (file, memberId) => {
    if (!file) return null;

    setUploadingPdf(true);
    const fileExt = file.name.split(".").pop();
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

    const {
      data: { publicUrl },
    } = supabase.storage.from("member-forms").getPublicUrl(filePath);

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

  const getEnrichedMember = async (memberId) => {
    const { data, error } = await supabase
      .from("members")
      .select(`*, churches(id, name), members_status(id, status)`)
      .eq("id", memberId)
      .single();

    if (error) return null;

    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      emailAdd: data.emailAdd,
      phoneNumber: data.phoneNumber,
      birthDate: data.birthDate,
      joinDate: data.joinDate,
      notes: data.notes,
      profilePic: data.profilePic,
      role: data.role,
      churchId: data.churchID,
      churchName: data.churches?.name,
      statusId: data.statusId,
      status: data.members_status?.status,
      formPdfUrl: data.formPdfUrl,
      reviewNotes: data.review_notes,
      rejectedReason: data.rejected_reason,
      reviewedBy: data.reviewed_by,
      reviewedAt: data.reviewed_at,
      middleName: data.middleName,
      baptisedDate: data.baptisedDate,
      signature_url: data.signature_url,
      created_at: data.created_at,
    };
  };

  // ============================================================
  // DATA FETCHING
  // ============================================================
  const fetchMembers = async () => {
    setIsDataLoading(true);
    const { data, error } = await supabase
      .from("members")
      .select(`*, churches(id, name), members_status!inner(id,status)`)
      .eq("churchID", userData.churches.id)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMemo("Failed to load members");
    } else {
      const transformed = data.map((m) => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        emailAdd: m.emailAdd,
        phoneNumber: m.phoneNumber,
        birthDate: m.birthDate,
        joinDate: m.joinDate,
        notes: m.notes,
        profilePic: m.profilePic,
        role: m.role,
        churchId: m.churchID,
        churchName: m.churches?.name,
        statusId: m.statusId,
        status: m.members_status?.status,
        formPdfUrl: m.formPdfUrl,
        review_notes: m.review_notes,
        rejected_reason: m.rejected_reason,
        reviewed_by: m.reviewed_by,
        reviewed_at: m.reviewed_at,
        middleName: m.middleName,
        baptisedDate: m.baptisedDate,
        signature_url: m.signature_url,
        created_at: m.created_at,
      }));
      setMembers(transformed);
    }
    setIsDataLoading(false);
  };

  const fetchStatuses = async () => {
    const { data } = await supabase
      .from("members_status")
      .select("*")
      .order("id");
    if (data) setStatusOptions(data);
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("churchID", userData.churches.id)
      .order("date", { ascending: true });
    if (data) setEvents(data || []);
  };

  const fetchMeetingNotes = async () => {
    const { data } = await supabase
      .from("meeting_notes")
      .select("*")
      .eq("churchID", userData.churches.id)
      .order("date", { ascending: false });
    if (data) setMeetingNotes(data || []);
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    const channel = supabase
      .channel("members-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "members" },
        async (payload) => {
          const enriched = await getEnrichedMember(payload.new.id);
          if (enriched)
            setMembers((prev) =>
              prev.some((m) => m.id === enriched.id)
                ? prev
                : [enriched, ...prev],
            );
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "members" },
        async (payload) => {
          const enriched = await getEnrichedMember(payload.new.id);
          if (enriched)
            setMembers((prev) =>
              prev.map((m) => (m.id === enriched.id ? enriched : m)),
            );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "members" },
        (payload) => {
          setMembers((prev) => prev.filter((m) => m.id !== payload.old.id));
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchStatuses();
    fetchEvents();
    fetchMeetingNotes();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // ============================================================
  // COMPUTED VALUES
  // ============================================================
  const filteredMembers = useMemo(() => {
    let filtered = [...members];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((m) => {
        const phone = m.phoneNumber ? String(m.phoneNumber) : "";
        return (
          m.firstName?.toLowerCase().includes(term) ||
          m.lastName?.toLowerCase().includes(term) ||
          m.emailAdd?.toLowerCase().includes(term) ||
          m.id?.toString().toLowerCase().includes(term) ||
          phone.toLowerCase().includes(term)
        );
      });
    }
    if (statusFilter !== "All") {
      filtered = filtered.filter((m) => m.statusId === parseInt(statusFilter));
    }
    filtered.sort((a, b) => {
      if (sortBy === "joinDate")
        return new Date(b.joinDate) - new Date(a.joinDate);
      if (sortBy === "name")
        return `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        );
      if (sortBy === "status")
        return (a.status || "").localeCompare(b.status || "");
      return 0;
    });
    return filtered;
  }, [members, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(offset, offset + itemsPerPage);
  }, [filteredMembers, currentPage]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const phoneNumberChangeHandler = (e) => {
    let digits = e.target.value.replace(/\D/g, "");
    if (digits.startsWith("639")) digits = "09" + digits.slice(3);
    if (digits.length > 11) digits = digits.slice(0, 11);
    setNewMember({ ...newMember, phoneNumber: digits });
    const plain = digits.replace(/-/g, "");
    if (plain.length !== 11 && plain.length > 0) {
      setErrorMemo("Phone number must be exactly 11 digits.");
    } else {
      setErrorMemo("");
    }
  };

  const triggerAddMember = () => {
    setEditingMember(null);
    resetMember();
    setShowMemberModal(true);
  };

  const triggerEditMember = (m) => {
    if (!EDITABLE_STATUSES.includes(m.statusId)) {
      setErrorMemo(`Cannot edit member with status: ${m.status}.`);
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
      baptisedDate: m.baptisedDate,
      middleName: m.middleName,
      profilePic: m.profilePic,
      formPdfUrl: m.formPdfUrl || "",
      signature_url: m.signature_url || "",
      review_notes: m.review_notes,
      rejected_reason: m.rejected_reason,
      reviewed_by: m.reviewed_by,
      reviewed_at: m.reviewed_at,
    });
    if (m.formPdfUrl) setPdfPreviewUrl(m.formPdfUrl);
    if (m.signature_url) setSignaturePreviewUrl(m.signature_url);
    setShowMemberModal(true);
  };

  const openDeleteModal = (member) => {
    if (![9, 13].includes(member.statusId)) {
      setErrorMemo(`Cannot delete member with status: ${member.status}.`);
      setTimeout(() => setErrorMemo(""), 3000);
      return;
    }
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      // Delete PDF
      if (memberToDelete.formPdfUrl) {
        const path = memberToDelete.formPdfUrl.split("/").pop();
        if (path)
          await supabase.storage
            .from("member-forms")
            .remove([`member-forms/${path}`]);
      }
      // Delete Signature
      if (memberToDelete.signature_url) {
        const path = memberToDelete.signature_url.split("/").pop();
        if (path)
          await supabase.storage
            .from("member-signatures")
            .remove([`member-signatures/${path}`]);
      }
      // Delete record
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", memberToDelete.id);
      if (error) throw error;
      setSuccessMemo(
        `${memberToDelete.firstName} ${memberToDelete.lastName} deleted successfully.`,
      );
      fetchMembers();
    } catch (err) {
      setErrorMemo("Failed to delete member.");
    }
    setIsDeleting(false);
    setShowDeleteModal(false);
    setMemberToDelete(null);
    setTimeout(() => {
      setSuccessMemo("");
      setErrorMemo("");
    }, 3000);
  };

  const handleSetForReview = async (member) => {
    if (!canSetForReview(member)) {
      setErrorMemo(
        "Cannot set to For Review. Please ensure all fields are filled.",
      );
      setTimeout(() => setErrorMemo(""), 3000);
      return;
    }
    const { error } = await supabase
      .from("members")
      .update({ statusId: 10 })
      .eq("id", member.id);
    if (error) setErrorMemo(error.message);
    else
      setSuccessMemo(
        `${member.firstName} ${member.lastName} submitted for review.`,
      );
    setTimeout(() => setSuccessMemo(""), 3000);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      setErrorMemo("Please provide a reason for rejection");
      return;
    }
    const { error } = await supabase
      .from("members")
      .update({ statusId: 13, rejected_reason: rejectionReason })
      .eq("id", rejectingMember.id);
    if (error) setErrorMemo(error.message);
    else {
      setSuccessMemo(`Application for ${rejectingMember.firstName} rejected.`);
      setShowRejectionModal(false);
      fetchMembers();
    }
    setTimeout(() => setSuccessMemo(""), 3000);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setErrorMemo("");
    setSuccessMemo("");

    // Prepare data for validation
    const memberData = {
      id: editingMember?.id,
      firstName: newMember.firstName,
      middleName: newMember.middleName,
      lastName: newMember.lastName,
      emailAdd: newMember.emailAdd,
      phoneNumber: newMember.phoneNumber,
      birthDate: newMember.birthDate,
      baptisedDate: newMember.baptisedDate,
      joinDate: newMember.joinDate || new Date().toISOString().split("T")[0],
      notes: newMember.notes,
      profilePic: newMember.profilePic,
      formPdfUrl: newMember.formPdfUrl,
      signature_url: newMember.signature_url,
      statusId: newMember.statusId,
      churchID: userData.churches.id,
      createdBy: session.user.id,
    };

    // --- VALIDATION ---
    const validation = await validateMember(memberData, !!editingMember);

    if (!validation.isValid) {
      // Show all validation errors
      const errorMessage = validation.errors.join("\n• ");
      setErrorMemo(`Please fix the following issues:\n• ${errorMessage}`);
      // Scroll to top of form to show errors
      const formElement = document.getElementById("member-file-form");
      if (formElement) {
        formElement.scrollTop = 0;
      }
      return;
    }

    // --- PROCEED WITH SAVING ---
    let profileImgUrl = newMember.profilePic;
    let pdfUrl = newMember.formPdfUrl;
    let signatureUrl = newMember.signature_url;

    try {
      // Upload profile image if new file selected
      if (photoFile) {
        profileImgUrl = await uploadImage(photoFile);
        if (!profileImgUrl) {
          setErrorMemo("Failed to upload profile image");
          return;
        }
      }

      // Upload PDF if new file selected
      if (pdfFile) {
        const tempId = editingMember?.id || `temp_${Date.now()}`;
        pdfUrl = await uploadPdf(pdfFile, tempId);
        if (!pdfUrl) {
          setErrorMemo("Failed to upload application form");
          return;
        }
      }

      // Upload signature if new file selected
      if (signatureFile) {
        const tempId = editingMember?.id || `temp_${Date.now()}`;
        const uploadedUrl = await uploadSignature(signatureFile, tempId);
        if (uploadedUrl) {
          signatureUrl = uploadedUrl;
        } else {
          setErrorMemo("Failed to upload signature");
          return;
        }
      }

      // Check for "For Review" status requirement
      if (newMember.statusId === 10 && !canSetForReview(newMember)) {
        setErrorMemo(
          "Cannot set to For Review. Please ensure all fields are filled and application form is attached.",
        );
        return;
      }

      // Prepare final data
      const finalMemberData = {
        firstName: newMember.firstName,
        middleName: newMember.middleName,
        lastName: newMember.lastName,
        emailAdd: newMember.emailAdd,
        phoneNumber: newMember.phoneNumber,
        birthDate: newMember.birthDate,
        baptisedDate: newMember.baptisedDate || null,
        joinDate: newMember.joinDate || new Date().toISOString().split("T")[0],
        notes: newMember.notes || "",
        profilePic: profileImgUrl,
        formPdfUrl: pdfUrl,
        signature_url: signatureUrl,
        statusId: newMember.statusId,
        churchID: userData.churches.id,
      };

      // Save to database
      if (!editingMember) {
        // Insert new member
        const { error } = await supabase
          .from("members")
          .insert([{ ...finalMemberData, createdBy: session.user.id }]);

        if (error) {
          console.error("Error adding new Member:", error.message);
          setErrorMemo(`Failed to save: ${error.message}`);
          return;
        }
        setSuccessMemo(
          `Successfully registered new member ${newMember.firstName} ${newMember.lastName}.`,
        );
      } else {
        // Update existing member
        const { error } = await supabase
          .from("members")
          .update(finalMemberData)
          .eq("id", editingMember.id);

        if (error) {
          console.error("Error editing member:", error.message);
          setErrorMemo(`Failed to update: ${error.message}`);
          return;
        }
        setSuccessMemo(
          `Successfully updated registry files for ${newMember.firstName} ${newMember.lastName}.`,
        );
      }

      // Reset form and close modal
      resetMember();
      setShowMemberModal(false);
    } catch (err) {
      console.error("Error in save process:", err);
      setErrorMemo("An unexpected error occurred. Please try again.");
    } finally {
      // Clear messages after 4.5 seconds
      setTimeout(() => {
        setSuccessMemo("");
        setErrorMemo("");
      }, 4500);
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
          setSuccessMemo(
            'Custom profile picture uploaded. Click "Save Profile Changes" below to sync.',
          );
          setTimeout(() => setSuccessMemo(""), 5000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle signature file selection
  const handleSignatureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        setErrorMemo("Please select a PNG or JPG image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrorMemo("Please select a file under 2MB");
        return;
      }
      setSignatureFile(file);
      // Only use blob URL for preview, not for saving
      setSignaturePreviewUrl(URL.createObjectURL(file));
      // Don't set signatureUrl here - it will be set after upload
      // setNewMember({ ...newMember, signatureUrl: URL.createObjectURL(file) });
    }
  };

  // Upload signature to Supabase Storage - Handles both PNG and JPG
  const uploadSignature = async (file, memberId) => {
    if (!file) return null;

    // Get file extension
    const fileExt = file.name.split(".").pop();
    const fileName = `${memberId}_signature_${Date.now()}.${fileExt}`;
    const filePath = `member-signatures/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("member-signatures")
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading signature:", uploadError);
      setErrorMemo("Failed to upload signature");
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("member-signatures").getPublicUrl(filePath);

    return publicUrl;
  };

  // Baptismal Certificate handler - Only for active members (status 14)
  const handleBaptismalCertificate = (member) => {
    if (member.statusId !== 14) {
      setErrorMemo(
        `Baptismal certificate is only available for fully activated members (Active status). Current status: ${member.status}`,
      );
      setTimeout(() => setErrorMemo(""), 3000);
      return;
    }
    setSelectedBaptismalMember(member);
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (isDataLoading) {
    return <LoadingSpinner message="Loading registry data..." />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SecretarySidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        churchName={userData?.churches?.name}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />

      <div
        className={`flex-1 ${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}
      >
        <SuccessMessage
          message={successMemo}
          onDismiss={() => setSuccessMemo("")}
        />
        <ErrorMessage message={errorMemo} onDismiss={() => setErrorMemo("")} />

        <main className="p-6">
          {activeTab === "registry" && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950/30 text-white rounded-2xl p-6 md:p-8 border border-slate-700/50 overflow-hidden shadow-xl">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Member Registry Workspace</span>
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {userData.churches.name || ""} Church Only
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
                      Member Registry &{" "}
                      <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Profile Management
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
                      Add, edit, and manage congregation member profiles, track
                      membership status, and maintain accurate church records.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Live Sync
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <Users className="h-3 w-3 text-teal-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Member Database
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center">
                          <Shield className="h-3 w-3 text-sky-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Secure Records
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registry Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
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
                        Clerks are authorized to alter records strictly within
                        the bounds of the{" "}
                        <span className="font-bold text-indigo-600">
                          {userData?.churches?.name || "Naga"}
                        </span>{" "}
                        Church.
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

                {/* Search & Filters */}
                <div className="px-6 pt-4 pb-2 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <MemberSearchBar
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      resultCount={filteredMembers.length}
                    />
                    <MemberFilters
                      statusFilter={statusFilter}
                      setStatusFilter={setStatusFilter}
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      statusOptions={statusOptions}
                    />
                  </div>
                </div>

                {/* Table */}
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
                                {searchTerm
                                  ? `No members found matching "${searchTerm}"`
                                  : "No members registered yet."}
                              </p>
                              {!searchTerm && (
                                <button
                                  onClick={triggerAddMember}
                                  className="mt-2 text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1"
                                >
                                  <UserPlus className="h-3.5 w-3.5" />
                                  Add your first member
                                </button>
                              )}
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
                                {idx + 1 + (currentPage - 1) * itemsPerPage}
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
                            <td className="p-3">
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
                                    : m.status === "For Review"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : m.status === "Rejected in Review"
                                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                                        : "bg-slate-100 text-slate-600 border border-slate-200"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    m.status === "Active"
                                      ? "bg-emerald-500 animate-pulse"
                                      : m.status === "For Review"
                                        ? "bg-amber-500"
                                        : m.status === "Rejected in Review"
                                          ? "bg-rose-500"
                                          : "bg-slate-400"
                                  }`}
                                />
                                {m.status}
                              </span>
                            </td>
                            <td className="p-4">
                              {m.formPdfUrl ? (
                                <a
                                  href={m.formPdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                                >
                                  <File className="h-4 w-4" />
                                  <span className="text-[10px]">View Form</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 text-[10px]">
                                  No form
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {[9, 13].includes(m.statusId) && (
                                  <button
                                    onClick={() => openDeleteModal(m)}
                                    className="group/delete inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-all duration-200 rounded-lg text-[10px] font-semibold cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3 group-hover/delete:scale-110 transition-transform" />
                                    <span>Delete</span>
                                  </button>
                                )}
                                {m.statusId !== 14 && (
                                  <button
                                    onClick={() => triggerEditMember(m)}
                                    disabled={
                                      !EDITABLE_STATUSES.includes(m.statusId)
                                    }
                                    className={`group/edit inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer transition-all duration-200 ${
                                      EDITABLE_STATUSES.includes(m.statusId)
                                        ? "bg-slate-100 hover:bg-slate-800 text-slate-600 hover:text-white"
                                        : "bg-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                                    }`}
                                    title={
                                      !EDITABLE_STATUSES.includes(m.statusId)
                                        ? `Cannot edit member with status: ${m.status}`
                                        : "Edit Member"
                                    }
                                  >
                                    <Edit2 className="h-3 w-3" />
                                    <span>Edit</span>
                                  </button>
                                )}
                                {m.statusId === 9 &&
                                  m.formPdfUrl &&
                                  m.signature_url && (
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

                                {/* Baptismal Certificate Button - Only for Active members (status 14) */}
                                {m.statusId === 14 && (
                                  <button
                                    onClick={() =>
                                      handleBaptismalCertificate(m)
                                    }
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-600 text-amber-700 hover:text-white rounded-lg text-[10px] font-semibold transition-all duration-200"
                                    title="Generate Baptismal Certificate"
                                  >
                                    <Cross className="h-3 w-3" />
                                    <span>Baptismal</span>
                                  </button>
                                )}
                                {m.statusId === 14 && (
                                  <button
                                    onClick={() => setSelectedIdMember(m)}
                                    className="group/print inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer shadow-sm hover:shadow"
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

                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredMembers.length}
                  itemsPerPage={itemsPerPage}
                  searchTerm={searchTerm}
                />
              </div>
            </div>
          )}

          {/* Events Tab - Simplified */}
          {activeTab === "scheduler" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-sky-600" />
                        Chapel Calendar Events
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Schedule and manage church events
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
                        <div
                          key={event.id}
                          className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="h-10 w-10 rounded-lg bg-sky-100 flex flex-col items-center justify-center">
                                  <span className="text-lg font-bold text-sky-600">
                                    {new Date(event.date).getDate()}
                                  </span>
                                  <span className="text-[8px] text-sky-500">
                                    {new Date(event.date).toLocaleString(
                                      "default",
                                      { month: "short" },
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-800">
                                    {event.title}
                                  </h3>
                                  <p className="text-xs text-slate-500">
                                    {event.time} • {event.ministryType}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm text-slate-600">
                                {event.description}
                              </p>
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

          {/* Meeting Notes Tab - Simplified */}
          {activeTab === "meetingNotes" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <NotebookPen className="h-5 w-5 text-emerald-600" />
                        Meeting Notes
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Document and track meeting minutes
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
                        <div
                          key={note.id}
                          className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                  <NotebookPen className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-slate-800">
                                    {note.title}
                                  </h3>
                                  <p className="text-xs text-slate-400">
                                    {note.date}
                                  </p>
                                </div>
                              </div>
                              {note.summary && (
                                <p className="text-sm text-slate-600 mt-2">
                                  {note.summary.substring(0, 150)}
                                </p>
                              )}
                              {note.actionItems && (
                                <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                                  <p className="text-xs font-semibold text-amber-700">
                                    Action Items:
                                  </p>
                                  <p className="text-xs text-amber-600">
                                    {note.actionItems.substring(0, 100)}
                                  </p>
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

      {/* ============================================================
          MODALS
      ============================================================ */}

      {/* Member Modal - Keep as is (too complex to extract fully) */}
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

            <form
              onSubmit={handleSaveMember}
              className="p-6 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar"
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
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Middle Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={newMember.middleName}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          middleName: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                      placeholder="Enter Middle name"
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
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Church
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={userData?.churches?.name || "Naga"}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-100 text-slate-600 font-semibold cursor-not-allowed"
                  />
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
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          birthDate: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                {/* Baptised Date Field */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Baptised Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={newMember.baptisedDate}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          baptisedDate: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setNewMember({ ...newMember, joinDate: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Status
                  </label>
                  <select
                    value={newMember.statusId}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        statusId: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer transition-all"
                  >
                    {statusOptions
                      .filter((s) => SECRETARY_STATUSES.includes(s.id))
                      .map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.status}
                        </option>
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
                  onChange={(e) =>
                    setNewMember({ ...newMember, notes: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[80px] bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white resize-none"
                  placeholder="Insert notes, Favorite verse, or special concerns..."
                />
              </div>

              {/* ========== REJECTION DETAILS SECTION ========== */}
              {/* Only visible when editing a member with statusId === 13 */}
              {editingMember && editingMember.statusId === 13 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 w-6 rounded-lg bg-rose-100 flex items-center justify-center">
                      <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-rose-700 uppercase tracking-wider">
                      Rejection Details
                    </span>
                    <span className="text-[8px] bg-rose-200 text-rose-700 px-1.5 py-0.5 rounded-full font-mono">
                      REJECTED
                    </span>
                  </div>

                  <div className="space-y-2 bg-white/50 rounded-lg p-3 border border-rose-100">
                    {/* Rejection Reason */}
                    <div>
                      <span className="block text-[9px] font-mono font-bold text-rose-500 uppercase tracking-wider">
                        Reason for Rejection
                      </span>
                      <p className="text-sm text-slate-700 mt-0.5 font-medium">
                        {editingMember.rejected_reason || "No reason provided"}
                      </p>
                    </div>

                    {/* Reviewed By */}
                    <div className="pt-1.5 border-t border-rose-100">
                      <span className="block text-[9px] font-mono font-bold text-rose-500 uppercase tracking-wider">
                        Reviewed By
                      </span>
                      <p className="text-sm text-slate-700 mt-0.5">
                        {editingMember.reviewed_by || "Unknown"}
                      </p>
                    </div>

                    {/* Reviewed At */}
                    <div className="pt-1.5 border-t border-rose-100">
                      <span className="block text-[9px] font-mono font-bold text-rose-500 uppercase tracking-wider">
                        Reviewed At
                      </span>
                      <p className="text-sm text-slate-700 mt-0.5 font-mono">
                        {editingMember.reviewed_at
                          ? new Date(editingMember.reviewed_at).toLocaleString()
                          : "Not available"}
                      </p>
                    </div>
                  </div>

                  {/* Action Required Message */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    <p className="text-[10px] text-amber-700 flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>
                        This application was rejected. Please review the
                        feedback above, make necessary corrections, and resubmit
                        for review.
                      </span>
                    </p>
                  </div>
                </div>
              )}
              {/* ========== END REJECTION DETAILS SECTION ========== */}

              {/* Profile Photo Section */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <Image className="h-3.5 w-3.5" />
                  Member Profile Photo
                </label>
                <div className="flex gap-4 items-start">
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
                    />
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

              {/* PDF Application Form Upload Section */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <File className="h-3.5 w-3.5" />
                  Application Form (PDF)
                  {newMember.statusId === 2 && (
                    <span className="text-rose-500 ml-1">
                      * Required for For Review
                    </span>
                  )}
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
                          <a
                            href={pdfPreviewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <button
                            type="button"
                            onClick={removePdf}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handlePdfChange}
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-slate-400" />
                        <span className="text-sm text-slate-500">
                          Click to upload or drag and drop
                        </span>
                        <span className="text-xs text-slate-400">
                          PDF files only, max 5MB
                        </span>
                      </div>
                    </label>
                  )}
                </div>
                {newMember.statusId === 10 &&
                  !newMember.formPdfUrl &&
                  !pdfFile && (
                    <p className="text-[10px] text-rose-500">
                      Application form is required for "For Review" status
                    </p>
                  )}
              </div>

              {/* Signature Upload Section */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <PenTool className="h-3.5 w-3.5" />
                  Member Signature (PNG or JPG)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-indigo-400 transition-all">
                  {signaturePreviewUrl ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={signaturePreviewUrl}
                            alt="Signature preview"
                            className="h-12 w-auto object-contain border border-slate-200 rounded-lg p-1 bg-white"
                          />
                          <span className="text-sm text-slate-600 truncate max-w-[150px]">
                            {signatureFile
                              ? signatureFile.name
                              : "signature.png"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSignatureFile(null);
                              setSignaturePreviewUrl(null);
                              setNewMember({
                                ...newMember,
                                signature_url: "",
                              });
                            }}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/png"
                        className="hidden"
                        onChange={handleSignatureChange}
                      />
                      <div className="flex flex-col items-center gap-2">
                        <PenTool className="h-8 w-8 text-slate-400" />
                        <span className="text-sm text-slate-500">
                          Click to upload signature (PNG only)
                        </span>
                        <span className="text-xs text-slate-400">
                          PNG files only, max 2MB
                        </span>
                      </div>
                    </label>
                  )}
                </div>
                {newMember.statusId === 10 &&
                  !newMember.signature_url &&
                  !signatureFile && (
                    <p className="text-[10px] text-rose-500">
                      Signature is required for "For Review" status
                    </p>
                  )}
              </div>
            </form>

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
                    <span>
                      {editingMember ? "Save Changes" : "Register Member"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        member={memberToDelete}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteMember}
        isDeleting={isDeleting}
      />

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={showRejectionModal}
        member={rejectingMember}
        reason={rejectionReason}
        setReason={setRejectionReason}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={submitRejection}
        loading={false}
      />

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        //onSave={handleSaveEvent}
        event={{
          title: eventTitle,
          description: eventDesc,
          date: eventDate,
          time: eventTime,
          ministryType,
        }}
        setEvent={(data) => {
          setEventTitle(data.title || "");
          setEventDesc(data.description || "");
          setEventDate(data.date || "");
          setEventTime(data.time || "");
          setMinistryType(data.ministryType || "General");
        }}
        loading={false}
      />

      {/* Meeting Note Modal */}
      <MeetingNoteModal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        //onSave={handleSaveMeeting}
        note={newMeeting}
        setNote={setNewMeeting}
        loading={false}
      />

      {/* Printable ID Modal - Keep existing */}
      {selectedIdMember && (
        <PrintableIDCard
          member={selectedIdMember}
          churchName={userData?.churches?.name || "KJV BCCMI"}
          signatureUrl={selectedIdMember.signature_url}
          onClose={() => {
            setSelectedIdMember(null);
            setHasDrawnSig(false);
            setIsSignActive(false);
          }}
          theme="light"
          showControls={true}
        />
      )}

      {/* Baptismal Certificate Modal */}
      {selectedBaptismalMember && (
        <PrintableBaptismalCertificate
          member={selectedBaptismalMember}
          churchName="King James Version Bible Christian Church Ministries Inc."
          churchAddress="Pandacan, Pinamungajan Cebu City, Philippines 6039"
          pastorName="Pastor Rey B. Siaboc"
          onClose={() => {
            setSelectedBaptismalMember(null);
          }}
          theme="classic"
          showControls={true}
        />
      )}
    </div>
  );
}
