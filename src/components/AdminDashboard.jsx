import React, { useState, useEffect, useMemo } from "react";
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
  Filter,
  Save,
  AlertCircle,
  RefreshCw,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Receipt,
  Tag,
  Clock,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Download,
  Building2,
  User as UserIcon,
  Image,
  Info,
  Send,
  UserX,
  PenTool,
} from "lucide-react";
import { supabase } from "../supabase-client";
import CollapsibleSidebar from "./Shared/CollapsibleSidebar";
import DeleteConfirmationModal from "./Secretary/DeleteConfirmationModal";

export default function AdminDashboard({ userData, session }) {
  const [activeTab, setActiveTab] = useState("members");
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Members State
  const [members, setMembers] = useState([]);
  const [churches, setChurches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [churchFilter, setChurchFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemsPerPage = 8;

  // Pending Approvals State
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalSearchTerm, setApprovalSearchTerm] = useState("");
  const [approvalChurchFilter, setApprovalChurchFilter] = useState("All");
  const [approvalCurrentPage, setApprovalCurrentPage] = useState(1);
  const approvalsPerPage = 8;

  // Member Detail Modal State
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState(null);

  // Member Modal State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [newMember, setNewMember] = useState({
    firstName: "",
    lastName: "",
    emailAdd: "",
    phoneNumber: "",
    birthDate: "",
    churchID: userData?.churches?.id || 1,
    status: "Active",
    joinDate: new Date().toISOString().split("T")[0],
    notes: "",
    profilePic: "",
  });

  // Finances State
  const [finances, setFinances] = useState([]);
  const [financeSearch, setFinanceSearch] = useState("");
  const [financeCategoryFilter, setFinanceCategoryFilter] = useState("All");
  const [financeCurrentPage, setFinanceCurrentPage] = useState(1);
  const financesPerPage = 8;
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [editingFinance, setEditingFinance] = useState(null);
  const [newFinance, setNewFinance] = useState({
    amount: "",
    transType: "Offering",
    date: new Date().toISOString().split("T")[0],
    description: "",
    contributorName: "",
    contributorEmailAdd: "",
    churchID: userData?.churches?.id || 1,
  });

  // Approval Modal State
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalMember, setApprovalMember] = useState(null);
  const [approvalAction, setApprovalAction] = useState(null); // 'approve' or 'reject'
  const [approvalReason, setApprovalReason] = useState("");
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);

  // View/Edit Modal State (Combined)
  const [showViewEditModal, setShowViewEditModal] = useState(false);
  const [viewEditMember, setViewEditMember] = useState(null);
  const [isViewMode, setIsViewMode] = useState(true);

  // Posts State
  const [posts, setPosts] = useState([]);
  const [postSearch, setPostSearch] = useState("");
  const [postCategoryFilter, setPostCategoryFilter] = useState("All");
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    summary: "",
    imageBanner: "",
    images: "",
    category: "news",
    affiliation: "Global",
  });

  // Stats
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalFinances: 0,
    totalPosts: 0,
    totalOfferings: 0,
    totalDonations: 0,
    totalExpenses: 0,
    pendingApprovals: 0,
  });

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  // Update stats when data changes
  useEffect(() => {
    calculateStats();
  }, [members, finances, posts, pendingApprovals]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchMembers(),
      fetchChurches(),
      fetchPendingApprovals(),
      fetchFinances(),
      fetchPosts(),
    ]);
    setLoading(false);
  };

  // ==================== CHURCHES ====================
  const fetchChurches = async () => {
    const { data, error } = await supabase
      .from("churches")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching churches:", error);
    } else {
      setChurches(data || []);
    }
  };

  // ==================== PENDING APPROVALS ====================
  const fetchPendingApprovals = async () => {
    const { data, error } = await supabase
      .from("members")
      .select(
        `
        *,
        churches(id, name),
        members_status!members_statusId_fkey(id, status)
      `,
      )
      .eq("statusId", 12)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending approvals:", error);
    } else {
      const transformedData =
        data?.map((member) => ({
          ...member,
          churchName: member.churches?.name,
          status: member.members_status?.status,
        })) || [];
      setPendingApprovals(transformedData);
    }
  };

  // Approve member application
  const handleApproveApplication = async (member) => {
    if (
      !confirm(`Approve ${member.firstName} ${member.lastName}'s application?`)
    )
      return;

    setLoading(true);
    const { error } = await supabase
      .from("members")
      .update({
        statusId: 14,
        reviewed_by: session?.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", member.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(
        `${member.firstName} ${member.lastName} has been approved and activated.`,
      );
      await fetchPendingApprovals();
      await fetchMembers();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  // Reject application
  const handleRejectApplication = async (member) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    setLoading(true);
    const { error } = await supabase
      .from("members")
      .update({
        statusId: 13,
        rejected_reason: reason,
        reviewed_by: session?.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", member.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(
        `${member.firstName} ${member.lastName}'s application has been rejected.`,
      );
      await fetchPendingApprovals();
      await fetchMembers();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  // ==================== MEMBERS CRUD ====================
  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("members")
      .select(
        `
        *,
        churches(id, name),
        members_status!members_statusId_fkey(id, status)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching members:", error);
      setErrorMsg("Failed to load members");
    } else {
      const transformedData =
        data?.map((member) => ({
          ...member,
          churchName: member.churches?.name,
          status: member.members_status?.status,
        })) || [];
      setMembers(transformedData);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);

    const memberData = {
      ...newMember,
      createdBy: session?.user?.id,
      churchID: newMember.churchID,
      statusId: 14,
    };

    const { error } = await supabase.from("members").insert([memberData]);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Member added successfully!");
      await fetchMembers();
      setShowMemberModal(false);
      resetMemberForm();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const handleUpdateMember = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("members")
      .update(newMember)
      .eq("id", editingMember.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Member updated successfully!");
      await fetchMembers();
      setShowMemberModal(false);
      setEditingMember(null);
      resetMemberForm();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const handleDeleteMember = async (id) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    setLoading(true);
    const { error } = await supabase.from("members").delete().eq("id", id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Member deleted successfully!");
      await fetchMembers();
      await fetchPendingApprovals();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const resetMemberForm = () => {
    setNewMember({
      firstName: "",
      lastName: "",
      emailAdd: "",
      phoneNumber: "",
      birthDate: "",
      churchID: churches[0]?.id || 1,
      status: "Active",
      joinDate: new Date().toISOString().split("T")[0],
      notes: "",
      profilePic: "",
    });
  };

  const openDeleteModal = (member) => {
    if (![9, 13].includes(member.statusId)) {
      setErrorMsg(`Cannot delete member with status: ${member.status}.`);
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    // console.log(memberToDelete);
    // return;
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

      // Delete Profile Image from members-pic bucket
      if (memberToDelete.profilePicPath) {
        const path = memberToDelete.profilePicPath.split("/").pop();
        if (path)
          await supabase.storage
            .from("member-pics")
            .remove([`member-pics/${path}`]);
      }

      // Delete record
      const { error } = await supabase
        .from("members")
        .delete()
        .eq("id", memberToDelete.id);
      if (error) throw error;
      setSuccessMsg(
        `${memberToDelete.firstName} ${memberToDelete.lastName} deleted successfully.`,
      );
      fetchMembers();
    } catch (error) {
      setErrorMsg("Failed to delete member.", error);
    }
    setIsDeleting(false);
    setShowDeleteModal(false);
    setMemberToDelete(null);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  // ==================== FINANCES CRUD ====================
  const fetchFinances = async () => {
    const { data, error } = await supabase
      .from("finances")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching finances:", error);
    } else {
      setFinances(data || []);
    }
  };

  const handleAddFinance = async (e) => {
    e.preventDefault();
    setLoading(true);

    const amount =
      newFinance.transType === "Expense"
        ? -Math.abs(parseFloat(newFinance.amount))
        : Math.abs(parseFloat(newFinance.amount));

    const receiptNumber = `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const financeData = {
      ...newFinance,
      amount,
      receiptNumber,
      createdBy: session?.user?.id,
      churchID: userData?.churches?.id || 1,
    };

    const { error } = await supabase.from("finances").insert([financeData]);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Transaction recorded successfully!");
      await fetchFinances();
      setShowFinanceModal(false);
      resetFinanceForm();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const handleUpdateFinance = async (e) => {
    e.preventDefault();
    setLoading(true);

    const amount =
      newFinance.transType === "Expense"
        ? -Math.abs(parseFloat(newFinance.amount))
        : Math.abs(parseFloat(newFinance.amount));

    const { error } = await supabase
      .from("finances")
      .update({ ...newFinance, amount })
      .eq("id", editingFinance.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Transaction updated successfully!");
      await fetchFinances();
      setShowFinanceModal(false);
      setEditingFinance(null);
      resetFinanceForm();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const handleDeleteFinance = async (id) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    setLoading(true);
    const { error } = await supabase.from("finances").delete().eq("id", id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Transaction deleted successfully!");
      await fetchFinances();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const resetFinanceForm = () => {
    setNewFinance({
      amount: "",
      transType: "Offering",
      date: new Date().toISOString().split("T")[0],
      description: "",
      contributorName: "",
      contributorEmailAdd: "",
      churchID: userData?.churches?.id || 1,
    });
  };

  // ==================== POSTS CRUD ====================
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data || []);
    }
  };

  const handleAddPost = async (e) => {
    e.preventDefault();
    setLoading(true);

    const postData = {
      ...newPost,
      createdBy: session?.user?.id,
    };

    const { error } = await supabase.from("posts").insert([postData]);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Post published successfully!");
      await fetchPosts();
      setShowPostModal(false);
      resetPostForm();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("posts")
      .update(newPost)
      .eq("id", editingPost.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Post updated successfully!");
      await fetchPosts();
      setShowPostModal(false);
      setEditingPost(null);
      resetPostForm();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const handleDeletePost = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    setLoading(true);
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Post deleted successfully!");
      await fetchPosts();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const handleTogglePostStatus = async (post) => {
    setLoading(true);
    const { error } = await supabase
      .from("posts")
      .update({ active: !post.active })
      .eq("id", post.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(post.active ? "Post unpublished" : "Post published");
      await fetchPosts();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const resetPostForm = () => {
    setNewPost({
      title: "",
      content: "",
      summary: "",
      imageBanner: "",
      images: "",
      category: "news",
      affiliation: "Global",
    });
  };

  // ==================== STATS CALCULATION ====================
  const calculateStats = () => {
    const totalOfferings = finances
      .filter((f) => f.transType === "Offering")
      .reduce((sum, f) => sum + (f.amount > 0 ? f.amount : 0), 0);

    const totalDonations = finances
      .filter((f) => f.transType === "Donation")
      .reduce((sum, f) => sum + (f.amount > 0 ? f.amount : 0), 0);

    const totalExpenses = finances
      .filter((f) => f.transType === "Expense")
      .reduce((sum, f) => sum + Math.abs(f.amount), 0);

    setStats({
      totalMembers: members.filter((m) => m.statusId === 14).length,
      totalFinances: finances.length,
      totalPosts: posts.length,
      totalOfferings,
      totalDonations,
      totalExpenses,
      pendingApprovals: pendingApprovals.length,
    });
  };

  const vaultTotal =
    stats.totalOfferings + stats.totalDonations - stats.totalExpenses;

  // ==================== FILTERING ====================
  const filteredMembers = useMemo(() => {
    let filtered = [...members];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.firstName?.toLowerCase().includes(term) ||
          m.lastName?.toLowerCase().includes(term) ||
          m.emailAdd?.toLowerCase().includes(term) ||
          m.id?.toString().includes(term),
      );
    }

    if (roleFilter !== "All") {
      filtered = filtered.filter((m) => m.role === roleFilter);
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    if (churchFilter !== "All") {
      filtered = filtered.filter((m) => m.churchId === parseInt(churchFilter));
    }

    return filtered;
  }, [members, searchTerm, roleFilter, statusFilter, churchFilter]);

  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, currentPage]);

  const filteredApprovals = useMemo(() => {
    let filtered = [...pendingApprovals];

    if (approvalSearchTerm) {
      const term = approvalSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.firstName?.toLowerCase().includes(term) ||
          m.lastName?.toLowerCase().includes(term) ||
          m.emailAdd?.toLowerCase().includes(term),
      );
    }

    if (approvalChurchFilter !== "All") {
      filtered = filtered.filter(
        (m) => m.churchId === parseInt(approvalChurchFilter),
      );
    }

    return filtered;
  }, [pendingApprovals, approvalSearchTerm, approvalChurchFilter]);

  const paginatedApprovals = useMemo(() => {
    const start = (approvalCurrentPage - 1) * approvalsPerPage;
    return filteredApprovals.slice(start, start + approvalsPerPage);
  }, [filteredApprovals, approvalCurrentPage]);

  const filteredFinances = useMemo(() => {
    let filtered = [...finances];

    if (financeSearch) {
      const term = financeSearch.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.receiptNumber?.toLowerCase().includes(term) ||
          f.description?.toLowerCase().includes(term) ||
          f.contributorName?.toLowerCase().includes(term),
      );
    }

    if (financeCategoryFilter !== "All") {
      filtered = filtered.filter((f) => f.transType === financeCategoryFilter);
    }

    return filtered;
  }, [finances, financeSearch, financeCategoryFilter]);

  const paginatedFinances = useMemo(() => {
    const start = (financeCurrentPage - 1) * financesPerPage;
    return filteredFinances.slice(start, start + financesPerPage);
  }, [filteredFinances, financeCurrentPage]);

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    if (postSearch) {
      const term = postSearch.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title?.toLowerCase().includes(term) ||
          p.content?.toLowerCase().includes(term),
      );
    }

    if (postCategoryFilter !== "All") {
      filtered = filtered.filter((p) => p.category === postCategoryFilter);
    }

    return filtered;
  }, [posts, postSearch, postCategoryFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, churchFilter]);

  useEffect(() => {
    setFinanceCurrentPage(1);
  }, [financeSearch, financeCategoryFilter]);

  useEffect(() => {
    setApprovalCurrentPage(1);
  }, [approvalSearchTerm, approvalChurchFilter]);

  // ==================== APPROVAL FUNCTIONS ====================
  const openApprovalModal = (member, action) => {
    setApprovalMember(member);
    setApprovalAction(action);
    setApprovalReason("");
    setShowApprovalModal(true);
  };

  const handleApprovalConfirm = async () => {
    if (approvalAction === "reject" && !approvalReason.trim()) {
      setErrorMsg("Please provide a reason for rejection");
      return;
    }

    setIsSubmittingApproval(true);
    setLoading(true);

    const updateData = {
      reviewed_by: session?.user?.id,
      reviewed_at: new Date().toISOString(),
    };

    if (approvalAction === "approve") {
      updateData.statusId = 14; // Active
    } else {
      updateData.statusId = 13; // Rejected in Review
      updateData.rejected_reason = approvalReason;
    }

    const { error } = await supabase
      .from("members")
      .update(updateData)
      .eq("id", approvalMember.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(
        `${approvalMember.firstName} ${approvalMember.lastName} has been ${approvalAction === "approve" ? "approved and activated" : "rejected"}.`,
      );
      await fetchPendingApprovals();
      await fetchMembers();
      setShowApprovalModal(false);
      setApprovalMember(null);
    }

    setLoading(false);
    setIsSubmittingApproval(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  // ==================== VIEW/EDIT FUNCTIONS ====================
  const openViewEditModal = (member, viewOnly = true) => {
    setViewEditMember(member);
    setIsViewMode(viewOnly);
    setShowViewEditModal(true);
  };

  const handleViewEditSave = async (e) => {
    e.preventDefault();
    if (isViewMode) {
      setShowViewEditModal(false);
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("members")
      .update(viewEditMember)
      .eq("id", viewEditMember.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Member updated successfully!");
      await fetchMembers();
      await fetchPendingApprovals();
      setShowViewEditModal(false);
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  const navigationItems = [
    { id: "approvals", icon: Clock, label: "Member Approvals", color: "amber" },
    { id: "members", icon: Users, label: "Members & Users", color: "indigo" },
    { id: "finances", icon: Database, label: "Ledger & Vault", color: "amber" },
    {
      id: "posts",
      icon: BookOpen,
      label: "Updates & Dispatches",
      color: "emerald",
    },
  ];

  if (
    loading &&
    members.length === 0 &&
    finances.length === 0 &&
    posts.length === 0
  ) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-slate-50">
      <CollapsibleSidebar
        title="Admin Console"
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeItem={activeTab}
        onSelect={setActiveTab}
        items={navigationItems}
        footerTitle="Superuser Access"
        footerText="Full administrative control over all church platforms."
      />

      {/* RIGHT MAIN CONTENT AREA */}
      <div className={`flex-1 transition-all duration-300`}>
        {/* Success/Error Messages */}
        {successMsg && (
          <div className="mx-6 mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <main className="p-6">
          {/* MEMBER APPROVALS TAB */}
          {activeTab === "approvals" && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/30 text-white rounded-2xl p-6 md:p-8 border border-slate-700/50 overflow-hidden shadow-xl">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-amber-500 blur-3xl" />
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-sky-500 blur-3xl" />
                </div>
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
                  <Clock className="h-64 w-64 translate-x-20 -translate-y-10" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                          <Clock className="h-3 w-3" />
                          <span>Member Approval Workspace</span>
                        </span>
                      </div>
                      <div className="h-3 w-px bg-slate-600 hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-sans">
                          Global Context:
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          All Extensions
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
                      Member Approvals &{" "}
                      <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        Application Review
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
                      Review and approve member applications that have passed
                      moderator review.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Pending Review
                        </span>
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
                          <Shield className="h-3 w-3 text-sky-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Secure Approval
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approvals Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-sm font-sans font-extrabold text-slate-800 uppercase tracking-wider">
                          Pending Approvals
                        </h2>
                        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-mono font-bold">
                          AWAITING FINAL APPROVAL
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans ml-10">
                        Review applications that have passed moderator review.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[9px] font-mono text-amber-600">
                        {filteredApprovals.length} Pending Approval
                      </span>
                    </div>
                  </div>
                </div>

                {/* Search and Filter Bar */}
                <div className="px-6 pt-4 pb-2 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={approvalSearchTerm}
                        onChange={(e) => setApprovalSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-slate-50 hover:bg-white transition"
                      />
                    </div>
                    <select
                      value={approvalChurchFilter}
                      onChange={(e) => setApprovalChurchFilter(e.target.value)}
                      className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                    >
                      <option value="All">All Churches</option>
                      {churches.map((church) => (
                        <option key={church.id} value={church.id}>
                          {church.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {approvalSearchTerm && (
                    <div className="mt-2 text-xs text-slate-500">
                      Found {filteredApprovals.length} result
                      {filteredApprovals.length !== 1 ? "s" : ""} for "
                      {approvalSearchTerm}"
                    </div>
                  )}
                </div>

                {/* Approvals Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-mono font-bold uppercase tracking-wider border-b-2 border-slate-200">
                        <th className="p-4">Ref ID</th>
                        <th className="p-4">Applicant</th>
                        <th className="p-4">Church</th>
                        <th className="p-4">Submitted</th>
                        <th className="p-4">Form</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedApprovals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                                <Clock className="h-8 w-8 text-slate-300" />
                              </div>
                              <p className="text-sm text-slate-400 italic font-sans">
                                {approvalSearchTerm
                                  ? `No approvals found matching "${approvalSearchTerm}"`
                                  : `No pending approvals found.`}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedApprovals.map((member, idx) => (
                          <tr
                            key={member.id}
                            className="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-transparent transition-all duration-200 group"
                          >
                            <td className="p-4">
                              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                {idx +
                                  1 +
                                  (approvalCurrentPage - 1) * approvalsPerPage}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {member.profilePic ? (
                                  <img
                                    src={member.profilePic}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                    {member.firstName?.[0] || "U"}
                                    {member.lastName?.[0] || "s"}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-slate-800">
                                    {member.firstName} {member.lastName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {member.emailAdd}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                {member.churchName}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 text-xs">
                              {new Date(member.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              {member.formPdfUrl ? (
                                <a
                                  href={member.formPdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="text-xs">View</span>
                                </a>
                              ) : (
                                <span className="text-slate-400 text-xs">
                                  No form
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    openViewEditModal(member, true)
                                  }
                                  className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() =>
                                    openApprovalModal(member, "approve")
                                  }
                                  className="inline-flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() =>
                                    openApprovalModal(member, "reject")
                                  }
                                  className="inline-flex items-center gap-1.5 bg-rose-100 hover:bg-rose-600 text-rose-700 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {Math.ceil(filteredApprovals.length / approvalsPerPage) > 1 && (
                  <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <p className="text-xs text-slate-600 font-sans">
                          Showing{" "}
                          <span className="font-extrabold text-slate-900">
                            {(approvalCurrentPage - 1) * approvalsPerPage + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-extrabold text-slate-900">
                            {Math.min(
                              approvalCurrentPage * approvalsPerPage,
                              filteredApprovals.length,
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-extrabold text-amber-600">
                            {filteredApprovals.length}
                          </span>{" "}
                          approvals
                          {approvalSearchTerm && (
                            <span className="text-slate-400"> (filtered)</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setApprovalCurrentPage((prev) =>
                              Math.max(prev - 1, 1),
                            )
                          }
                          disabled={approvalCurrentPage === 1}
                          className="relative inline-flex items-center rounded-l-xl px-3 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="ml-1 text-xs font-medium hidden sm:inline">
                            Previous
                          </span>
                        </button>
                        {Array.from(
                          {
                            length: Math.min(
                              Math.ceil(
                                filteredApprovals.length / approvalsPerPage,
                              ),
                              5,
                            ),
                          },
                          (_, i) => {
                            let pageNum;
                            const totalApprovalPages = Math.ceil(
                              filteredApprovals.length / approvalsPerPage,
                            );
                            if (totalApprovalPages <= 5) pageNum = i + 1;
                            else if (approvalCurrentPage <= 3) pageNum = i + 1;
                            else if (
                              approvalCurrentPage >=
                              totalApprovalPages - 2
                            )
                              pageNum = totalApprovalPages - 4 + i;
                            else pageNum = approvalCurrentPage - 2 + i;
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setApprovalCurrentPage(pageNum)}
                                className={`relative inline-flex items-center justify-center min-w-[36px] px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                                  approvalCurrentPage === pageNum
                                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25 scale-105"
                                    : "bg-white text-slate-600 border border-slate-200 hover:bg-amber-50 hover:border-amber-300"
                                } cursor-pointer`}
                              >
                                {pageNum}
                              </button>
                            );
                          },
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setApprovalCurrentPage((prev) =>
                              Math.min(
                                prev + 1,
                                Math.ceil(
                                  filteredApprovals.length / approvalsPerPage,
                                ),
                              ),
                            )
                          }
                          disabled={
                            approvalCurrentPage ===
                            Math.ceil(
                              filteredApprovals.length / approvalsPerPage,
                            )
                          }
                          className="relative inline-flex items-center rounded-r-xl px-3 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
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
            </div>
          )}

          {/* MEMBERS TAB - Updated with combined View/Edit */}
          {activeTab === "members" && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/30 text-white rounded-2xl p-6 md:p-8 border border-slate-700/50 overflow-hidden shadow-xl">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-500 blur-3xl" />
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-purple-500 blur-3xl" />
                </div>
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
                  <Users className="h-64 w-64 translate-x-20 -translate-y-10" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                          <Users className="h-3 w-3" />
                          <span>Member Registry Workspace</span>
                        </span>
                      </div>
                      <div className="h-3 w-px bg-slate-600 hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-sans">
                          Localized Context:
                        </span>
                        <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                          All Extensions
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
                      Member Registry &{" "}
                      <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        User Management
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
                      Manage church members, roles, and permissions across all
                      extensions.
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

              {/* Member Panel */}
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
                          SUPERUSER
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans ml-10">
                        Manage members across all church extensions.
                      </p>
                    </div>
                    {/* <button
                      onClick={() => {
                        setEditingMember(null);
                        resetMemberForm();
                        setShowMemberModal(true);
                      }}
                      className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 shrink-0 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <UserPlus className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                      <span>Add Member</span>
                    </button> */}
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 hover:bg-white transition"
                      />
                    </div>
                    <select
                      value={churchFilter}
                      onChange={(e) => setChurchFilter(e.target.value)}
                      className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="All">All Churches</option>
                      {churches.map((church) => (
                        <option key={church.id} value={church.id}>
                          {church.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="All">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Pastor">Pastor</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                      <option value="Member">Member</option>
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    >
                      <option value="All">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Outreach">Outreach</option>
                    </select>
                  </div>
                  {searchTerm && (
                    <div className="mt-2 text-xs text-slate-500">
                      Found {filteredMembers.length} result
                      {filteredMembers.length !== 1 ? "s" : ""} for "
                      {searchTerm}"
                    </div>
                  )}
                </div>

                {/* Members Table - Updated Actions */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-mono font-bold uppercase tracking-wider border-b-2 border-slate-200">
                        <th className="p-4">ID</th>
                        <th className="p-4">Member</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Church</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Status</th>
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
                                  : `No members found.`}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedMembers.map((member, idx) => (
                          <tr
                            key={member.id}
                            className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-200 group"
                          >
                            <td className="p-4">
                              <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                {idx + 1 + (currentPage - 1) * itemsPerPage}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {member.profilePic ? (
                                  <img
                                    src={member.profilePic}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                    {member.firstName?.[0] || "U"}
                                    {member.lastName?.[0] || "s"}
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold text-slate-800">
                                    {member.firstName} {member.lastName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {member.emailAdd}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span className="font-mono text-[11px] text-slate-600">
                                  {member.phoneNumber || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                                {member.churchName}
                              </span>
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  member.role === "Admin"
                                    ? "bg-red-100 text-red-700"
                                    : member.role === "Pastor"
                                      ? "bg-indigo-100 text-indigo-700"
                                      : member.role === "Secretary"
                                        ? "bg-blue-100 text-blue-700"
                                        : member.role === "Treasurer"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {member.role || "Member"}
                              </span>
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold font-mono uppercase shadow-sm ${
                                  member.status === "Active"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : member.status === "Inactive"
                                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                                      : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    member.status === "Active"
                                      ? "bg-emerald-500 animate-pulse"
                                      : member.status === "Inactive"
                                        ? "bg-rose-500"
                                        : "bg-amber-500"
                                  }`}
                                />
                                {member.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() =>
                                    openViewEditModal(member, true)
                                  }
                                  className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>View/Edit</span>
                                </button>
                                <button
                                  onClick={() => openDeleteModal(member)}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg transition cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {Math.ceil(filteredMembers.length / itemsPerPage) > 1 && (
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
                            {Math.min(
                              currentPage * itemsPerPage,
                              filteredMembers.length,
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-extrabold text-indigo-600">
                            {filteredMembers.length}
                          </span>{" "}
                          members
                          {searchTerm && (
                            <span className="text-slate-400"> (filtered)</span>
                          )}
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
                        {Array.from(
                          {
                            length: Math.min(
                              Math.ceil(filteredMembers.length / itemsPerPage),
                              5,
                            ),
                          },
                          (_, i) => {
                            let pageNum;
                            const totalMemberPages = Math.ceil(
                              filteredMembers.length / itemsPerPage,
                            );
                            if (totalMemberPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalMemberPages - 2)
                              pageNum = totalMemberPages - 4 + i;
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
                          },
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(
                                prev + 1,
                                Math.ceil(
                                  filteredMembers.length / itemsPerPage,
                                ),
                              ),
                            )
                          }
                          disabled={
                            currentPage ===
                            Math.ceil(filteredMembers.length / itemsPerPage)
                          }
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
            </div>
          )}

          {/* FINANCES TAB */}
          {activeTab === "finances" && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-amber-950/30 text-white rounded-2xl p-6 md:p-8 border border-slate-700/50 overflow-hidden shadow-xl">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-amber-500 blur-3xl" />
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-emerald-500 blur-3xl" />
                </div>
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
                  <Landmark className="h-64 w-64 translate-x-20 -translate-y-10" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                          <Landmark className="h-3 w-3" />
                          <span>Financial Management</span>
                        </span>
                      </div>
                      <div className="h-3 w-px bg-slate-600 hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-sans">
                          Localized Context:
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          All Extensions
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
                      Financial Ledger &{" "}
                      <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        Vault Management
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
                      Track offerings, donations, and expenses across all church
                      extensions.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Real-time Sync
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center">
                          <Shield className="h-3 w-3 text-sky-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Audit Logged
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <FileText className="h-3 w-3 text-amber-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Compliant Receipts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Offerings</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        ₱{stats.totalOfferings.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Donations</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        ₱{stats.totalDonations.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Expenses</p>
                      <p className="text-2xl font-bold text-rose-600">
                        ₱{stats.totalExpenses.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
                      <ArrowDownRight className="h-5 w-5 text-rose-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Net Balance</p>
                      <p className="text-2xl font-bold text-emerald-400">
                        ₱{vaultTotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-indigo-900 flex items-center justify-center">
                      <Landmark className="h-5 w-5 text-indigo-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by receipt #, description, or contributor..."
                      value={financeSearch}
                      onChange={(e) => setFinanceSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-slate-50 hover:bg-white transition"
                    />
                  </div>
                  <select
                    value={financeCategoryFilter}
                    onChange={(e) => setFinanceCategoryFilter(e.target.value)}
                    className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="Offering">Offering</option>
                    <option value="Donation">Donation</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                {financeSearch && (
                  <div className="mt-2 text-xs text-slate-500">
                    Found {filteredFinances.length} result
                    {filteredFinances.length !== 1 ? "s" : ""} for "
                    {financeSearch}"
                  </div>
                )}
              </div>

              {/* Finances Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="p-3 text-left">Receipt #</th>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Description</th>
                        <th className="p-3 text-left">Contributor</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedFinances.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="p-8 text-center text-slate-400"
                          >
                            {financeSearch
                              ? `No transactions found for "${financeSearch}"`
                              : "No transactions found"}
                          </td>
                        </tr>
                      ) : (
                        paginatedFinances.map((finance) => (
                          <tr key={finance.id} className="hover:bg-slate-50">
                            <td className="p-3 font-mono text-xs">
                              {finance.receiptNumber}
                            </td>
                            <td className="p-3">{finance.date}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  finance.transType === "Offering"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : finance.transType === "Donation"
                                      ? "bg-indigo-100 text-indigo-700"
                                      : "bg-rose-100 text-rose-700"
                                }`}
                              >
                                {finance.transType}
                              </span>
                            </td>
                            <td className="p-3 max-w-xs truncate">
                              {finance.description}
                            </td>
                            <td className="p-3">
                              {finance.contributorName || "-"}
                            </td>
                            <td
                              className={`p-3 text-right font-semibold ${finance.amount < 0 ? "text-rose-600" : "text-emerald-600"}`}
                            >
                              {finance.amount < 0 ? "-" : "+"}₱
                              {Math.abs(finance.amount).toLocaleString()}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingFinance(finance);
                                    setNewFinance({
                                      ...finance,
                                      amount: Math.abs(finance.amount),
                                    });
                                    setShowFinanceModal(true);
                                  }}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteFinance(finance.id)
                                  }
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {Math.ceil(filteredFinances.length / financesPerPage) > 1 && (
                  <div className="border-t border-slate-200 px-4 py-3 flex justify-between items-center">
                    <p className="text-xs text-slate-500">
                      Showing{" "}
                      {Math.min(
                        filteredFinances.length,
                        (financeCurrentPage - 1) * financesPerPage + 1,
                      )}{" "}
                      -{" "}
                      {Math.min(
                        financeCurrentPage * financesPerPage,
                        filteredFinances.length,
                      )}{" "}
                      of {filteredFinances.length}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setFinanceCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={financeCurrentPage === 1}
                        className="p-2 border rounded-lg disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setFinanceCurrentPage((p) =>
                            Math.min(
                              Math.ceil(
                                filteredFinances.length / financesPerPage,
                              ),
                              p + 1,
                            ),
                          )
                        }
                        disabled={
                          financeCurrentPage ===
                          Math.ceil(filteredFinances.length / financesPerPage)
                        }
                        className="p-2 border rounded-lg disabled:opacity-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* POSTS TAB */}
          {activeTab === "posts" && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950/30 text-white rounded-2xl p-6 md:p-8 border border-slate-700/50 overflow-hidden shadow-xl">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500 blur-3xl" />
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-500 blur-3xl" />
                </div>
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
                  <Newspaper className="h-64 w-64 translate-x-20 -translate-y-10" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                          <Newspaper className="h-3 w-3" />
                          <span>Content Management</span>
                        </span>
                      </div>
                      <div className="h-3 w-px bg-slate-600 hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-sans">
                          Localized Context:
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          All Extensions
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
                      Updates &{" "}
                      <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        News Broadcasts
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
                      Manage community announcements and news across all church
                      extensions.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Live Updates
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <Newspaper className="h-3 w-3 text-teal-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Church News
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center">
                          <Shield className="h-3 w-3 text-sky-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Secure Access
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search posts by title..."
                      value={postSearch}
                      onChange={(e) => setPostSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-slate-50 hover:bg-white transition"
                    />
                  </div>
                  <select
                    value={postCategoryFilter}
                    onChange={(e) => setPostCategoryFilter(e.target.value)}
                    className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    <option value="news">News</option>
                    <option value="announcement">Announcement</option>
                    <option value="study">Bible Study</option>
                    <option value="event">Event</option>
                    <option value="featured">Featured</option>
                  </select>
                </div>
                {postSearch && (
                  <div className="mt-2 text-xs text-slate-500">
                    Found {filteredPosts.length} result
                    {filteredPosts.length !== 1 ? "s" : ""} for "{postSearch}"
                  </div>
                )}
              </div>

              {/* Posts Grid */}
              <div className="grid grid-cols-1 gap-4">
                {filteredPosts.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                    {postSearch
                      ? `No posts found for "${postSearch}"`
                      : "No posts found"}
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                post.category === "urgent"
                                  ? "bg-rose-100 text-rose-700"
                                  : post.category === "featured"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-indigo-100 text-indigo-700"
                              }`}
                            >
                              {post.category}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${post.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                            >
                              {post.active ? "Published" : "Draft"}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900">
                            {post.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {post.content}
                          </p>
                          <p className="text-xs text-slate-400 mt-2">
                            {post.affiliation} •{" "}
                            {post.summary?.substring(0, 100)}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleTogglePostStatus(post)}
                            className={`p-2 rounded-lg transition ${
                              post.active
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {post.active ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingPost(post);
                              setNewPost(post);
                              setShowPostModal(true);
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* VIEW/EDIT MODAL - Combined */}
      {showViewEditModal && viewEditMember && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            {/* Premium Header - Changes based on status */}
            <div
              className={`relative px-6 py-5 ${
                viewEditMember.statusId === 12
                  ? "bg-gradient-to-r from-amber-600 to-orange-600"
                  : isViewMode
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600"
              }`}
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    {viewEditMember.statusId === 12 ? (
                      <Clock className="h-5 w-5 text-white" />
                    ) : isViewMode ? (
                      <Eye className="h-5 w-5 text-white" />
                    ) : (
                      <Edit3 className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">
                        {viewEditMember.statusId === 12
                          ? "Pending Approval"
                          : isViewMode
                            ? "Member Details"
                            : "Edit Member"}
                      </h2>
                      {!isViewMode && viewEditMember.statusId !== 12 && (
                        <span className="text-[9px] bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-mono font-bold border border-white/30">
                          EDIT MODE
                        </span>
                      )}
                      {viewEditMember.statusId === 12 && (
                        <span className="text-[9px] bg-amber-500/30 backdrop-blur-sm text-white px-2 py-0.5 rounded-full font-mono font-bold border border-amber-400/50 animate-pulse">
                          AWAITING APPROVAL
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/80">
                      {viewEditMember.statusId === 12
                        ? "This member is awaiting final approval. No changes can be made."
                        : isViewMode
                          ? "Viewing complete member information"
                          : "Update member information securely"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isViewMode && viewEditMember.statusId !== 12 && (
                    <button
                      onClick={() => {
                        setIsViewMode(false);
                        setViewEditMember({ ...viewEditMember });
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 flex items-center gap-1.5 border border-white/30"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit Member
                    </button>
                  )}
                  {viewEditMember.statusId === 12 && (
                    <div className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-500/30 backdrop-blur-sm rounded-lg border border-amber-400/50 flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      Locked
                    </div>
                  )}
                  <button
                    onClick={() => setShowViewEditModal(false)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleViewEditSave}
              className="p-6 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar"
            >
              {/* Profile Header - Premium Card */}
              <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  {viewEditMember.profilePic ? (
                    <img
                      src={viewEditMember.profilePic}
                      alt=""
                      className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg border-4 border-white">
                      {viewEditMember.firstName?.[0]}
                      {viewEditMember.lastName?.[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {viewEditMember.firstName} {viewEditMember.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {viewEditMember.role || "Member"} •{" "}
                      {viewEditMember.churchName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase shadow-sm ${
                          viewEditMember.statusId === 12
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : viewEditMember.status === "Active"
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : viewEditMember.status === "Inactive"
                                ? "bg-rose-100 text-rose-700 border border-rose-200"
                                : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            viewEditMember.statusId === 12
                              ? "bg-amber-500 animate-pulse"
                              : viewEditMember.status === "Active"
                                ? "bg-emerald-500 animate-pulse"
                                : viewEditMember.status === "Inactive"
                                  ? "bg-rose-500"
                                  : "bg-amber-500"
                          }`}
                        />
                        {viewEditMember.statusId === 12
                          ? "Pending Approval"
                          : viewEditMember.status}
                      </span>
                      {viewEditMember.id && (
                        <span className="text-[9px] text-slate-400 font-mono">
                          ID: {viewEditMember.id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-0.5 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                  <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Contact Information
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`${isViewMode ? "bg-slate-50/50" : "bg-white"} rounded-xl p-3 border ${isViewMode ? "border-slate-100" : "border-slate-200"} transition-all duration-200 ${!isViewMode && viewEditMember.statusId !== 12 ? "hover:border-indigo-300" : ""}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-[10px] text-slate-500 font-medium">
                        Email Address
                      </p>
                    </div>
                    {isViewMode || viewEditMember.statusId === 12 ? (
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {viewEditMember.emailAdd}
                      </p>
                    ) : (
                      <input
                        type="email"
                        value={viewEditMember.emailAdd}
                        onChange={(e) =>
                          setViewEditMember({
                            ...viewEditMember,
                            emailAdd: e.target.value,
                          })
                        }
                        className="w-full mt-0.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
                        placeholder="Enter email"
                      />
                    )}
                  </div>
                  <div
                    className={`${isViewMode ? "bg-slate-50/50" : "bg-white"} rounded-xl p-3 border ${isViewMode ? "border-slate-100" : "border-slate-200"} transition-all duration-200 ${!isViewMode && viewEditMember.statusId !== 12 ? "hover:border-indigo-300" : ""}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-[10px] text-slate-500 font-medium">
                        Phone Number
                      </p>
                    </div>
                    {isViewMode || viewEditMember.statusId === 12 ? (
                      <p className="text-sm font-medium text-slate-800">
                        {viewEditMember.phoneNumber || "Not provided"}
                      </p>
                    ) : (
                      <input
                        type="tel"
                        value={viewEditMember.phoneNumber}
                        onChange={(e) =>
                          setViewEditMember({
                            ...viewEditMember,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full mt-0.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
                        placeholder="Enter phone number"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-0.5 rounded-full bg-gradient-to-b from-sky-500 to-blue-500" />
                  <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Personal Information
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`${isViewMode ? "bg-slate-50/50" : "bg-white"} rounded-xl p-3 border ${isViewMode ? "border-slate-100" : "border-slate-200"} transition-all duration-200 ${!isViewMode && viewEditMember.statusId !== 12 ? "hover:border-indigo-300" : ""}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-[10px] text-slate-500 font-medium">
                        Birth Date
                      </p>
                    </div>
                    {isViewMode || viewEditMember.statusId === 12 ? (
                      <p className="text-sm font-medium text-slate-800">
                        {viewEditMember.birthDate || "Not provided"}
                      </p>
                    ) : (
                      <input
                        type="date"
                        value={viewEditMember.birthDate}
                        onChange={(e) =>
                          setViewEditMember({
                            ...viewEditMember,
                            birthDate: e.target.value,
                          })
                        }
                        className="w-full mt-0.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
                      />
                    )}
                  </div>
                  <div
                    className={`${isViewMode ? "bg-slate-50/50" : "bg-white"} rounded-xl p-3 border ${isViewMode ? "border-slate-100" : "border-slate-200"} transition-all duration-200 ${!isViewMode && viewEditMember.statusId !== 12 ? "hover:border-indigo-300" : ""}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-[10px] text-slate-500 font-medium">
                        Join Date
                      </p>
                    </div>
                    {isViewMode || viewEditMember.statusId === 12 ? (
                      <p className="text-sm font-medium text-slate-800">
                        {viewEditMember.joinDate}
                      </p>
                    ) : (
                      <input
                        type="date"
                        value={viewEditMember.joinDate}
                        onChange={(e) =>
                          setViewEditMember({
                            ...viewEditMember,
                            joinDate: e.target.value,
                          })
                        }
                        className="w-full mt-0.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Church & Role Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-0.5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
                  <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Church & Role
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`${isViewMode ? "bg-slate-50/50" : "bg-white"} rounded-xl p-3 border ${isViewMode ? "border-slate-100" : "border-slate-200"} transition-all duration-200 ${!isViewMode && viewEditMember.statusId !== 12 ? "hover:border-indigo-300" : ""}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-[10px] text-slate-500 font-medium">
                        Church
                      </p>
                    </div>
                    {isViewMode || viewEditMember.statusId === 12 ? (
                      <p className="text-sm font-medium text-slate-800">
                        {viewEditMember.churchName}
                      </p>
                    ) : (
                      <select
                        value={viewEditMember.churchID}
                        onChange={(e) =>
                          setViewEditMember({
                            ...viewEditMember,
                            churchID: parseInt(e.target.value),
                          })
                        }
                        className="w-full mt-0.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all cursor-pointer"
                      >
                        {churches.map((church) => (
                          <option key={church.id} value={church.id}>
                            {church.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div
                    className={`${isViewMode ? "bg-slate-50/50" : "bg-white"} rounded-xl p-3 border ${isViewMode ? "border-slate-100" : "border-slate-200"} transition-all duration-200 ${!isViewMode && viewEditMember.statusId !== 12 ? "hover:border-indigo-300" : ""}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Shield className="h-3.5 w-3.5 text-slate-400" />
                      <p className="text-[10px] text-slate-500 font-medium">
                        Role
                      </p>
                    </div>
                    {isViewMode || viewEditMember.statusId === 12 ? (
                      <p className="text-sm font-medium text-slate-800">
                        {viewEditMember.role || "Member"}
                      </p>
                    ) : (
                      <select
                        value={viewEditMember.role}
                        onChange={(e) =>
                          setViewEditMember({
                            ...viewEditMember,
                            role: e.target.value,
                          })
                        }
                        className="w-full mt-0.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all cursor-pointer"
                      >
                        <option value="Member">Member</option>
                        <option value="Pastor">Pastor</option>
                        <option value="Secretary">Secretary</option>
                        <option value="Treasurer">Treasurer</option>
                        <option value="Admin">Admin</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Notes - Always visible, especially for approval status */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`h-5 w-0.5 rounded-full ${viewEditMember.statusId === 12 ? "bg-gradient-to-b from-amber-500 to-orange-500" : "bg-gradient-to-b from-purple-500 to-pink-500"}`}
                  />
                  <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    {viewEditMember.statusId === 12
                      ? "Review Notes (Required for Approval)"
                      : "Review Notes"}
                  </h4>
                  {viewEditMember.statusId === 12 && (
                    <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-mono font-bold">
                      IMPORTANT
                    </span>
                  )}
                </div>
                <div
                  className={`${viewEditMember.statusId === 12 ? "bg-amber-50" : "bg-purple-50"} rounded-xl p-4 border ${viewEditMember.statusId === 12 ? "border-amber-200" : "border-purple-200"} transition-all duration-200`}
                >
                  {viewEditMember.review_notes ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div
                          className={`h-5 w-5 rounded-full ${viewEditMember.statusId === 12 ? "bg-amber-200" : "bg-purple-200"} flex items-center justify-center flex-shrink-0 mt-0.5`}
                        >
                          <FileText
                            className={`h-3 w-3 ${viewEditMember.statusId === 12 ? "text-amber-600" : "text-purple-600"}`}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {viewEditMember.review_notes}
                          </p>
                          {viewEditMember.reviewed_by && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Reviewed by: {viewEditMember.reviewed_by}
                            </p>
                          )}
                          {viewEditMember.reviewed_at && (
                            <p className="text-[10px] text-slate-400">
                              Reviewed on:{" "}
                              {new Date(
                                viewEditMember.reviewed_at,
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {viewEditMember.statusId === 12 && (
                        <div className="mt-2 bg-amber-100/50 rounded-lg p-2 border border-amber-200">
                          <p className="text-[10px] text-amber-700 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            This member is pending approval. Please review the
                            notes above before making a decision.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-slate-400" />
                      <p className="text-sm text-slate-400 italic">
                        No review notes available
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 w-0.5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                  <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Notes & Records
                  </h4>
                </div>
                <div
                  className={`${isViewMode ? "bg-slate-50/50" : "bg-white"} rounded-xl p-3 border ${isViewMode ? "border-slate-100" : "border-slate-200"} transition-all duration-200 ${!isViewMode && viewEditMember.statusId !== 12 ? "hover:border-indigo-300" : ""}`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-[10px] text-slate-500 font-medium">
                      Notes / Favorite Verse
                    </p>
                  </div>
                  {isViewMode || viewEditMember.statusId === 12 ? (
                    <p className="text-sm text-slate-700 leading-relaxed min-h-[60px]">
                      {viewEditMember.notes || "No notes available"}
                    </p>
                  ) : (
                    <textarea
                      value={viewEditMember.notes}
                      onChange={(e) =>
                        setViewEditMember({
                          ...viewEditMember,
                          notes: e.target.value,
                        })
                      }
                      rows="4"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white transition-all resize-none"
                      placeholder="Add notes or special concerns..."
                    />
                  )}
                </div>
              </div>

              {/* Application Form */}
              {viewEditMember.formPdfUrl && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                      Application Form
                    </p>
                  </div>
                  <a
                    href={viewEditMember.formPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all duration-200 shadow-sm border border-indigo-100"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      View Application Form (PDF)
                    </span>
                  </a>
                </div>
              )}

              {/* Rejection Info (if rejected) */}
              {viewEditMember.rejectedReason && (
                <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-4 border border-rose-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600" />
                    <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                      Rejection Reason
                    </p>
                  </div>
                  <p className="text-sm text-rose-800 leading-relaxed">
                    {viewEditMember.rejectedReason}
                  </p>
                </div>
              )}

              {/* Baptised Date & Signature Section (if available) */}
              {viewEditMember.baptisedDate && (
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-sky-600" />
                    <p className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                      Baptised Date
                    </p>
                  </div>
                  <p className="text-sm text-sky-800 font-medium">
                    {viewEditMember.baptisedDate}
                  </p>
                </div>
              )}

              {viewEditMember.signature_url && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-2">
                    <PenTool className="h-4 w-4 text-emerald-600" />
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      Member Signature
                    </p>
                  </div>
                  <img
                    src={viewEditMember.signature_url}
                    alt="Member Signature"
                    className="h-12 w-auto object-contain border border-emerald-200 rounded-lg p-1 bg-white"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </form>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm p-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowViewEditModal(false)}
                className="px-5 py-2.5 border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all duration-200 hover:border-slate-300"
              >
                {isViewMode || viewEditMember.statusId === 12
                  ? "Close"
                  : "Cancel"}
              </button>
              {!isViewMode && viewEditMember.statusId !== 12 && (
                <button
                  type="submit"
                  onClick={handleViewEditSave}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              )}
              {viewEditMember.statusId === 12 && (
                <button
                  type="button"
                  onClick={() => setShowViewEditModal(false)}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Understood
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* APPROVAL MODAL - Modern */}
      {showApprovalModal && approvalMember && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div
              className={`relative px-6 py-5 ${approvalAction === "approve" ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-rose-600 to-red-600"}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2 border border-white/30">
                    {approvalAction === "approve" ? (
                      <ThumbsUp className="h-3 w-3 text-white" />
                    ) : (
                      <ThumbsDown className="h-3 w-3 text-white" />
                    )}
                    <span className="text-[8px] font-mono uppercase font-bold text-white tracking-wider">
                      {approvalAction === "approve"
                        ? "APPROVE MEMBER"
                        : "REJECT APPLICATION"}
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-white text-lg tracking-tight">
                    {approvalAction === "approve"
                      ? "Confirm Approval"
                      : "Confirm Rejection"}
                  </h3>
                  <p className="text-[10px] text-white/80 mt-0.5">
                    {approvalAction === "approve"
                      ? `${approvalMember.firstName} ${approvalMember.lastName} will be activated`
                      : `Provide reason for rejecting ${approvalMember.firstName} ${approvalMember.lastName}`}
                  </p>
                </div>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Member Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                {approvalMember.profilePic ? (
                  <img
                    src={approvalMember.profilePic}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {approvalMember.firstName?.[0]}
                    {approvalMember.lastName?.[0]}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-slate-800">
                    {approvalMember.firstName} {approvalMember.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {approvalMember.emailAdd}
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                  {approvalMember.churchName}
                </span>
              </div>

              {/* Review Info */}
              {approvalMember.reviewNotes && (
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                  <p className="text-[9px] text-amber-600 font-semibold uppercase tracking-wider">
                    Review Notes
                  </p>
                  <p className="text-sm text-amber-800 mt-0.5">
                    {approvalMember.reviewNotes}
                  </p>
                </div>
              )}

              {/* Rejection Reason Input */}
              {approvalAction === "reject" && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Reason for Rejection{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={approvalReason}
                    onChange={(e) => setApprovalReason(e.target.value)}
                    rows="3"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                    placeholder="Provide a clear reason for rejecting this application..."
                  />
                  {approvalReason.length === 0 && (
                    <p className="text-[10px] text-rose-500">
                      A reason is required for rejection
                    </p>
                  )}
                </div>
              )}

              {/* Approval Confirmation */}
              {approvalAction === "approve" && (
                <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                  <p className="text-sm text-emerald-700 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    This action cannot be undone. The member will be activated.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprovalConfirm}
                disabled={
                  isSubmittingApproval ||
                  (approvalAction === "reject" && !approvalReason.trim())
                }
                className={`flex-1 py-2.5 font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  approvalAction === "approve"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg"
                    : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-md hover:shadow-lg"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmittingApproval ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {approvalAction === "approve" ? (
                      <>
                        <ThumbsUp className="h-4 w-4" />
                        Confirm Approval
                      </>
                    ) : (
                      <>
                        <ThumbsDown className="h-4 w-4" />
                        Confirm Rejection
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER MODAL - Modern */}
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
                      : "Add New Member Profile"}
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

            <form
              onSubmit={editingMember ? handleUpdateMember : handleAddMember}
              className="p-6 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
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
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
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
              </div>

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
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={newMember.phoneNumber}
                      onChange={(e) =>
                        setNewMember({
                          ...newMember,
                          phoneNumber: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                      placeholder="+63 9xx xxx xxxx"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Birth Date <span className="text-rose-500">*</span>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Church
                  </label>
                  <select
                    value={newMember.churchID}
                    onChange={(e) =>
                      setNewMember({
                        ...newMember,
                        churchID: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer transition-all"
                  >
                    {churches.map((church) => (
                      <option key={church.id} value={church.id}>
                        {church.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Role
                  </label>
                  <select
                    value={newMember.role}
                    onChange={(e) =>
                      setNewMember({ ...newMember, role: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer transition-all"
                  >
                    <option value="Member">Member</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> Notes
                </label>
                <textarea
                  value={newMember.notes}
                  onChange={(e) =>
                    setNewMember({ ...newMember, notes: e.target.value })
                  }
                  rows="3"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[80px] bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white resize-none"
                  placeholder="Insert notes or special concerns..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <Image className="h-3.5 w-3.5" /> Profile Photo
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  value={newMember.profilePic}
                  onChange={(e) =>
                    setNewMember({ ...newMember, profilePic: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all hover:bg-white"
                />
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
                form="member-file-form"
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{editingMember ? "Save Changes" : "Add Member"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FINANCE MODAL - Modern */}
      {showFinanceModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col my-8 animate-in zoom-in-95 duration-300">
            <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-amber-500/20 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2 border border-amber-500/30">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[8px] font-mono uppercase font-bold text-amber-300 tracking-wider">
                      LEDGER SYSTEM
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-white text-lg tracking-tight">
                    {editingFinance ? "Edit Transaction" : "Add Transaction"}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {editingFinance
                      ? "Edit transaction details securely"
                      : "Record a new financial transaction"}
                  </p>
                </div>
                <button
                  onClick={() => setShowFinanceModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form
              onSubmit={editingFinance ? handleUpdateFinance : handleAddFinance}
              className="p-6 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> Transaction Type *
                  </label>
                  <select
                    value={newFinance.transType}
                    onChange={(e) =>
                      setNewFinance({
                        ...newFinance,
                        transType: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none cursor-pointer transition-all"
                  >
                    <option value="Offering">Offering</option>
                    <option value="Donation">Donation</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" /> Amount *
                  </label>
                  <input
                    type="number"
                    required
                    value={newFinance.amount}
                    onChange={(e) =>
                      setNewFinance({ ...newFinance, amount: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newFinance.date}
                    onChange={(e) =>
                      setNewFinance({ ...newFinance, date: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <UserIcon className="h-3.5 w-3.5" /> Contributor
                  </label>
                  <input
                    type="text"
                    value={newFinance.contributorName}
                    onChange={(e) =>
                      setNewFinance({
                        ...newFinance,
                        contributorName: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                    placeholder="Contributor name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> Contributor Email
                </label>
                <input
                  type="email"
                  value={newFinance.contributorEmailAdd}
                  onChange={(e) =>
                    setNewFinance({
                      ...newFinance,
                      contributorEmailAdd: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                  placeholder="contributor@church.org"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> Description *
                </label>
                <textarea
                  required
                  value={newFinance.description}
                  onChange={(e) =>
                    setNewFinance({
                      ...newFinance,
                      description: e.target.value,
                    })
                  }
                  rows="3"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[80px] bg-slate-50 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all hover:bg-white resize-none"
                  placeholder="Transaction description..."
                />
              </div>
            </form>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowFinanceModal(false)}
                className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer uppercase tracking-wide"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="finance-form"
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide"
              >
                <CheckCircle className="h-4 w-4" />
                <span>
                  {editingFinance ? "Save Changes" : "Add Transaction"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST MODAL - Modern */}
      {showPostModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col my-8 animate-in zoom-in-95 duration-300">
            <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2 border border-emerald-500/30">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-mono uppercase font-bold text-emerald-300 tracking-wider">
                      CONTENT SYSTEM
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-white text-lg tracking-tight">
                    {editingPost ? "Edit Post" : "Create Post"}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {editingPost ? "Edit post content" : "Publish a new post"}
                  </p>
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form
              onSubmit={editingPost ? handleUpdatePost : handleAddPost}
              className="p-6 space-y-4 overflow-y-auto max-h-[60vh] custom-scrollbar"
            >
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all hover:bg-white"
                  placeholder="Post title..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Category
                  </label>
                  <select
                    value={newPost.category}
                    onChange={(e) =>
                      setNewPost({ ...newPost, category: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer transition-all"
                  >
                    <option value="news">News</option>
                    <option value="announcement">Announcement</option>
                    <option value="study">Bible Study</option>
                    <option value="event">Event</option>
                    <option value="featured">Featured</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Affiliation
                  </label>
                  <select
                    value={newPost.affiliation}
                    onChange={(e) =>
                      setNewPost({ ...newPost, affiliation: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none cursor-pointer transition-all"
                  >
                    <option value="Global">Global</option>
                    <option value="Naga">Naga</option>
                    <option value="Pinamungajan">Pinamungajan</option>
                    <option value="Samar">Samar</option>
                    <option value="Dulag">Dulag</option>
                    <option value="Aloguinsan">Aloguinsan</option>
                    <option value="Mandaue">Mandaue</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <Image className="h-3.5 w-3.5" /> Image Banner URL
                </label>
                <input
                  type="text"
                  value={newPost.imageBanner}
                  onChange={(e) =>
                    setNewPost({ ...newPost, imageBanner: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all hover:bg-white"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> Summary *
                </label>
                <textarea
                  required
                  value={newPost.summary}
                  onChange={(e) =>
                    setNewPost({ ...newPost, summary: e.target.value })
                  }
                  rows="2"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[60px] bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all hover:bg-white resize-none"
                  placeholder="Short summary..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" /> Content *
                </label>
                <textarea
                  required
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  rows="5"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[120px] bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all hover:bg-white resize-none"
                  placeholder="Full content..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <Image className="h-3.5 w-3.5" /> Additional Images
                </label>
                <input
                  type="text"
                  value={newPost.images}
                  onChange={(e) =>
                    setNewPost({ ...newPost, images: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all hover:bg-white"
                  placeholder="https://image1.jpg, https://image2.jpg"
                />
                <p className="text-[9px] text-slate-500 font-mono">
                  Separate multiple URLs with commas
                </p>
              </div>
            </form>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer uppercase tracking-wide"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="post-form"
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide"
              >
                <CheckCircle className="h-4 w-4" />
                <span>{editingPost ? "Save Changes" : "Publish Post"}</span>
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
    </div>
  );
}
