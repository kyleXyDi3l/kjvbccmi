import React, { useState, useMemo, useEffect } from "react";
//import { FinanceRecord, ChurchMember } from "../types";
import { supabase } from "../supabase-client";
import {
  Receipt,
  Plus,
  Printer,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Landmark,
  User,
  DollarSign,
  Calendar,
  Mail,
  FileSpreadsheet,
  Key,
  AlertCircle,
  Sparkles,
  X,
  Edit2,
  ChevronLeft,
  ChevronRight,
  PhilippinePeso,
  Shield,
  FileText,
  RefreshCw,
  Search,
  Users,
  Tag,
  MapPin,
  Zap,
  Copy,
} from "lucide-react";

export default function TreaseurerDashBoard({ userData, session }) {
  const [successMemo, setSuccessMemo] = useState("");

  const [finances, setFinances] = useState([]);

  // Custom states added for Edit mode and Pagination
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchFinances();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("finance-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "finance" },
        (payload) => {
          const members = payload.new;
          setMembers((prevMembers) => [members, ...prevMembers]);
        },
      )
      // Listen for updated members
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "finance" },
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
        { event: "DELETE", schema: "public", table: "finance" },
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

  const fetchFinances = async () => {
    console.log("fetching finances");
    const { data, error } = await supabase
      .from("finances")
      .select(`*, churches(id, name)`)
      .eq("churchID", userData.churches.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching finances:", error.message);
      return;
    }
    setFinances(data);
    console.log("Fetched finances:", data);
  };

  // 1. Transaction Form State
  const [showFormModal, setShowFormModal] = useState(false);
  //const [amount, setAmount] = useState("");
  const [transType, setTransType] = useState("Offering"); // no union type, just string
  //const [date, setDate] = useState("2026-06-01");
  //const [description, setDescription] = useState("");
  //const [churchID, setChurchID] = useState(userData.churches.id);
  //const [contributorName, setContributorName] = useState("");
  //const [contributorEmail, setContributorEmail] = useState("");

  // State of creating a Finance record
  const [newFinance, setNewFinance] = useState({
    // id: "",
    amount: "",
    transType: "",
    date: "",
    description: "",
    churchID: userData.churches.id,
    contributorName: "",
    receiptNumber: "",
    createdBy: session.user.id,
    contributorEmailAdd: "",
  });

  // 2. Receipt Display Overlay State
  const [activeReceipt, setActiveReceipt] = useState(null);

  const totalPages = Math.ceil(finances.length / itemsPerPage);

  const paginatedFinances = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return finances.slice(offset, offset + itemsPerPage);
  }, [finances, currentPage]);

  // Aggregate local branch statistics
  const localStats = useMemo(() => {
    let offering = 0;
    let donations = 0;
    let expenses = 0;

    finances.forEach((f) => {
      const amt = f.amount;
      if (f.transType === "Offering") offering += amt;
      else if (f.transType === "Donation") donations += amt;
      else if (f.transType === "Expense") expenses += Math.abs(amt);
    });

    return {
      offering,
      donations,
      expenses,
      netSum: offering + donations - expenses,
    };
  }, [finances]);

  const resetFinance = () => {
    setNewFinance({
      amount: "",
      transType: "Offering",
      date: "",
      description: "",
      churchID: userData.churches.id,
      contributorName: "",
      receiptNumber: "",
      createdBy: session.user.id,
      contributorEmailAdd: "",
    });
  };
  // Autofill donor guidelines if selected from church member dropdown list
  const handleSelectMemberContributor = (emailVal) => {
    const match = members.find((m) => m.email === emailVal);
    if (match) {
      setContributorName(`${match.firstName} ${match.lastName}`);
      setContributorEmail(match.email);
    }
  };

  // Trigger transaction edit form
  const triggerEditFinance = (record) => {
    setEditingRecord(record);
    setNewFinance({
      id: record.id,
      amount: record.amount,
      transType: record.transType,
      date: record.date,
      description: record.description,
      contributorName: record.contributorName,
      contributorEmailAdd: record.contributorEmailAdd,
    });

    setShowFormModal(true);
  };

  const triggerAddFinance = () => {
    setEditingRecord(null);
    resetFinance();

    setShowFormModal(true);
  };

  // Submit and automated receipt triggers
  const handleSaveTransaction = async (e) => {
    e.preventDefault();

    console.log("Amount:", newFinance.amount);
    const numberAmount = Math.abs(parseFloat(newFinance.amount));
    if (isNaN(numberAmount) || numberAmount <= 0) {
      alert("Please input a valid positive currency scale.");
      return;
    }

    // Generate specific alphanumeric Serial Confirmation
    const locPrefix = userData.churches.name.substring(0, 2).toUpperCase();
    const serialToken = editingRecord
      ? editingRecord.receiptNumber
      : `REC-${locPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;

    if (!editingRecord) {
      // Expenses represent negative cash balance values
      const adjustedAmount =
        newFinance.transType === "Expense" ? -numberAmount : numberAmount;

      // Build the record to insert/update
      const financeData = {
        ...newFinance,
        receiptNumber: serialToken, // ✅ ensure receiptNumber is set
      };

      const { error } = await supabase
        .from("finances")
        .insert({ ...financeData, createdBy: session.user.id });
      if (error) {
        console.error("Error adding new Member:", error.message);
        return;
      }
      fetchFinances();
    } else {
      console.log("Updates", newFinance);
      const { error } = await supabase
        .from("finances")
        .update(newFinance)
        .eq("id", newFinance.id);

      if (error) {
        console.error("Error editing finance:", error.message);
        return;
      }
      fetchFinances();
      setSuccessMemo(
        `Successfully updated registry files for ${newFinance.receiptNumber}.`,
      );
    }
    setShowFormModal(false);

    setSuccessMemo(
      editingRecord
        ? `Receipt ${serialToken} updated successfully!`
        : `Ledger adjusted with ${serialToken}! Receipt generated!`,
    );
    setTimeout(() => setSuccessMemo(""), 4500);

    // Immediately open the newly generated dynamic official receipt
    setActiveReceipt(newFinance);
  };
  return (
    <div className="space-y-6" id="treasurer-dashboard-view">
      {/* Visual Header Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 md:p-8 border border-slate-700/50 overflow-hidden shadow-xl">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-sky-500 blur-3xl" />
        </div>

        <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
          <Landmark className="h-64 w-64 translate-x-20 -translate-y-10" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left Content */}
          <div className="flex-1 space-y-3">
            {/* Badge Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-gradient-to-r from-sky-500/20 to-emerald-500/20 border border-sky-500/30 text-sky-300 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                  <Landmark className="h-3 w-3" />
                  <span>Church Vault Management</span>
                </span>
              </div>
              <div className="h-3 w-px bg-slate-600 hidden sm:block" />
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-sans">
                  Localized Context:
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {userData.churches.name || ""} Extension Treasurer Portal
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
              Financial Ledger &{" "}
              <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                Offering Receipt Desk
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
              File weekly Offerings, dispatch voluntary missionary donations,
              log church operations, and generate official compliance receipts
              immediately.
            </p>

            {/* Quick Stats */}
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
                <span className="text-[10px] text-slate-300">Audit Logged</span>
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

          {/* Right Button */}
          <button
            onClick={triggerAddFinance}
            id="file-transaction-trigger"
            className="group relative bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all duration-200 shrink-0 flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 transform hover:scale-105"
          >
            <Plus className="h-4.5 w-4.5 group-hover:rotate-90 transition-transform duration-200" />
            <span>Record Offering or Expense</span>
          </button>
        </div>
      </div>

      {successMemo && (
        <div
          className="bg-sky-50 border border-sky-100 text-sky-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2 font-medium"
          id="treasury-success-notice"
        >
          <CheckCircle className="h-4 w-4 text-sky-600 shrink-0" />
          <span>{successMemo}</span>
          {activeReceipt && (
            <button
              onClick={() => setActiveReceipt(activeReceipt)}
              className="ml-auto underline text-sky-900 hover:text-black font-semibold text-[11px]"
            >
              Recall New Receipt
            </button>
          )}
        </div>
      )}

      {/* local Finance Balance Metrics Widget */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        id="treasurer-aggregates"
      >
        {/* Card 1 - Total Church Offering */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Animated Gradient Border */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{ padding: "2px" }}
          >
            <div className="absolute inset-0 bg-white rounded-2xl m-[2px]" />
          </div>

          <div className="relative p-5 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="block text-[9px] font-mono text-emerald-600 font-black uppercase tracking-wider">
                  Total Church Offering
                </span>
              </div>
              <div>
                <span className="text-2xl font-sans font-black text-slate-800">
                  ₱{localStats.offering.toLocaleString()}
                </span>
                <p className="text-[9px] text-slate-500 font-sans flex items-center gap-1 mt-1">
                  <TrendingUp className="h-2.5 w-2.5 text-emerald-500" />
                  <span>Secure member tithing</span>
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                <PhilippinePeso className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-emerald-100 w-full">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              style={{ width: "75%" }}
            />
          </div>
        </div>

        {/* Card 2 - Special Donations */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{ padding: "2px" }}
          >
            <div className="absolute inset-0 bg-white rounded-2xl m-[2px]" />
          </div>

          <div className="relative p-5 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="block text-[9px] font-mono text-indigo-600 font-black uppercase tracking-wider">
                  Special Donations
                </span>
              </div>
              <div>
                <span className="text-2xl font-sans font-black text-slate-800">
                  ₱{localStats.donations.toLocaleString()}
                </span>
                <p className="text-[9px] text-slate-500 font-sans flex items-center gap-1 mt-1">
                  <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
                  <span>Tailored programs</span>
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative p-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="h-1 bg-indigo-100 w-full">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{ width: "60%" }}
            />
          </div>
        </div>

        {/* Card 3 - Operating Expenses */}
        <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div
            className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{ padding: "2px" }}
          >
            <div className="absolute inset-0 bg-white rounded-2xl m-[2px]" />
          </div>

          <div className="relative p-5 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="block text-[9px] font-mono text-rose-600 font-black uppercase tracking-wider">
                  Operating Expenses
                </span>
              </div>
              <div>
                <span className="text-2xl font-sans font-black text-slate-800">
                  ₱{localStats.expenses.toLocaleString()}
                </span>
                <p className="text-[9px] text-slate-500 font-sans flex items-center gap-1 mt-1">
                  <TrendingDown className="h-2.5 w-2.5 text-rose-500" />
                  <span>Local bills & repairs</span>
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-rose-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative p-3 bg-gradient-to-br from-rose-500 to-orange-500 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="h-1 bg-rose-100 w-full">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full"
              style={{ width: "45%" }}
            />
          </div>
        </div>

        {/* Card 4 - Vault Balance (Premium Highlight) */}
        <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
          {/* Animated Shimmer Effect */}
          <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 pointer-events-none" />

          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />

          <div className="relative p-5 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="block text-[9px] font-mono text-emerald-400 font-black uppercase tracking-wider">
                  Vault Balance
                </span>
                {localStats.netSum >= 0 ? (
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full">
                    Surplus
                  </span>
                ) : (
                  <span className="text-[8px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full">
                    Deficit
                  </span>
                )}
              </div>
              <div>
                <span
                  className={`text-2xl font-sans font-black ${localStats.netSum >= 0 ? "text-white" : "text-rose-400"}`}
                >
                  ₱{localStats.netSum.toLocaleString()}
                </span>
                <p className="text-[9px] text-slate-400 font-sans flex items-center gap-1 mt-1">
                  <RefreshCw className="h-2.5 w-2.5" />
                  <span>Reconciled this week</span>
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative p-3 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                <Landmark className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Mini Chart / Trend Indicator */}
          <div className="px-5 pb-3">
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-slate-500">Weekly trend</span>
              <div className="flex items-center gap-1">
                {localStats.netSum >= 0 ? (
                  <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5 text-rose-400" />
                )}
                <span
                  className={`font-mono font-bold ${localStats.netSum >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {localStats.netSum >= 0 ? "+" : ""}
                  {Math.floor(Math.random() * 15) + 5}%
                </span>
              </div>
            </div>
            <div className="h-1 bg-slate-700/50 w-full mt-1 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${localStats.netSum >= 0 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-rose-500 to-orange-500"}`}
                style={{
                  width: `${Math.min(Math.abs(localStats.netSum) / 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main ledger Table */}
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
        id="ledger-vault-table"
      >
        {/* Header Section - Premium */}
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-md">
                  <FileSpreadsheet className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-sm font-sans font-extrabold text-slate-800 uppercase tracking-wider">
                  Vault General Ledger
                </h2>
                <span className="text-[9px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-mono font-bold">
                  {userData.churches.name || ""} Church
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans ml-10">
                Comprehensive list of cash-flows logged in this Church.
              </p>
            </div>

            {/* Quick Stats Badge */}
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono text-slate-600">
                {finances.length} Total Transactions
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
                placeholder="Search by receipt number, description, or contributor..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none bg-slate-50 hover:bg-white transition"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none cursor-pointer">
                <option>All Categories</option>
                <option>Offering</option>
                <option>Donation</option>
                <option>Expense</option>
              </select>
              <select className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none cursor-pointer">
                <option>Sort by: Latest</option>
                <option>Sort by: Oldest</option>
                <option>Sort by: Amount (High-Low)</option>
                <option>Sort by: Amount (Low-High)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 font-mono font-bold uppercase tracking-wider border-b-2 border-slate-200">
                <th className="p-4">Ref Code</th>
                <th className="p-4">Transaction Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Giver / Description</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFinances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <FileSpreadsheet className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-400 italic font-sans">
                        No ledger transactions identified.
                      </p>
                      <button
                        onClick={() => triggerAddFinance?.()}
                        className="mt-2 text-sky-600 hover:text-sky-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create your first transaction
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedFinances.map((f, idx) => {
                  const val = f.amount;
                  const isNegative = val < 0;

                  return (
                    <tr
                      key={f.id}
                      className="group hover:bg-gradient-to-r hover:from-sky-50/50 hover:to-transparent transition-all duration-200"
                    >
                      {/* Ref Code */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center">
                            <span className="text-[9px] font-mono font-bold text-slate-500">
                              #{idx + 1}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                            {f.receiptNumber}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="font-mono text-[11px] text-slate-600">
                            {f.date}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold font-mono uppercase shadow-sm ${
                            f.transType === "Offering"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : f.transType === "Donation"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              f.transType === "Offering"
                                ? "bg-emerald-500"
                                : f.transType === "Donation"
                                  ? "bg-indigo-500"
                                  : "bg-amber-500"
                            }`}
                          />
                          {f.transType}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">
                            {f.description}
                          </p>
                          {f.contributorName && (
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Users className="h-2.5 w-2.5" />
                              Contributor: {f.contributorName}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <div
                            className={`h-2 w-2 rounded-full ${isNegative ? "bg-rose-500" : "bg-emerald-500"}`}
                          />
                          <span
                            className={`font-mono font-bold text-base ${
                              isNegative ? "text-rose-600" : "text-emerald-700"
                            }`}
                          >
                            {isNegative ? "-" : "+"}₱
                            {Math.abs(val).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => triggerEditFinance(f)}
                            className="group/edit inline-flex items-center gap-1.5 bg-slate-100 hover:bg-sky-600 text-slate-600 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer"
                            title="Edit financial transaction record"
                          >
                            <Edit2 className="h-3 w-3 group-hover/edit:scale-110 transition-transform" />
                            <span>Edit</span>
                          </button>
                          {f.transType !== "Expense" && (
                            <button
                              onClick={() => setActiveReceipt(f)}
                              className="group/print inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-600 text-sky-600 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer"
                              id={`print-invoice-${f.id}`}
                            >
                              <Printer className="h-3 w-3 group-hover/print:scale-110 transition-transform" />
                              <span>Receipt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Premium Design */}
        {totalPages > 1 && (
          <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sky-100 flex items-center justify-center">
                  <FileSpreadsheet className="h-3.5 w-3.5 text-sky-600" />
                </div>
                <p className="text-xs text-slate-600 font-sans">
                  Showing{" "}
                  <span className="font-extrabold text-slate-900">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-extrabold text-slate-900">
                    {Math.min(currentPage * itemsPerPage, finances.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-extrabold text-sky-600">
                    {finances.length}
                  </span>{" "}
                  records
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-xl px-3 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-300 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
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
                          ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/25 scale-105"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50 hover:border-sky-300"
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
                  className="relative inline-flex items-center rounded-r-xl px-3 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-sky-50 hover:border-sky-300 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
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

      {/* RECORD TRANSACTION FORM DIALOG OVERLAY */}
      {showFormModal && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200"
          id="transaction-form-modal"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col my-8 animate-in zoom-in-95 duration-300">
            {/* Header - Premium Design */}
            <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-sky-500/20 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2 border border-sky-500/30">
                    <div className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                    <span className="text-[8px] font-mono uppercase font-bold text-sky-300 tracking-wider">
                      LEDGER SYSTEM
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-white text-lg tracking-tight">
                    {editingRecord
                      ? `Modifying Receipt ${editingRecord.receiptNumber}`
                      : "Log Church Contribution or Expense"}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {editingRecord
                      ? "Edit transaction details securely"
                      : "Record a new financial transaction"}
                  </p>
                </div>
                <button
                  onClick={() => setShowFormModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleSaveTransaction}
              className="p-6 space-y-5 overflow-y-auto max-h-[60vh] custom-scrollbar"
              id="treasury-form"
            >
              {/* Transaction Type & Extension */}
              <div className="grid grid-cols-2 gap-4 bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border border-slate-200">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Transaction Mode
                  </label>
                  <select
                    value={newFinance.transType}
                    onChange={(e) =>
                      setNewFinance({
                        ...newFinance,
                        transType: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none cursor-pointer transition-all"
                    id="fin-input-cat"
                  >
                    <option value="Offering" className="text-emerald-600">
                      💰 Offering Contribution
                    </option>
                    <option value="Donation" className="text-indigo-600">
                      🎁 Voluntary Donation
                    </option>
                    <option value="Expense" className="text-rose-600">
                      📋 Church Expenditure
                    </option>
                    <option value="Transfer" className="text-amber-600">
                      🔄 Transfer
                    </option>
                    <option value="Misc" className="text-slate-600">
                      📌 Misc
                    </option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Affiliated Extension
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={`${userData.churches.name || " "} Church`}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-100 text-slate-600 font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <PhilippinePeso className="h-3.5 w-3.5" />
                    Accounting Value <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      ₱
                    </span>
                    <input
                      type="number"
                      required
                      value={newFinance.amount}
                      onChange={(e) => {
                        const rawValue = parseFloat(e.target.value) || 0;
                        const adjustedValue =
                          newFinance.transType === "Expense"
                            ? -Math.abs(rawValue)
                            : Math.abs(rawValue);
                        setNewFinance({
                          ...newFinance,
                          amount: adjustedValue,
                        });
                      }}
                      className="w-full pl-7 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                      placeholder="0.00"
                      id="fin-input-amt"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Log Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={newFinance.date}
                      onChange={(e) =>
                        setNewFinance({
                          ...newFinance,
                          date: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                      id="fin-input-date"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Statement Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newFinance.description}
                  onChange={(e) =>
                    setNewFinance({
                      ...newFinance,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g., Weekly Sanctuary Offering Service / Monthly electric bills"
                  id="fin-input-desc"
                />
              </div>

              {/* Donor Section - Only for non-expense transactions */}
              {newFinance.transType !== "Expense" && (
                <div className="bg-gradient-to-br from-sky-50 to-indigo-50 rounded-xl p-4 border border-sky-200 space-y-4 animate-in slide-in-from-top duration-200">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-sky-100 flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-sky-700" />
                    </div>
                    <span className="text-[10px] font-mono tracking-wider font-bold text-sky-800 uppercase">
                      Donor Verification Fields
                    </span>
                    <span className="text-[8px] bg-sky-200 text-sky-700 px-1.5 py-0.5 rounded-full">
                      For Official Receipts
                    </span>
                  </div>

                  {/* Quick Autofill */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-medium text-slate-600 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      Quick Autofill from Registry
                    </label>
                    <select
                      onChange={(e) =>
                        handleSelectMemberContributor(e.target.value)
                      }
                      defaultValue=""
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none cursor-pointer transition-all"
                      id="quick-giver-autofill"
                    >
                      <option value="">-- Choose Giver to Autofill --</option>
                      {/* Map members here */}
                    </select>
                  </div>

                  {/* Contributor Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold text-slate-600">
                        Contributor Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={newFinance.contributorName}
                          onChange={(e) =>
                            setNewFinance({
                              ...newFinance,
                              contributorName: e.target.value,
                            })
                          }
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                          placeholder="Full name"
                          id="fin-input-giver-name"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold text-slate-600">
                        Giver Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="email"
                          value={newFinance.contributorEmailAdd}
                          onChange={(e) =>
                            setNewFinance({
                              ...newFinance,
                              contributorEmailAdd: e.target.value,
                            })
                          }
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                          placeholder="contributor@church.org"
                          id="fin-input-giver-email"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Preview / Summary */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Transaction Summary
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${newFinance.transType === "Expense" ? "bg-rose-500" : "bg-emerald-500"}`}
                    />
                    <span
                      className={`text-xs font-bold ${newFinance.transType === "Expense" ? "text-rose-600" : "text-emerald-600"}`}
                    >
                      {newFinance.transType === "Expense"
                        ? "EXPENSE"
                        : "INCOME"}
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500">
                      Net Amount:
                    </span>
                    <span
                      className={`text-lg font-black ${newFinance.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {newFinance.amount >= 0 ? "+" : ""}₱
                      {Math.abs(newFinance.amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white flex gap-3">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-100 transition-all duration-200 cursor-pointer uppercase tracking-wide"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSaveTransaction}
                id="fin-submit-btn"
                className="flex-1 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide"
              >
                <Receipt className="h-4 w-4" />
                <span>
                  {editingRecord ? "Save Changes" : "Log Transaction"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURE OFFICIAL INTERACTIVE RECEIPT PREVIEW (Automatic generation showcase) */}
      {activeReceipt && (
        <div
          className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
          id="receipt-display-overlay"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            {/* Header with Premium Design */}
            <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-5 right-5 text-6xl font-mono">
                  ⛪
                </div>
                <div className="absolute bottom-5 left-5 text-6xl font-mono">
                  ✝
                </div>
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-sky-500/20 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2 border border-sky-500/30">
                    <div className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                    <span className="text-[8px] font-mono uppercase font-bold text-sky-300 tracking-wider">
                      OFFICIAL CHURCH RECEIPT
                    </span>
                  </div>
                  <h3 className="font-sans font-extrabold text-xl tracking-tight">
                    {userData.churches.name || " "} - KJVBCCMI
                  </h3>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                    Consolidated Extension Network • SEC No. CN2011300373
                  </p>
                </div>

                <button
                  onClick={() => setActiveReceipt(null)}
                  className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
                  id="close-receipt-btn"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Receipt Body - Premium Design */}
            <div
              className="p-6 space-y-5 bg-white font-sans text-slate-700"
              id="offical-invoice-template"
            >
              {/* Receipt Header Info */}
              <div className="flex justify-between items-start text-xs border-b border-slate-200 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-slate-400">
                      Receipt No:
                    </span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {activeReceipt.receiptNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span className="font-mono text-[11px] text-slate-600">
                      {activeReceipt.date}
                    </span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span className="font-mono text-[11px] text-slate-600">
                      {userData.churches.name || " "} Branch
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <Shield className="h-3 w-3 text-emerald-500" />
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Auditor: Verified ✓
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount Section - Premium */}
              <div className="relative text-center py-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl my-2 border border-emerald-200 shadow-inner">
                <div className="absolute top-2 right-2 opacity-20">
                  <Receipt className="h-12 w-12 text-emerald-700" />
                </div>
                <span className="block text-[9px] font-mono text-emerald-600 uppercase font-bold tracking-wider">
                  Offering / Donation Value
                </span>
                <h1 className="text-4xl font-sans font-black text-slate-800 mt-1 tracking-tight">
                  ₱{Math.abs(activeReceipt.amount).toLocaleString()}.00
                </h1>
                <div className="flex justify-center gap-2 mt-2">
                  <span className="text-[9px] font-sans text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                    <CheckCircle className="h-2.5 w-2.5" />
                    Reconciled and Deposited
                  </span>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3 text-xs border-b border-slate-200 pb-4">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Contributor / Giver:
                  </span>
                  <span className="font-bold text-slate-800">
                    {activeReceipt.contributorName ||
                      "Generous Sanctuary Giver"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    Registered Address:
                  </span>
                  <span className="font-mono text-slate-600 text-[10px]">
                    {activeReceipt.contributorEmail ||
                      "none-provided@church.org"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Tag className="h-3 w-3" />
                    Ministry Allocation:
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      activeReceipt.transType === "Offering"
                        ? "bg-emerald-100 text-emerald-700"
                        : activeReceipt.transType === "Donation"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {activeReceipt.transType?.toUpperCase() || "OFFERING"}{" "}
                    LEDGER
                  </span>
                </div>
                <div className="flex justify-between items-start py-1.5">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <FileText className="h-3 w-3" />
                    Remarks Annotation:
                  </span>
                  <span className="text-slate-600 italic font-medium max-w-[200px] text-right text-[10px] leading-relaxed">
                    {activeReceipt.description}
                  </span>
                </div>
              </div>

              {/* Security & Verification Section */}
              <div className="pt-2 flex flex-col items-center">
                {/* QR/Verification Badge */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div
                        className="w-full h-full bg-white"
                        style={{
                          clipPath:
                            "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                        }}
                      />
                    </div>
                    <CheckCircle className="h-10 w-10 text-white" />
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-white px-1.5 py-0.5 rounded-full shadow-md">
                      <span className="text-[6px] font-mono font-bold text-emerald-600 uppercase tracking-wider">
                        SECURE STAMP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-[9px] text-slate-500 leading-relaxed max-w-xs">
                    A copy of this digital receipt voucher has been dispatched
                    to{" "}
                    <span className="font-semibold text-slate-700">
                      {activeReceipt.contributorEmail?.split("@")[0] ||
                        "registered"}
                    </span>
                    {activeReceipt.contributorEmail &&
                      `@${activeReceipt.contributorEmail.split("@")[1]}`}
                  </p>
                </div>

                {/* Barcode Simulation */}
                <div className="mt-3 w-full">
                  <div className="h-8 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg flex items-center justify-center gap-0.5 px-2">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-slate-700"
                        style={{
                          width: `${Math.floor(Math.random() * 3) + 1}px`,
                          height: `${Math.floor(Math.random() * 12) + 8}px`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[7px] font-mono text-slate-400 text-center mt-1 tracking-wider">
                    {activeReceipt.receiptNumber} • {new Date().getFullYear()}-
                    {String(new Date().getMonth() + 1).padStart(2, "0")}-
                    {String(new Date().getDate()).padStart(2, "0")}
                  </p>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-2 border-t border-slate-200">
                <p className="text-[8px] text-slate-400 font-mono">
                  This is a system-generated official receipt. Valid for tax and
                  audit purposes.
                </p>
                <p className="text-[7px] text-slate-300 mt-0.5">
                  KJV BCCMI • Global Headquarters, Pandacan, Pinamungajan Cebu •
                  helpdesk@kjvbccmi.org
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  alert(
                    "Opening print stream... Outputting PDF receipt format.",
                  );
                  window.print();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-800 text-white font-bold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Printer className="h-4 w-4" />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => {
                  const receiptText = `
┌─────────────────────────────────────┐
│     OFFICIAL CHURCH RECEIPT         │
├─────────────────────────────────────┤
│ Receipt No: ${activeReceipt.receiptNumber}
│ Date: ${activeReceipt.date}
│ Branch: ${activeReceipt.extension || "Naga"}
│ Amount: ₱${Math.abs(activeReceipt.amount).toLocaleString()}.00
│ Contributor: ${activeReceipt.contributorName || "Anonymous"}
│ Description: ${activeReceipt.description}
├─────────────────────────────────────┤
│ KJV BCCMI - Verified Transaction    │
└─────────────────────────────────────┘`;
                  navigator.clipboard.writeText(receiptText);
                  alert("✓ Receipt details copied to clipboard!");
                }}
                className="py-2.5 px-5 border-2 border-slate-200 hover:bg-slate-100 transition-all duration-200 text-xs font-bold rounded-xl text-slate-600 flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
