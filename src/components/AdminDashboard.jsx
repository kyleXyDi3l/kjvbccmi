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
} from "lucide-react";
import { supabase } from "../supabase-client";

export default function AdminDashboard({ userData, session }) {
  const [activeTab, setActiveTab] = useState("members");
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Members State
  const [members, setMembers] = useState([]);
  const [churches, setChurches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [churchFilter, setChurchFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pending Approvals State (members with status = 4 - Approved by Moderator)
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [approvalSearchTerm, setApprovalSearchTerm] = useState("");
  const [approvalChurchFilter, setApprovalChurchFilter] = useState("All");
  const [approvalCurrentPage, setApprovalCurrentPage] = useState(1);
  const approvalsPerPage = 10;

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
  const financesPerPage = 10;
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

  // ==================== PENDING APPROVALS (Status = 4 - Approved by Moderator) ====================
  const fetchPendingApprovals = async () => {
    const { data, error } = await supabase
      .from("members")
      .select(`
        *,
        churches(id, name),
        members_status!members_statusId_fkey(id, status)
      `)
      .eq("statusId", 12) // 4 = Approved by Moderator, waiting for Admin final approval
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending approvals:", error);
    } else {
      const transformedData = data?.map(member => ({
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
        statusId: member.status,
        status: member.members_status?.status,
        formPdfUrl: member.formPdfUrl,
        reviewNotes: member.reviewNotes,
        rejectedReason: member.rejectedReason,
        createdAt: member.created_at,
        createdBy: member.createdBy,
      })) || [];
      setPendingApprovals(transformedData);
    }
  };

  // Approve member application (set to Active status)
  const handleApproveApplication = async (member) => {
    if (!confirm(`Approve ${member.firstName} ${member.lastName}'s application? This will activate their membership.`)) return;

    setLoading(true);
    const { error } = await supabase
      .from("members")
      .update({ 
        statusId: 14, // 6 = Active
        reviewed_by: session?.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", member.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(`${member.firstName} ${member.lastName} has been approved and activated.`);
      await fetchPendingApprovals();
      await fetchMembers();
    }
    setLoading(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  // Reject application (send back to secretary for correction)
  const handleRejectApplication = async (member) => {
    const reason = prompt("Please provide a reason for rejection (will be sent to secretary):");
    if (!reason) return;

    setLoading(true);
    const { error } = await supabase
      .from("members")
      .update({ 
        statusId: 13, // 5 = Rejected in Review - goes back to secretary
        rejected_reason: reason,
        reviewed_by: session?.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", member.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(`${member.firstName} ${member.lastName}'s application has been rejected and sent back to secretary.`);
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
      .select(`
        *,
        churches(id, name),
        members_status!members_statusId_fkey(id, status)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching members:", error);
      setErrorMsg("Failed to load members");
    } else {
      const transformedData = data?.map(member => ({
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
        statusId: member.status,
        status: member.members_status?.status,
        formPdfUrl: member.formPdfUrl,
        createdAt: member.created_at,
        createdBy: member.createdBy,
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
      status: 6, // Active status
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

    const amount = newFinance.transType === "Expense" 
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

    const amount = newFinance.transType === "Expense"
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
      .filter(f => f.transType === "Offering")
      .reduce((sum, f) => sum + (f.amount > 0 ? f.amount : 0), 0);
    
    const totalDonations = finances
      .filter(f => f.transType === "Donation")
      .reduce((sum, f) => sum + (f.amount > 0 ? f.amount : 0), 0);
    
    const totalExpenses = finances
      .filter(f => f.transType === "Expense")
      .reduce((sum, f) => sum + Math.abs(f.amount), 0);

    setStats({
      totalMembers: members.filter(m => m.statusId === 6).length, // Only active members
      totalFinances: finances.length,
      totalPosts: posts.length,
      totalOfferings,
      totalDonations,
      totalExpenses,
      pendingApprovals: pendingApprovals.length,
    });
  };

  const vaultTotal = stats.totalOfferings + stats.totalDonations - stats.totalExpenses;

  // ==================== FILTERING ====================
  const filteredMembers = useMemo(() => {
    let filtered = [...members];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.firstName?.toLowerCase().includes(term) ||
        m.lastName?.toLowerCase().includes(term) ||
        m.emailAdd?.toLowerCase().includes(term) ||
        m.id?.toString().includes(term)
      );
    }
    
    if (roleFilter !== "All") {
      filtered = filtered.filter(m => m.role === roleFilter);
    }
    
    if (statusFilter !== "All") {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    if (churchFilter !== "All") {
      filtered = filtered.filter(m => m.churchId === parseInt(churchFilter));
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
      filtered = filtered.filter(m =>
        m.firstName?.toLowerCase().includes(term) ||
        m.lastName?.toLowerCase().includes(term) ||
        m.emailAdd?.toLowerCase().includes(term)
      );
    }

    if (approvalChurchFilter !== "All") {
      filtered = filtered.filter(m => m.churchId === parseInt(approvalChurchFilter));
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
      filtered = filtered.filter(f =>
        f.receiptNumber?.toLowerCase().includes(term) ||
        f.description?.toLowerCase().includes(term) ||
        f.contributorName?.toLowerCase().includes(term)
      );
    }
    
    if (financeCategoryFilter !== "All") {
      filtered = filtered.filter(f => f.transType === financeCategoryFilter);
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
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(term) ||
        p.content?.toLowerCase().includes(term)
      );
    }
    
    if (postCategoryFilter !== "All") {
      filtered = filtered.filter(p => p.category === postCategoryFilter);
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

  if (loading && members.length === 0 && finances.length === 0 && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen p-6">
      {/* Success/Error Messages */}
      {(successMsg || errorMsg) && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top duration-300">
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* HEADER HERO AREA */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-8 border border-slate-700/50 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-[10px] bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30 text-indigo-300 font-mono font-black uppercase tracking-widest px-3 py-1 rounded-full">
                Global Administration Portal
              </span>
            </div>
            <h1 className="text-3xl font-sans font-black tracking-tight">
              Superuser Control{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Command Center
              </span>
            </h1>
            <p className="text-sm text-slate-400 font-sans mt-1 max-w-2xl">
              Oversee active congregational campuses, manage financial ledgers, and control content across all church platforms.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-slate-700 shrink-0">
            <div className="px-3 border-r border-slate-700 text-left">
              <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Users className="h-2.5 w-2.5" />
                Active Members
              </span>
              <span className="text-2xl font-sans font-black text-white">{stats.totalMembers}</span>
            </div>
            <div className="px-3 border-r border-slate-700 text-left">
              <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                Pending Approvals
              </span>
              <span className="text-2xl font-sans font-black text-amber-400">{stats.pendingApprovals}</span>
            </div>
            <div className="px-3 border-r border-slate-700 text-left">
              <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Newspaper className="h-2.5 w-2.5" />
                Posts
              </span>
              <span className="text-2xl font-sans font-black text-sky-400">{stats.totalPosts}</span>
            </div>
            <div className="px-3 text-left">
              <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Landmark className="h-2.5 w-2.5" />
                Vault Balance
              </span>
              <span className={`text-xl font-sans font-black block truncate mt-1 ${vaultTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                ₱{vaultTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[640px]">
        <div className="w-full lg:w-72 shrink-0 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 h-fit">
          <div className="p-4">
            <div className="space-y-1">
              <div className="pb-3 mb-3 border-b border-slate-100 px-2 flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">Menu Console</span>
                <span className="text-[8px] font-mono bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-black shadow-sm">SUPERUSER</span>
              </div>

              {[
                { id: "approvals", icon: Clock, label: "Member Approvals", color: "amber" },
                { id: "members", icon: Users, label: "Members & Users", color: "indigo" },
                { id: "finances", icon: Database, label: "Ledger & Vault", color: "amber" },
                { id: "posts", icon: BookOpen, label: "Updates & Dispatches", color: "emerald" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative w-full flex items-center gap-3 px-4 py-3 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-${tab.color}-600 to-${tab.color === "indigo" ? "purple" : tab.color === "amber" ? "orange" : "teal"}-600 text-white shadow-lg shadow-${tab.color}-500/25`
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <tab.icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? "text-white" : "text-slate-400"}`} />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  )}
                  {tab.id === "approvals" && stats.pendingApprovals > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-700">Access Lock</span>
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">Hardware verification active. Secure authentication enabled.</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[7px] font-mono text-emerald-600">SECURE CONNECTION</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* MEMBER APPROVALS TAB */}
          {activeTab === "approvals" && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-sans font-black text-slate-900">Member Applications Approval</h2>
                  <p className="text-sm text-slate-500">Review and approve member applications that have passed moderator review</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">{filteredApprovals.length} Pending Approval</span>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={approvalSearchTerm}
                    onChange={(e) => setApprovalSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>
                <select
                  value={approvalChurchFilter}
                  onChange={(e) => setApprovalChurchFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  <option value="All">All Churches</option>
                  {churches.map((church) => (
                    <option key={church.id} value={church.id}>{church.name}</option>
                  ))}
                </select>
              </div>

              {/* Approvals Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Church</th>
                      <th className="p-3 text-left">Submitted</th>
                      <th className="p-3 text-left">Application Form</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedApprovals.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-8 text-center text-slate-400">
                          No pending approvals found
                        </td>
                      </tr>
                    ) : (
                      paginatedApprovals.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50">
                          <td className="p-3 font-medium">
                            <div className="flex items-center gap-2">
                              {member.profilePic ? (
                                <img src={member.profilePic} alt="" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                                  {member.firstName?.[0]}{member.lastName?.[0]}
                                </div>
                              )}
                              <div>
                                <span>{member.firstName} {member.lastName}</span>
                                <button
                                  onClick={() => {
                                    setSelectedMemberDetail(member);
                                    setShowMemberDetailModal(true);
                                  }}
                                  className="ml-2 text-indigo-600 hover:text-indigo-800 text-xs"
                                >
                                  <Eye className="h-3 w-3 inline" /> View Details
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-slate-600">{member.emailAdd}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                              {member.churchName}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 text-xs">
                            {new Date(member.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            {member.formPdfUrl ? (
                              <a href={member.formPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800">
                                <FileText className="h-4 w-4" />
                                <span className="text-xs">View Form</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 text-xs">No form</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleApproveApplication(member)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg text-xs font-semibold transition-all duration-200"
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectApplication(member)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 hover:bg-rose-600 text-rose-700 hover:text-white rounded-lg text-xs font-semibold transition-all duration-200"
                              >
                                <ThumbsDown className="h-3.5 w-3.5" />
                                Reject
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
              {Math.ceil(filteredApprovals.length / approvalsPerPage) > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-slate-500">
                    Showing {Math.min(filteredApprovals.length, (approvalCurrentPage - 1) * approvalsPerPage + 1)} - {Math.min(approvalCurrentPage * approvalsPerPage, filteredApprovals.length)} of {filteredApprovals.length}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setApprovalCurrentPage(p => Math.max(1, p - 1))}
                      disabled={approvalCurrentPage === 1}
                      className="p-2 border rounded-lg disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setApprovalCurrentPage(p => Math.min(Math.ceil(filteredApprovals.length / approvalsPerPage), p + 1))}
                      disabled={approvalCurrentPage === Math.ceil(filteredApprovals.length / approvalsPerPage)}
                      className="p-2 border rounded-lg disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MEMBERS TAB - Updated with Church Filter and View Details */}
          {activeTab === "members" && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-sans font-black text-slate-900">Member Registry</h2>
                  <p className="text-sm text-slate-500">Manage church members and their roles</p>
                </div>
                <button
                  onClick={() => {
                    setEditingMember(null);
                    resetMemberForm();
                    setShowMemberModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-2 shadow-md"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </button>
              </div>

              {/* Filters - Added Church Filter */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  />
                </div>
                <select
                  value={churchFilter}
                  onChange={(e) => setChurchFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  <option value="All">All Churches</option>
                  {churches.map((church) => (
                    <option key={church.id} value={church.id}>{church.name}</option>
                  ))}
                </select>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
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
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Outreach">Outreach</option>
                </select>
              </div>

              {/* Members Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Phone</th>
                      <th className="p-3 text-left">Church</th>
                      <th className="p-3 text-left">Role</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedMembers.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-slate-400">
                          No members found
                        </td>
                      </tr>
                    ) : (
                      paginatedMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-xs">{member.id}</td>
                          <td className="p-3 font-medium">
                            <div className="flex items-center gap-2">
                              {member.profilePic ? (
                                <img src={member.profilePic} alt="" className="h-8 w-8 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                  {member.firstName?.[0]}{member.lastName?.[0]}
                                </div>
                              )}
                              <div>
                                <span>{member.firstName} {member.lastName}</span>
                                <button
                                  onClick={() => {
                                    setSelectedMemberDetail(member);
                                    setShowMemberDetailModal(true);
                                  }}
                                  className="ml-2 text-indigo-600 hover:text-indigo-800 text-xs"
                                >
                                  <Eye className="h-3 w-3 inline" /> View Details
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-slate-600">{member.emailAdd}</td>
                          <td className="p-3">{member.phoneNumber}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                              {member.churchName}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              member.role === "Admin" ? "bg-red-100 text-red-700" :
                              member.role === "Pastor" ? "bg-indigo-100 text-indigo-700" :
                              member.role === "Secretary" ? "bg-blue-100 text-blue-700" :
                              member.role === "Treasurer" ? "bg-emerald-100 text-emerald-700" :
                              "bg-slate-100 text-slate-700"
                            }`}>
                              {member.role || "Member"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                              member.status === "Active" ? "bg-emerald-100 text-emerald-700" : 
                              member.status === "Inactive" ? "bg-rose-100 text-rose-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${member.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                              {member.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingMember(member);
                                  setNewMember(member);
                                  setShowMemberModal(true);
                                }}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMember(member.id)}
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
              {Math.ceil(filteredMembers.length / itemsPerPage) > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-slate-500">
                    Showing {Math.min(filteredMembers.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border rounded-lg disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredMembers.length / itemsPerPage), p + 1))}
                      disabled={currentPage === Math.ceil(filteredMembers.length / itemsPerPage)}
                      className="p-2 border rounded-lg disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FINANCES TAB */}
          {activeTab === "finances" && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-sans font-black text-slate-900">Financial Ledger</h2>
                  <p className="text-sm text-slate-500">Track offerings, donations, and expenses</p>
                </div>
                <button
                  onClick={() => {
                    setEditingFinance(null);
                    resetFinanceForm();
                    setShowFinanceModal(true);
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition flex items-center gap-2 shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                  <p className="text-xs text-emerald-600 font-semibold">Offerings</p>
                  <p className="text-2xl font-bold text-emerald-700">₱{stats.totalOfferings.toLocaleString()}</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                  <p className="text-xs text-indigo-600 font-semibold">Donations</p>
                  <p className="text-2xl font-bold text-indigo-700">₱{stats.totalDonations.toLocaleString()}</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                  <p className="text-xs text-rose-600 font-semibold">Expenses</p>
                  <p className="text-2xl font-bold text-rose-700">₱{stats.totalExpenses.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4">
                  <p className="text-xs text-slate-400 font-semibold">Net Balance</p>
                  <p className="text-2xl font-bold text-emerald-400">₱{vaultTotal.toLocaleString()}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by receipt #, description, or contributor..."
                    value={financeSearch}
                    onChange={(e) => setFinanceSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  />
                </div>
                <select
                  value={financeCategoryFilter}
                  onChange={(e) => setFinanceCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  <option value="All">All Categories</option>
                  <option value="Offering">Offering</option>
                  <option value="Donation">Donation</option>
                  <option value="Expense">Expense</option>
                </select>
              </div>

              {/* Finances Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
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
                        <td colSpan="7" className="p-8 text-center text-slate-400">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      paginatedFinances.map((finance) => (
                        <tr key={finance.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-xs">{finance.receiptNumber}</td>
                          <td className="p-3">{finance.date}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              finance.transType === "Offering" ? "bg-emerald-100 text-emerald-700" :
                              finance.transType === "Donation" ? "bg-indigo-100 text-indigo-700" :
                              "bg-rose-100 text-rose-700"
                            }`}>
                              {finance.transType}
                            </span>
                          </td>
                          <td className="p-3 max-w-xs truncate">{finance.description}</td>
                          <td className="p-3">{finance.contributorName || "-"}</td>
                          <td className={`p-3 text-right font-semibold ${finance.amount < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                            {finance.amount < 0 ? "-" : "+"}₱{Math.abs(finance.amount).toLocaleString()}
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
                                onClick={() => handleDeleteFinance(finance.id)}
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
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-slate-500">
                    Showing {Math.min(filteredFinances.length, (financeCurrentPage - 1) * financesPerPage + 1)} - {Math.min(financeCurrentPage * financesPerPage, filteredFinances.length)} of {filteredFinances.length}
                  </p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setFinanceCurrentPage(p => Math.max(1, p - 1))}
                      disabled={financeCurrentPage === 1}
                      className="p-2 border rounded-lg disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setFinanceCurrentPage(p => Math.min(Math.ceil(filteredFinances.length / financesPerPage), p + 1))}
                      disabled={financeCurrentPage === Math.ceil(filteredFinances.length / financesPerPage)}
                      className="p-2 border rounded-lg disabled:opacity-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* POSTS TAB */}
          {activeTab === "posts" && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-sans font-black text-slate-900">Updates & Dispatches</h2>
                  <p className="text-sm text-slate-500">Manage homepage announcements and news</p>
                </div>
                <button
                  onClick={() => {
                    setEditingPost(null);
                    resetPostForm();
                    setShowPostModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition flex items-center gap-2 shadow-md"
                >
                  <Plus className="h-4 w-4" />
                  Create Post
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search posts by title..."
                    value={postSearch}
                    onChange={(e) => setPostSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  />
                </div>
                <select
                  value={postCategoryFilter}
                  onChange={(e) => setPostCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  <option value="All">All Categories</option>
                  <option value="news">News</option>
                  <option value="announcement">Announcement</option>
                  <option value="study">Bible Study</option>
                  <option value="event">Event</option>
                  <option value="featured">Featured</option>
                </select>
              </div>

              {/* Posts Grid */}
              <div className="grid grid-cols-1 gap-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 border rounded-xl">
                    No posts found
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div key={post.id} className="border rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              post.category === "urgent" ? "bg-rose-100 text-rose-700" :
                              post.category === "featured" ? "bg-amber-100 text-amber-700" :
                              "bg-indigo-100 text-indigo-700"
                            }`}>
                              {post.category}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(post.created_at).toLocaleDateString()}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${post.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                              {post.active ? "Published" : "Draft"}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900">{post.title}</h3>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{post.content}</p>
                          <p className="text-xs text-slate-400 mt-2">{post.affiliation} • {post.summary?.substring(0, 100)}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleTogglePostStatus(post)}
                            className={`p-2 rounded-lg transition ${
                              post.active ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {post.active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
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
        </div>
      </div>

      {/* MEMBER DETAIL MODAL */}
      {showMemberDetailModal && selectedMemberDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserIcon className="h-4 w-4 text-indigo-600" />
                </div>
                <h2 className="text-lg font-bold">Member Details</h2>
              </div>
              <button onClick={() => setShowMemberDetailModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-4 border-b">
                {selectedMemberDetail.profilePic ? (
                  <img src={selectedMemberDetail.profilePic} alt="" className="h-20 w-20 rounded-full object-cover" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedMemberDetail.firstName?.[0]}{selectedMemberDetail.lastName?.[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedMemberDetail.firstName} {selectedMemberDetail.lastName}</h3>
                  <p className="text-slate-500">{selectedMemberDetail.role || "Member"} • {selectedMemberDetail.churchName}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                    selectedMemberDetail.status === "Active" ? "bg-emerald-100 text-emerald-700" : 
                    selectedMemberDetail.status === "Inactive" ? "bg-rose-100 text-rose-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {selectedMemberDetail.status}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Email Address</p>
                  <p className="text-sm font-medium text-slate-800">{selectedMemberDetail.emailAdd}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Phone Number</p>
                  <p className="text-sm font-medium text-slate-800">{selectedMemberDetail.phoneNumber || "Not provided"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Birth Date</p>
                  <p className="text-sm font-medium text-slate-800">{selectedMemberDetail.birthDate || "Not provided"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Join Date</p>
                  <p className="text-sm font-medium text-slate-800">{selectedMemberDetail.joinDate}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedMemberDetail.notes && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Notes / Favorite Verse</p>
                  <p className="text-sm text-slate-700">{selectedMemberDetail.notes}</p>
                </div>
              )}

              {/* Application Form */}
              {selectedMemberDetail.formPdfUrl && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-2">Application Form</p>
                  <a 
                    href={selectedMemberDetail.formPdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Member Application Form (PDF)</span>
                    <Download className="h-4 w-4 ml-2" />
                  </a>
                </div>
              )}

              {/* Review Notes (if any) */}
              {selectedMemberDetail.reviewNotes && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-xs text-amber-600 font-semibold mb-1">Review Notes</p>
                  <p className="text-sm text-amber-800">{selectedMemberDetail.reviewNotes}</p>
                </div>
              )}

              {/* Rejection Reason (if any) */}
              {selectedMemberDetail.rejectedReason && (
                <div className="bg-rose-50 rounded-xl p-4 border border-rose-200">
                  <p className="text-xs text-rose-600 font-semibold mb-1">Rejection Reason</p>
                  <p className="text-sm text-rose-800">{selectedMemberDetail.rejectedReason}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end">
              <button
                onClick={() => setShowMemberDetailModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER MODAL */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">{editingMember ? "Edit Member" : "Add Member"}</h2>
              <button onClick={() => setShowMemberModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={editingMember ? handleUpdateMember : handleAddMember} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">First Name *</label>
                  <input type="text" required value={newMember.firstName} onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Last Name *</label>
                  <input type="text" required value={newMember.lastName} onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Email</label>
                <input type="email" value={newMember.emailAdd} onChange={(e) => setNewMember({ ...newMember, emailAdd: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Phone</label>
                <input type="text" value={newMember.phoneNumber} onChange={(e) => setNewMember({ ...newMember, phoneNumber: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Birth Date</label>
                  <input type="date" value={newMember.birthDate} onChange={(e) => setNewMember({ ...newMember, birthDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Join Date</label>
                  <input type="date" value={newMember.joinDate} onChange={(e) => setNewMember({ ...newMember, joinDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Church</label>
                  <select value={newMember.churchID} onChange={(e) => setNewMember({ ...newMember, churchID: parseInt(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                    {churches.map((church) => (
                      <option key={church.id} value={church.id}>{church.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Role</label>
                  <select value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                    <option value="Member">Member</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Notes</label>
                <textarea value={newMember.notes} onChange={(e) => setNewMember({ ...newMember, notes: e.target.value })} rows="3"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowMemberModal(false)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">
                  {editingMember ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FINANCE MODAL */}
      {showFinanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">{editingFinance ? "Edit Transaction" : "Add Transaction"}</h2>
              <button onClick={() => setShowFinanceModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={editingFinance ? handleUpdateFinance : handleAddFinance} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Transaction Type *</label>
                  <select value={newFinance.transType} onChange={(e) => setNewFinance({ ...newFinance, transType: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                    <option value="Offering">Offering</option>
                    <option value="Donation">Donation</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Amount *</label>
                  <input type="number" required value={newFinance.amount} onChange={(e) => setNewFinance({ ...newFinance, amount: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Date *</label>
                  <input type="date" required value={newFinance.date} onChange={(e) => setNewFinance({ ...newFinance, date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Contributor Name</label>
                  <input type="text" value={newFinance.contributorName} onChange={(e) => setNewFinance({ ...newFinance, contributorName: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Contributor Email</label>
                <input type="email" value={newFinance.contributorEmailAdd} onChange={(e) => setNewFinance({ ...newFinance, contributorEmailAdd: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Description *</label>
                <textarea required value={newFinance.description} onChange={(e) => setNewFinance({ ...newFinance, description: e.target.value })} rows="3"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="Transaction description..." />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowFinanceModal(false)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold">
                  {editingFinance ? "Save Changes" : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold">{editingPost ? "Edit Post" : "Create Post"}</h2>
              <button onClick={() => setShowPostModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={editingPost ? handleUpdatePost : handleAddPost} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Title *</label>
                <input type="text" required value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Category</label>
                  <select value={newPost.category} onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                    <option value="news">News</option>
                    <option value="announcement">Announcement</option>
                    <option value="study">Bible Study</option>
                    <option value="event">Event</option>
                    <option value="featured">Featured</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Affiliation</label>
                  <select value={newPost.affiliation} onChange={(e) => setNewPost({ ...newPost, affiliation: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
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
              <div>
                <label className="text-xs font-semibold text-slate-600">Image Banner URL</label>
                <input type="text" value={newPost.imageBanner} onChange={(e) => setNewPost({ ...newPost, imageBanner: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Summary *</label>
                <textarea required value={newPost.summary} onChange={(e) => setNewPost({ ...newPost, summary: e.target.value })} rows="2"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="Short summary..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Content *</label>
                <textarea required value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} rows="5"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="Full content..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Additional Images (comma separated)</label>
                <input type="text" value={newPost.images} onChange={(e) => setNewPost({ ...newPost, images: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" placeholder="https://image1.jpg, https://image2.jpg" />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowPostModal(false)} className="flex-1 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold">
                  {editingPost ? "Save Changes" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}