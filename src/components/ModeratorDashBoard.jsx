import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Shield,
  Calendar,
  BookOpen,
  Database,
  Search,
  UserCheck,
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
  FileText,
  Download,
  ThumbsUp,
  ThumbsDown,
  Clock,
  NotebookPen,
  LayoutDashboard,
} from "lucide-react";
import { supabase } from "../supabase-client";
import CollapsibleSidebar from "./Shared/CollapsibleSidebar";

export default function ModeratorDashboard({ userData, session }) {
  const [activeTab, setActiveTab] = useState("forReview");
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Members State - Only show applications that need review
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  // Finances State (View Only)
  const [finances, setFinances] = useState([]);
  const [financeSearch, setFinanceSearch] = useState("");
  const [financeCategoryFilter, setFinanceCategoryFilter] = useState("All");
  const [financeCurrentPage, setFinanceCurrentPage] = useState(1);
  const financesPerPage = 8;

  // Posts State (View Only)
  const [posts, setPosts] = useState([]);
  const [postSearch, setPostSearch] = useState("");
  const [postCategoryFilter, setPostCategoryFilter] = useState("All");

  // Stats
  const [stats, setStats] = useState({
    pendingReviews: 0,
    totalFinances: 0,
    totalPosts: 0,
    totalOfferings: 0,
    totalDonations: 0,
    totalExpenses: 0,
  });

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  // Update stats when data changes
  useEffect(() => {
    calculateStats();
  }, [members, finances, posts]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchPendingMembers(), fetchFinances(), fetchPosts()]);
    setLoading(false);
  };

  // ==================== PENDING MEMBERS (For Review) ====================
  const fetchPendingMembers = async () => {
    const { data, error } = await supabase
      .from("members")
      .select(
        `
        *,
        churches(id, name),
        members_status!members_statusId_fkey(id, status)
      `,
      )
      .eq("statusId", 10)
      .eq("churchID", userData.churches.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending members:", error);
      setErrorMsg("Failed to load pending applications");
      setTimeout(() => setErrorMsg(""), 3000);
    } else {
      const transformedMembers =
        data?.map((member) => ({
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
          review_notes: member.reviewNotes,
          created_at: member.created_at,
          createdBy: member.createdBy,
          baptisedDate: member.baptisedDate,
          middleName: member.middleName,
        })) || [];
      setMembers(transformedMembers);

      console.log("Transformed Data: ", transformedMembers);
    }
  };

  // Approve Member - Set status to "Approved" (4)
  const handleApproveMember = async () => {
    if (!selectedMember) return;

    setIsApproving(true);
    const { error } = await supabase
      .from("members")
      .update({
        statusId: 12,
        review_notes: reviewNotes || null,
        reviewed_by: session?.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedMember.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(
        `${selectedMember.firstName} ${selectedMember.lastName}'s application has been approved and forwarded to Admin.`,
      );
      await fetchPendingMembers();
      setShowReviewModal(false);
      setSelectedMember(null);
      setReviewNotes("");
    }
    setIsApproving(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  // Reject Member - Set status to "Rejected in Review" (5)
  const handleRejectMember = async () => {
    if (!selectedMember) return;

    if (!reviewNotes.trim()) {
      setErrorMsg("Please provide a reason for rejection");
      return;
    }

    setIsApproving(true);
    const { error } = await supabase
      .from("members")
      .update({
        statusId: 13,
        rejected_reason: reviewNotes,
        //review_notes: reviewNotes,
        reviewed_by: session?.user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedMember.id);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg(
        `${selectedMember.firstName} ${selectedMember.lastName}'s application has been rejected.`,
      );
      await fetchPendingMembers();
      setShowReviewModal(false);
      setSelectedMember(null);
      setReviewNotes("");
    }
    setIsApproving(false);
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 3000);
  };

  // ==================== FINANCES (View Only) ====================
  const fetchFinances = async () => {
    const { data, error } = await supabase
      .from("finances")
      .select("*")
      .eq("churchID", userData.churches.id)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching finances:", error);
    } else {
      setFinances(data || []);
    }
  };

  // ==================== POSTS (View Only) ====================
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
      pendingReviews: members.length,
      totalFinances: finances.length,
      totalPosts: posts.length,
      totalOfferings,
      totalDonations,
      totalExpenses,
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
          m.churchName?.toLowerCase().includes(term),
      );
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    return filtered;
  }, [members, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const paginatedMembers = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(offset, offset + itemsPerPage);
  }, [filteredMembers, currentPage]);

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

  const financeTotalPages = Math.ceil(
    filteredFinances.length / financesPerPage,
  );

  const paginatedFinances = useMemo(() => {
    const offset = (financeCurrentPage - 1) * financesPerPage;
    return filteredFinances.slice(offset, offset + financesPerPage);
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
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    setFinanceCurrentPage(1);
  }, [financeSearch, financeCategoryFilter]);

  const navigationItems = [
    {
      id: "forReview",
      icon: Clock,
      label: "Pending Applications",
      color: "amber",
    },
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
          <p className="text-slate-500 text-sm">
            Loading moderator dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <CollapsibleSidebar
        title="Moderator Console"
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeItem={activeTab}
        onSelect={setActiveTab}
        items={navigationItems}
        footerTitle="Moderator Access"
        footerText="Review and moderate member applications."
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
        {/* {errorMsg && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )} */}

        {/* Main Content */}
        <main className="p-6">
          {/* PENDING APPLICATIONS TAB */}
          {activeTab === "forReview" && (
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
                          <span>Moderator Workspace</span>
                        </span>
                      </div>
                      <div className="h-3 w-px bg-slate-600 hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-sans">
                          Localized Context:
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          {userData.churches.name || ""} Church
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
                      Application Review &{" "}
                      <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        Moderation Center
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
                      Review and moderate member applications submitted by local
                      church secretaries.
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
                          Application Management
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center">
                          <Shield className="h-3 w-3 text-sky-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Secure Review
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applications Panel */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-sm font-sans font-extrabold text-slate-800 uppercase tracking-wider">
                          Pending Applications
                        </h2>
                        <span className="text-[9px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-mono font-bold">
                          AWAITING REVIEW
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans ml-10">
                        Review membership applications from the{" "}
                        <span className="font-bold text-amber-600">
                          {userData?.churches?.name || "Naga"}
                        </span>{" "}
                        Church.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span className="text-[9px] font-mono text-amber-600">
                        {filteredMembers.length} Pending Applications
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
                        placeholder="Search by name, email, or church..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none bg-slate-50 hover:bg-white transition"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                      >
                        <option value="All">All Status</option>
                        <option value="For Review">For Review</option>
                      </select>
                    </div>
                  </div>
                  {searchTerm && (
                    <div className="mt-2 text-xs text-slate-500">
                      Found {filteredMembers.length} result
                      {filteredMembers.length !== 1 ? "s" : ""} for "
                      {searchTerm}"
                    </div>
                  )}
                </div>

                {/* Applications Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-mono font-bold uppercase tracking-wider border-b-2 border-slate-200">
                        <th className="p-4">Ref ID</th>
                        <th className="p-4">Applicant</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Church</th>
                        <th className="p-4">Submitted</th>
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
                                <Clock className="h-8 w-8 text-slate-300" />
                              </div>
                              <p className="text-sm text-slate-400 italic font-sans">
                                {searchTerm
                                  ? `No applications found matching "${searchTerm}"`
                                  : `No pending applications for ${userData?.churches?.name || "Naga"} church.`}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedMembers.map((member, idx) => (
                          <tr
                            key={member.id}
                            className="hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-transparent transition-all duration-200 group"
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
                                    alt={`${member.firstName}`}
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
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setReviewNotes("");
                                    setShowReviewModal(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 bg-amber-100 hover:bg-amber-600 text-amber-700 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>Review</span>
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
                  <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
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
                          <span className="font-extrabold text-amber-600">
                            {filteredMembers.length}
                          </span>{" "}
                          applications
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
                          className="relative inline-flex items-center rounded-l-xl px-3 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="ml-1 text-xs font-medium hidden sm:inline">
                            Previous
                          </span>
                        </button>
                        {Array.from(
                          { length: Math.min(totalPages, 5) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2)
                              pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`relative inline-flex items-center justify-center min-w-[36px] px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                                  currentPage === pageNum
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
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
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

          {/* FINANCES TAB (View Only) */}
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
                          <span>Financial Ledger (Read Only)</span>
                        </span>
                      </div>
                      <div className="h-3 w-px bg-slate-600 hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-sans">
                          Localized Context:
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          {userData.churches.name || ""} Church
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
                      Financial Ledger &{" "}
                      <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        Transaction Viewer
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
                      View church offerings, donations, and expenses. (Read Only
                      Access)
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
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {paginatedFinances.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
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
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {financeTotalPages > 1 && (
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
                            Math.min(financeTotalPages, p + 1),
                          )
                        }
                        disabled={financeCurrentPage === financeTotalPages}
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

          {/* POSTS TAB (View Only) */}
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
                          <span>Content Viewer (Read Only)</span>
                        </span>
                      </div>
                      <div className="h-3 w-px bg-slate-600 hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-sans">
                          Localized Context:
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {userData.churches.name || ""} Church
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
                      View community announcements and news updates. (Read Only
                      Access)
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* REVIEW MODAL */}
      {showReviewModal && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-amber-600" />
                </div>
                <h2 className="text-lg font-bold">Review Application</h2>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message Display INSIDE Modal */}
            {errorMsg && (
              <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span>{errorMsg}</span>
                <button
                  onClick={() => setErrorMsg("")}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="p-6 space-y-4">
              {/* Applicant Information */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">
                  Applicant Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Full Name</p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedMember.firstName} {selectedMember.middleName}{" "}
                      {selectedMember.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-slate-700">
                      {selectedMember.emailAdd}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm text-slate-700">
                      {selectedMember.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Birth Date</p>
                    <p className="text-sm text-slate-700">
                      {selectedMember.birthDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Baptised Date</p>
                    <p className="text-sm text-slate-700">
                      {selectedMember.baptisedDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Church</p>
                    <p className="text-sm text-slate-700">
                      {selectedMember.churchName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Submitted</p>
                    <p className="text-sm text-slate-700">
                      {new Date(selectedMember.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Form PDF */}
              {selectedMember.formPdfUrl && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">
                    Application Form
                  </h3>
                  <a
                    href={selectedMember.formPdfUrl}
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

              {/* Notes */}
              {selectedMember.notes && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">
                    Additional Notes
                  </h3>
                  <p className="text-sm text-slate-600">
                    {selectedMember.notes}
                  </p>
                </div>
              )}

              {/* Review Notes */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">
                  Review Notes
                </h3>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="Enter review notes or reason for rejection..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-4 border-t flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectMember}
                disabled={isApproving}
                className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition flex items-center justify-center gap-2"
              >
                <ThumbsDown className="h-4 w-4" />
                Reject
              </button>
              <button
                onClick={handleApproveMember}
                disabled={isApproving}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                <ThumbsUp className="h-4 w-4" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
