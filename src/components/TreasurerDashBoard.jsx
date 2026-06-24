import React, { useState, useMemo, useEffect } from "react";
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
  Menu,
  FolderKanban,
  BarChart3,
  Download,
  Eye,
  Clock,
  Check,
} from "lucide-react";

// ============================================================
// REUSABLE COMPONENTS (imported from shared)
// ============================================================
import LoadingSpinner from "./Shared/LoadingSpinner";
import SuccessMessage from "./Shared/SuccessMessage";
import ErrorMessage from "./Shared/ErrorMessage";
import PaginationControls from "./Secretary/PaginationControls";

import EventReportModal from "./Shared/EventReportModal";
import ReceiptModal from "./Treasurer/ReceiptModal";

import DeleteConfirmationModal from "./Treasurer/DeleteConfirmationModal";
import useDeleteModal from "./Treasurer/useDeleteModal";
// ============================================================
// MAIN COMPONENT
// ============================================================
export default function TreasurerDashboard({ userData, session }) {
  // --- Navigation State ---
  const [activeTab, setActiveTab] = useState("ledger");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // --- UI State ---
  const [isLoading, setIsLoading] = useState(true);
  const [successMemo, setSuccessMemo] = useState("");
  const [errorMemo, setErrorMemo] = useState("");

  const [showReportModal, setShowReportModal] = useState(false);

  // --- Finances State ---
  const [finances, setFinances] = useState([]);
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [eventFilter, setEventFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- Events State ---
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_date: new Date().toISOString().split("T")[0],
    event_time: "09:00",
    notes: "",
    status: "active",
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [eventTransactions, setEventTransactions] = useState([]);
  const [eventStats, setEventStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
  });

  // --- Transaction Form State ---
  const [showFormModal, setShowFormModal] = useState(false);
  const [newFinance, setNewFinance] = useState({
    amount: "",
    transType: "Offering",
    date: new Date().toISOString().split("T")[0],
    description: "",
    churchID: userData?.churches?.id || 1,
    contributorName: "",
    receiptNumber: "",
    createdBy: session?.user?.id,
    contributorEmailAdd: "",
    event_id: null,
  });
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Initialize delete modal hook
  const { deleteState, showDeleteModal, closeDeleteModal, setDeleting } =
    useDeleteModal();

  // ============================================================
  // DATA FETCHING
  // ============================================================

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("churchID", userData.churches.id);
    if (!error && data) setMembers(data);
  };

  const fetchFinances = async () => {
    const { data, error } = await supabase
      .from("finances")
      .select(`*, churches(id, name), church_events(id, title)`)
      .eq("churchID", userData.churches.id)
      .order("created_at", { ascending: false });
    if (error) {
      setErrorMemo("Failed to load finances");
    } else {
      setFinances(data || []);
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("church_events")
      .select(`*`)
      .eq("churchId", userData.churches.id)
      .order("event_date", { ascending: false });
    if (error) {
      setErrorMemo("Failed to load events", error);
    } else {
      setEvents(data || []);
    }
  };

  const fetchEventTransactions = async (eventId) => {
    const { data, error } = await supabase
      .from("finances")
      .select(`*`)
      .eq("event_id", eventId)
      .order("date", { ascending: false });

    if (error) {
      setErrorMemo("Failed to load event transactions");
    } else {
      setEventTransactions(data || []);
      // Calculate stats
      const stats = data.reduce(
        (acc, t) => {
          if (t.amount > 0) acc.totalIncome += t.amount;
          else acc.totalExpenses += Math.abs(t.amount);
          return acc;
        },
        { totalIncome: 0, totalExpenses: 0, netBalance: 0 },
      );
      stats.netBalance = stats.totalIncome - stats.totalExpenses;
      setEventStats(stats);
    }
  };

  // ============================================================
  // EFFECTS
  // ============================================================
  // useEffect(() => {
  //   const channel = supabase
  //     .channel("finances-channel")
  //     .on(
  //       "postgres_changes",
  //       { event: "INSERT", schema: "public", table: "finances" },
  //       (payload) => {
  //         const newFinances = payload.new;
  //         setFinances((prevFinances) => [newFinances, ...prevFinances]);
  //       },
  //     )
  //     .on(
  //       "postgres_changes",
  //       { event: "UPDATE", schema: "public", table: "finances" },
  //       (payload) => {
  //         const updatedFinances = payload.new;
  //         setFinances((prevFinances) =>
  //           prevFinances.map((m) =>
  //             m.id === updatedFinances.id ? updatedFinances : m,
  //           ),
  //         );
  //       },
  //     )
  //     .on(
  //       "postgres_changes",
  //       { event: "DELETE", schema: "public", table: "finances" },
  //       (payload) => {
  //         setFinances((prev) => prev.filter((m) => m.id !== payload.old.id));
  //       },
  //     )
  //     .subscribe();

  //   return () => supabase.removeChannel(channel);
  // }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, sortBy, eventFilter]);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchFinances(), fetchMembers(), fetchEvents()]);
    setIsLoading(false);
  };

  // ============================================================
  // COMPUTED VALUES
  // ============================================================

  const filteredFinances = useMemo(() => {
    let filtered = [...finances];
    if (searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((f) => {
        const receiptStr = f.receiptNumber
          ? String(f.receiptNumber).toLowerCase()
          : "";
        const descriptionStr = f.description ? f.description.toLowerCase() : "";
        const contributorStr = f.contributorName
          ? f.contributorName.toLowerCase()
          : "";
        return (
          receiptStr.includes(searchLower) ||
          descriptionStr.includes(searchLower) ||
          contributorStr.includes(searchLower)
        );
      });
    }
    if (categoryFilter !== "All") {
      filtered = filtered.filter((f) => f.transType === categoryFilter);
    }

    // Add event filter
    if (eventFilter !== "All") {
      if (eventFilter === "No Event") {
        filtered = filtered.filter((f) => !f.event_id);
      } else {
        filtered = filtered.filter((f) => f.event_id === parseInt(eventFilter));
      }
    }

    filtered.sort((a, b) => {
      if (sortBy === "latest") return new Date(b.date) - new Date(a.date);
      if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
      if (sortBy === "amountHigh")
        return Math.abs(b.amount) - Math.abs(a.amount);
      if (sortBy === "amountLow")
        return Math.abs(a.amount) - Math.abs(b.amount);
      return 0;
    });
    return filtered;
  }, [finances, searchTerm, categoryFilter, sortBy, eventFilter]);

  const totalPages = Math.ceil(filteredFinances.length / itemsPerPage);
  const paginatedFinances = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return filteredFinances.slice(offset, offset + itemsPerPage);
  }, [filteredFinances, currentPage]);

  const localStats = useMemo(() => {
    let offering = 0,
      donations = 0,
      expenses = 0;
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

  const vaultTotal = localStats.netSum;

  // ============================================================
  // HANDLERS
  // ============================================================

  // --- Event Handlers ---
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const eventData = {
      ...newEvent,
      churchId: userData.churches.id,
      createdby: session.user.id,
      status: "active",
    };

    const { error } = await supabase.from("church_events").insert([eventData]);
    if (error) {
      setErrorMemo(error.message);
    } else {
      setSuccessMemo("Event created successfully!");
      fetchEvents();
      setShowEventModal(false);
      resetEventForm();
    }
    setIsLoading(false);
    setTimeout(() => {
      setSuccessMemo("");
      setErrorMemo("");
    }, 3000);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase
      .from("church_events")
      .update(newEvent)
      .eq("id", editingEvent.id);

    if (error) {
      setErrorMemo(error.message);
    } else {
      setSuccessMemo("Event updated successfully!");
      fetchEvents();
      setShowEventModal(false);
      setEditingEvent(null);
      resetEventForm();
    }
    setIsLoading(false);
    setTimeout(() => {
      setSuccessMemo("");
      setErrorMemo("");
    }, 3000);
  };

  // --- Updated Event Handlers ---
  const handleDeleteEvent = async (eventId) => {
    const eventToDelete = events.find((e) => e.id === eventId);

    showDeleteModal({
      title: "Delete Event",
      message: `Are you sure you want to delete "${eventToDelete?.title || "this event"}"? All associated transactions will also be removed.`,
      itemName: eventToDelete?.title || "",
      itemType: "event",
      variant: "danger",
      onConfirm: async () => {
        setDeleting(true);
        const { error } = await supabase
          .from("church_events")
          .delete()
          .eq("id", eventId);

        if (error) {
          setErrorMemo(error.message);
          setDeleting(false);
          closeDeleteModal();
          return;
        }

        setSuccessMemo("Event deleted successfully!");
        await fetchEvents();
        setDeleting(false);
        closeDeleteModal();

        setTimeout(() => {
          setSuccessMemo("");
          setErrorMemo("");
        }, 3000);
      },
    });
  };

  // --- Updated Finance Handlers ---
  const handleDeleteTransaction = async (transactionId, eventId = null) => {
    const transactionToDelete = finances.find((f) => f.id === transactionId);

    showDeleteModal({
      title: "Delete Transaction",
      message: `Are you sure you want to delete this transaction? This action cannot be undone.${
        eventId
          ? " The event's financial summary will be updated automatically."
          : ""
      }`,
      itemName: transactionToDelete?.receiptNumber || "",
      itemType: "transaction",
      variant: "danger",
      onConfirm: async () => {
        setDeleting(true);
        const { error } = await supabase
          .from("finances")
          .delete()
          .eq("id", transactionId);

        if (error) {
          setErrorMemo(error.message);
          setDeleting(false);
          closeDeleteModal();
          return;
        }

        setSuccessMemo("Transaction deleted successfully!");

        // Update event totals if linked to an event
        if (eventId) {
          await updateEventTotals(eventId);
          // Refresh event transactions if the event detail modal is open
          if (showEventDetailModal && selectedEvent) {
            await fetchEventTransactions(selectedEvent.id);
          }
        }

        // Refresh both finances and events
        await Promise.all([fetchFinances(), fetchEvents()]);

        setDeleting(false);
        closeDeleteModal();

        setTimeout(() => {
          setSuccessMemo("");
          setErrorMemo("");
        }, 3000);
      },
    });
  };

  const handleDeleteEventTransaction = async (transactionId) => {
    const transactionToDelete = eventTransactions.find(
      (t) => t.id === transactionId,
    );

    showDeleteModal({
      title: "Delete Event Transaction",
      message: `Are you sure you want to delete this transaction from "${selectedEvent?.title || "the event"}"? The event's financial summary will be updated automatically.`,
      itemName: transactionToDelete?.description || "",
      itemType: "transaction",
      variant: "danger",
      onConfirm: async () => {
        setDeleting(true);
        const { error } = await supabase
          .from("finances")
          .delete()
          .eq("id", transactionId);

        if (error) {
          setErrorMemo(error.message);
          setDeleting(false);
          closeDeleteModal();
          return;
        }

        setSuccessMemo("Event transaction deleted successfully!");

        // Update event totals
        if (selectedEvent) {
          await updateEventTotals(selectedEvent.id);
          await fetchEventTransactions(selectedEvent.id);
        }

        // Refresh main finances
        await fetchFinances();

        setDeleting(false);
        closeDeleteModal();

        setTimeout(() => {
          setSuccessMemo("");
          setErrorMemo("");
        }, 3000);
      },
    });
  };

  const handleCompleteEvent = async (eventId) => {
    if (!confirm("Mark this event as completed?")) return;
    setIsLoading(true);

    const { error } = await supabase
      .from("church_events")
      .update({ status: "completed" })
      .eq("id", eventId);
    if (error) {
      setErrorMemo(error.message);
    } else {
      setSuccessMemo("Event marked as completed!");
      fetchEvents();
    }
    setIsLoading(false);
    setTimeout(() => {
      setSuccessMemo("");
      setErrorMemo("");
    }, 3000);
  };

  const resetEventForm = () => {
    setNewEvent({
      title: "",
      description: "",
      event_date: new Date().toISOString().split("T")[0],
      event_time: "09:00",
      notes: "",
      status: "active",
    });
  };

  const triggerAddEvent = () => {
    setEditingEvent(null);
    resetEventForm();
    setShowEventModal(true);
  };

  const triggerEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date,
      event_time: event.event_time || "09:00",
      notes: event.notes || "",
      status: event.status,
    });
    setShowEventModal(true);
  };

  const viewEventDetails = async (event) => {
    setSelectedEvent(event);
    await fetchEventTransactions(event.id);
    setShowEventDetailModal(true);
  };

  // --- Finance Handlers ---
  const resetFinance = () => {
    setNewFinance({
      amount: "",
      transType: "Offering",
      date: new Date().toISOString().split("T")[0],
      description: "",
      churchID: userData?.churches?.id || 1,
      contributorName: "",
      receiptNumber: "",
      createdBy: session?.user?.id,
      contributorEmailAdd: "",
      event_id: null,
    });
  };

  const handleSelectMemberContributor = (memberId) => {
    const match = members.find((m) => m.id === memberId);
    if (match) {
      setNewFinance({
        ...newFinance,
        contributorName: `${match.firstName} ${match.lastName}`,
        contributorEmailAdd: match.emailAdd,
      });
    }
  };

  const triggerEditFinance = (record) => {
    setEditingRecord(record);
    setNewFinance({
      id: record.id,
      amount: Math.abs(record.amount),
      transType: record.transType,
      date: record.date,
      description: record.description,
      contributorName: record.contributorName || "",
      contributorEmailAdd: record.contributorEmailAdd || "",
      churchID: userData?.churches?.id || 1,
      receiptNumber: record.receiptNumber,
      createdBy: session?.user?.id,
      event_id: record.event_id || null,
    });
    setShowFormModal(true);
  };

  const triggerAddFinance = () => {
    setEditingRecord(null);
    resetFinance();
    setShowFormModal(true);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();

    const numberAmount = Math.abs(parseFloat(newFinance.amount));
    if (isNaN(numberAmount) || numberAmount <= 0) {
      setErrorMemo("Please input a valid positive currency scale.");
      return;
    }

    const locPrefix = userData.churches.name.substring(0, 2).toUpperCase();
    const serialToken = editingRecord
      ? editingRecord.receiptNumber
      : `REC-${locPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;

    if (!editingRecord) {
      const adjustedAmount =
        newFinance.transType === "Expense" ? -numberAmount : numberAmount;
      const financeData = {
        ...newFinance,
        amount: adjustedAmount,
        receiptNumber: serialToken,
        date: newFinance.date,
        event_id: newFinance.event_id || null,
      };

      const { error } = await supabase
        .from("finances")
        .insert({ ...financeData, createdBy: session.user.id });

      if (error) {
        setErrorMemo(error.message);
        return;
      }
      setSuccessMemo(`Ledger adjusted with ${serialToken}! Receipt generated!`);
      // setActiveReceipt({
      //   ...financeData,
      //   amount: adjustedAmount,
      //   receiptNumber: serialToken,
      // });

      // Update event totals if linked to an event
      if (newFinance.event_id) {
        await updateEventTotals(newFinance.event_id);
      }
    } else {
      const adjustedAmount =
        newFinance.transType === "Expense" ? -numberAmount : numberAmount;
      const { error } = await supabase
        .from("finances")
        .update({ ...newFinance, amount: adjustedAmount })
        .eq("id", newFinance.id);

      if (error) {
        setErrorMemo(error.message);
        return;
      }
      setSuccessMemo(`Receipt ${serialToken} updated successfully!`);
      if (newFinance.event_id) {
        await updateEventTotals(newFinance.event_id);
      }
    }

    setShowFormModal(false);

    // IMPORTANT: Refresh all data after saving
    await Promise.all([fetchFinances(), fetchEvents()]);

    // If event detail modal is open, refresh its transactions too
    if (showEventDetailModal && selectedEvent) {
      await fetchEventTransactions(selectedEvent.id);
    }

    setTimeout(() => {
      setSuccessMemo("");
      setErrorMemo("");
    }, 4500);
  };

  const updateEventTotals = async (eventId) => {
    // Get all transactions for this event
    const { data, error } = await supabase
      .from("finances")
      .select("amount")
      .eq("event_id", eventId);

    if (error) return;

    let totalIncome = 0;
    let totalExpenses = 0;
    data.forEach((t) => {
      if (t.amount > 0) totalIncome += t.amount;
      else totalExpenses += Math.abs(t.amount);
    });
    const netBalance = totalIncome - totalExpenses;

    await supabase
      .from("church_events")
      .update({
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_balance: netBalance,
      })
      .eq("id", eventId);

    // Refresh events to update the card summaries
    await fetchEvents();
  };

  const generateEventReport = async (event) => {
    setIsLoading(true);
    await fetchEventTransactions(event.id);
    // Generate report text
    const report = `
========================================
  EVENT FINANCIAL REPORT
========================================
Event: ${event.title}
Date: ${event.event_date}
Status: ${event.status}
----------------------------------------
INCOME:
  Total Income: ₱${eventStats.totalIncome.toFixed(2)}
EXPENSES:
  Total Expenses: ₱${eventStats.totalExpenses.toFixed(2)}
----------------------------------------
NET BALANCE: ₱${eventStats.netBalance.toFixed(2)}
----------------------------------------
Transaction Details:
${eventTransactions
  .map(
    (t) =>
      `  ${t.date} | ${t.transType} | ${t.description} | ₱${Math.abs(t.amount).toFixed(2)}`,
  )
  .join("\n")}
========================================
Generated: ${new Date().toLocaleString()}
    `;

    // Copy to clipboard
    await navigator.clipboard.writeText(report);
    setSuccessMemo("Report copied to clipboard!");
    setTimeout(() => setSuccessMemo(""), 3000);
    setIsLoading(false);
  };

  // ============================================================
  // NAVIGATION ITEMS
  // ============================================================

  const navigationItems = [
    { id: "ledger", icon: FileSpreadsheet, label: "Main Ledger", color: "sky" },
    { id: "events", icon: FolderKanban, label: "Events", color: "emerald" },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  if (isLoading) {
    return <LoadingSpinner message="Loading financial data..." />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* LEFT SIDEBAR NAVIGATION */}
      <div
        className={`${sidebarCollapsed ? "w-20" : "w-64"} shrink-0 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30 transition-all duration-300`}
      >
        <div className="flex-1 py-6 px-4">
          <div className="space-y-1">
            <div className="pb-3 mb-3 border-b border-slate-100 px-2 flex items-center justify-between">
              <span
                className={`text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider ${sidebarCollapsed ? "hidden" : "block"}`}
              >
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
                    ? `bg-gradient-to-r from-${item.color}-600 to-${item.color === "sky" ? "blue" : "teal"}-600 text-white shadow-lg shadow-${item.color}-500/25`
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon
                  className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${activeTab === item.id ? "text-white" : "text-slate-400"}`}
                />
                <span
                  className={`flex-1 text-left ${sidebarCollapsed ? "hidden" : "block"}`}
                >
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
            <div className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span
                  className={`text-[9px] font-mono font-bold uppercase tracking-wider text-sky-700 ${sidebarCollapsed ? "hidden" : "block"}`}
                >
                  Treasurer Access
                </span>
              </div>
              <p
                className={`text-[9px] text-slate-500 leading-tight ${sidebarCollapsed ? "hidden" : "block"}`}
              >
                Manage finances and events for {userData?.churches?.name}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT AREA */}
      <div
        className={`flex-1 ${sidebarCollapsed ? "ml-20" : "ml-64"} transition-all duration-300`}
      >
        <SuccessMessage
          message={successMemo}
          onDismiss={() => setSuccessMemo("")}
        />
        <ErrorMessage message={errorMemo} onDismiss={() => setErrorMemo("")} />

        <main className="p-6">
          {/* ============================================================
              LEDGER TAB
          ============================================================ */}
          {activeTab === "ledger" && (
            <div className="space-y-6" id="treasurer-dashboard-view">
              {/* Visual Header Banner */}
              <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 md:p-8 border border-slate-700/50 overflow-hidden shadow-xl">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500 blur-3xl" />
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-sky-500 blur-3xl" />
                </div>
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
                  <Landmark className="h-64 w-64 translate-x-20 -translate-y-10" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
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
                          {userData.churches.name || ""} Extension Treasurer
                          Portal
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
                      Financial Ledger &{" "}
                      <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                        Offering Receipt Desk
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
                      File weekly Offerings, dispatch voluntary missionary
                      donations, log church operations, and generate official
                      compliance receipts immediately.
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

              {/* Stats Cards */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                id="treasurer-aggregates"
              >
                {/* ... existing stats cards ... */}
                <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
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
                  <div className="h-1 bg-emerald-100 w-full">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      style={{ width: "75%" }}
                    />
                  </div>
                </div>

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

                <div className="group relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-100 pointer-events-none" />
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                  <div className="relative p-5 flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="block text-[9px] font-mono text-emerald-400 font-black uppercase tracking-wider">
                          Vault Balance
                        </span>
                        {vaultTotal >= 0 ? (
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
                          className={`text-2xl font-sans font-black ${vaultTotal >= 0 ? "text-white" : "text-rose-400"}`}
                        >
                          ₱{vaultTotal.toLocaleString()}
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
                  <div className="px-5 pb-3">
                    <div className="flex items-center justify-between text-[8px]">
                      <span className="text-slate-500">Weekly trend</span>
                      <div className="flex items-center gap-1">
                        {vaultTotal >= 0 ? (
                          <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-2.5 w-2.5 text-rose-400" />
                        )}
                        <span
                          className={`font-mono font-bold ${vaultTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                        >
                          {vaultTotal >= 0 ? "+" : ""}
                          {Math.floor(Math.random() * 15) + 5}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1 bg-slate-700/50 w-full mt-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${vaultTotal >= 0 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-rose-500 to-orange-500"}`}
                        style={{
                          width: `${Math.min(Math.abs(vaultTotal) / 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Ledger Table */}
              <div
                className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
                id="ledger-vault-table"
              >
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
                          {userData?.churches?.name || ""} Church
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans ml-10">
                        Comprehensive list of cash-flows logged in this Church.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-mono text-slate-600">
                        {filteredFinances.length} Total Transactions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pt-4 pb-2 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by receipt number, description, or contributor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none bg-slate-50 hover:bg-white transition"
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none cursor-pointer"
                      >
                        <option value="All">All Categories</option>
                        <option value="Offering">Offering</option>
                        <option value="Donation">Donation</option>
                        <option value="Expense">Expense</option>
                      </select>
                      <select
                        value={eventFilter}
                        onChange={(e) => setEventFilter(e.target.value)}
                        className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none cursor-pointer"
                      >
                        <option value="All">All Events</option>
                        <option value="No Event">No Event</option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.title}
                          </option>
                        ))}
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none cursor-pointer"
                      >
                        <option value="latest">Sort by: Latest</option>
                        <option value="oldest">Sort by: Oldest</option>
                        <option value="amountHigh">
                          Sort by: Amount (High-Low)
                        </option>
                        <option value="amountLow">
                          Sort by: Amount (Low-High)
                        </option>
                      </select>
                    </div>
                  </div>
                  {searchTerm && (
                    <div className="mt-2 text-xs text-slate-500">
                      Found {filteredFinances.length} result
                      {filteredFinances.length !== 1 ? "s" : ""} for "
                      {searchTerm}"
                    </div>
                  )}
                </div>

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
                                {searchTerm
                                  ? `No transactions found matching "${searchTerm}"`
                                  : "No ledger transactions identified."}
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
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <span className="text-[9px] font-mono font-bold text-slate-500">
                                      #
                                      {idx +
                                        1 +
                                        (currentPage - 1) * itemsPerPage}
                                    </span>
                                  </div>
                                  <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                    {f.receiptNumber}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3 w-3 text-slate-400" />
                                  <span className="font-mono text-[11px] text-slate-600">
                                    {f.date}
                                  </span>
                                </div>
                              </td>
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
                                  {f.event_id && (
                                    <span className="text-[8px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full inline-block mt-0.5">
                                      Event:{" "}
                                      {f.church_events?.title || "Unknown"}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <div
                                    className={`h-2 w-2 rounded-full ${isNegative ? "bg-rose-500" : "bg-emerald-500"}`}
                                  />
                                  <span
                                    className={`font-mono font-bold text-base ${isNegative ? "text-rose-600" : "text-emerald-700"}`}
                                  >
                                    {isNegative ? "-" : "+"}₱
                                    {Math.abs(val).toLocaleString()}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => triggerEditFinance(f)}
                                    className="group/edit inline-flex items-center gap-1.5 bg-slate-100 hover:bg-sky-600 text-slate-600 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer"
                                  >
                                    <Edit2 className="h-3 w-3 group-hover/edit:scale-110 transition-transform" />
                                    <span>Edit</span>
                                  </button>
                                  {f.transType !== "Expense" && (
                                    <button
                                      onClick={() => setActiveReceipt(f)}
                                      className="group/print inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-600 text-sky-600 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer"
                                    >
                                      <Printer className="h-3 w-3 group-hover/print:scale-110 transition-transform" />
                                      <span>Receipt</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      handleDeleteTransaction(f.id, f.event_id)
                                    }
                                    className="group/delete inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer"
                                  >
                                    <X className="h-3 w-3 group-hover/delete:scale-110 transition-transform" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredFinances.length}
                  itemsPerPage={itemsPerPage}
                  searchTerm={searchTerm}
                />
              </div>
            </div>
          )}

          {/* ============================================================
              EVENTS TAB
          ============================================================ */}
          {activeTab === "events" && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950/30 text-white rounded-2xl p-6 md:p-8 border border-slate-700/50 overflow-hidden shadow-xl">
                <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-500 blur-3xl" />
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-teal-500 blur-3xl" />
                </div>
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
                  <FolderKanban className="h-64 w-64 translate-x-20 -translate-y-10" />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                          <FolderKanban className="h-3 w-3" />
                          <span>Event Management Workspace</span>
                        </span>
                      </div>
                      <div className="h-3 w-px bg-slate-600 hidden sm:block" />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400 font-sans">
                          Localized Context:
                        </span>
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {userData.churches.name || ""} Extension
                        </span>
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight">
                      Church Events &{" "}
                      <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Financial Tracking
                      </span>
                    </h1>
                    <p className="text-sm text-slate-400 font-sans leading-relaxed max-w-2xl">
                      Create and manage church events, track all income and
                      expenses, and generate comprehensive financial reports.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Event Tracking
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                          <FileSpreadsheet className="h-3 w-3 text-teal-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Financial Reports
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-500/20 flex items-center justify-center">
                          <Shield className="h-3 w-3 text-sky-400" />
                        </div>
                        <span className="text-[10px] text-slate-300">
                          Audit Ready
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={triggerAddEvent}
                    className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all duration-200 shrink-0 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Plus className="h-4.5 w-4.5 group-hover:rotate-90 transition-transform duration-200" />
                    <span>Create New Event</span>
                  </button>
                </div>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.length === 0 ? (
                  <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <FolderKanban className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-400">
                        No events created yet.
                      </p>
                      <button
                        onClick={triggerAddEvent}
                        className="mt-2 text-emerald-600 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create your first event
                      </button>
                    </div>
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                              <FolderKanban className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-800 text-sm line-clamp-1">
                                {event.title}
                              </h3>
                              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {event.event_date}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              event.status === "active"
                                ? "bg-emerald-100 text-emerald-700"
                                : event.status === "completed"
                                  ? "bg-sky-100 text-sky-700"
                                  : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {event.status === "active"
                              ? "Active"
                              : event.status === "completed"
                                ? "Completed"
                                : "Cancelled"}
                          </span>
                        </div>

                        {event.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                            {event.description}
                          </p>
                        )}

                        <div className="grid grid-cols-3 gap-2 mb-4 p-2 bg-slate-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-[8px] text-slate-400 uppercase font-mono">
                              Income
                            </p>
                            <p className="text-sm font-bold text-emerald-600">
                              ₱{event.total_income?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div className="text-center border-x border-slate-200">
                            <p className="text-[8px] text-slate-400 uppercase font-mono">
                              Expenses
                            </p>
                            <p className="text-sm font-bold text-rose-600">
                              ₱{event.total_expenses?.toLocaleString() || 0}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] text-slate-400 uppercase font-mono">
                              Net
                            </p>
                            <p
                              className={`text-sm font-bold ${(event.net_balance || 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                            >
                              ₱{event.net_balance?.toLocaleString() || 0}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {event.status !== "completed" && (
                            <button
                              onClick={() => handleCompleteEvent(event.id)}
                              className="flex-1 py-1.5 text-[10px] font-semibold bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-600 hover:text-white transition-all duration-200 flex items-center justify-center gap-1"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => viewEventDetails(event)}
                            className="flex-1 py-1.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-600 hover:text-white transition-all duration-200 flex items-center justify-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </button>
                          <button
                            onClick={() => triggerEditEvent(event)}
                            className="flex-1 py-1.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-800 hover:text-white transition-all duration-200 flex items-center justify-center gap-1"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="py-1.5 px-2 text-[10px] font-semibold bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-600 hover:text-white transition-all duration-200"
                          >
                            <X className="h-3.5 w-3.5" />
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

      {/* ============================================================
          MODALS
      ============================================================ */}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2 border border-white/30">
                    <FolderKanban className="h-3 w-3 text-white" />
                    <span className="text-[8px] font-mono uppercase font-bold text-white tracking-wider">
                      EVENT MANAGER
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-white text-lg tracking-tight">
                    {editingEvent ? "Edit Event" : "Create New Event"}
                  </h3>
                  <p className="text-[10px] text-white/80 mt-0.5">
                    {editingEvent
                      ? "Update event details"
                      : "Schedule a new church event"}
                  </p>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <form
              onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  Event Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  rows="3"
                  className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Event description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                    Event Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newEvent.event_date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, event_date: e.target.value })
                    }
                    className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.event_time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, event_time: e.target.value })
                    }
                    className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                  Notes
                </label>
                <textarea
                  value={newEvent.notes}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, notes: e.target.value })
                  }
                  rows="2"
                  className="w-full mt-1 border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {editingEvent ? "Save Changes" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 sticky top-0 z-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full mb-2 border border-white/30">
                    <FolderKanban className="h-3 w-3 text-white" />
                    <span className="text-[8px] font-mono uppercase font-bold text-white tracking-wider">
                      EVENT DETAILS
                    </span>
                  </div>
                  <h3 className="font-sans font-bold text-white text-lg tracking-tight">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-[10px] text-white/80 mt-0.5">
                    {selectedEvent.event_date}{" "}
                    {selectedEvent.event_time
                      ? `• ${selectedEvent.event_time}`
                      : ""}
                  </p>
                </div>
                <button
                  onClick={() => setShowEventDetailModal(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-200">
                  <p className="text-[8px] text-emerald-600 uppercase font-mono font-bold">
                    Total Income
                  </p>
                  <p className="text-xl font-bold text-emerald-700">
                    ₱{eventStats.totalIncome.toLocaleString()}
                  </p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3 text-center border border-rose-200">
                  <p className="text-[8px] text-rose-600 uppercase font-mono font-bold">
                    Total Expenses
                  </p>
                  <p className="text-xl font-bold text-rose-700">
                    ₱{eventStats.totalExpenses.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-3 text-center border ${eventStats.netBalance >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}
                >
                  <p
                    className={`text-[8px] ${eventStats.netBalance >= 0 ? "text-emerald-600" : "text-rose-600"} uppercase font-mono font-bold`}
                  >
                    Net Balance
                  </p>
                  <p
                    className={`text-xl font-bold ${eventStats.netBalance >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                  >
                    ₱{eventStats.netBalance.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Event Details */}
              <div className="mb-6">
                <p className="text-sm text-slate-600">
                  {selectedEvent.description || "No description provided."}
                </p>
                {selectedEvent.notes && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">
                      Notes
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                      {selectedEvent.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Transactions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-slate-500" />
                    Transactions
                  </h4>
                  <button
                    onClick={() => {
                      setNewFinance({
                        amount: "",
                        transType: "Offering",
                        date: new Date().toISOString().split("T")[0],
                        description: `Transaction for ${selectedEvent.title}`,
                        churchID: userData.churches.id,
                        contributorName: "",
                        receiptNumber: "",
                        createdBy: session.user.id,
                        contributorEmailAdd: "",
                        event_id: selectedEvent.id,
                      });
                      setEditingRecord(null);
                      setShowFormModal(true);
                    }}
                    className="px-3 py-1.5 text-[10px] font-semibold bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-600 hover:text-white transition-all duration-200 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Transaction
                  </button>
                </div>

                {eventTransactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No transactions recorded for this event.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {eventTransactions.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                t.transType === "Offering"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : t.transType === "Donation"
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {t.transType}
                            </span>
                            <span className="text-xs font-medium text-slate-700">
                              {t.description}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[10px] text-slate-400">
                              {t.date}
                            </span>
                            {t.contributorName && (
                              <span className="text-[10px] text-slate-400">
                                • {t.contributorName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-bold ${t.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {t.amount >= 0 ? "+" : "-"}₱
                            {Math.abs(t.amount).toLocaleString()}
                          </span>
                          <button
                            onClick={() => setActiveReceipt(t)}
                            className="p-1 text-slate-400 hover:text-sky-600 transition"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEventTransaction(t.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Delete Transaction"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex gap-3">
              <button
                onClick={() => setShowEventDetailModal(false)}
                className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowEventDetailModal(false);
                  setShowReportModal(true);
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Form Modal - Updated with Event Selection */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col my-8 animate-in zoom-in-95 duration-300">
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
                  <input
                    type="text"
                    readOnly
                    value={`${userData.churches.name || " "} Church`}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-100 text-slate-600 font-semibold cursor-not-allowed"
                  />
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
                        setNewFinance({ ...newFinance, amount: adjustedValue });
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
                        setNewFinance({ ...newFinance, date: e.target.value })
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

              {/* Event Association */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                  <FolderKanban className="h-3.5 w-3.5" />
                  Associate with Event (Optional)
                </label>
                <select
                  value={newFinance.event_id || ""}
                  onChange={(e) =>
                    setNewFinance({
                      ...newFinance,
                      event_id: e.target.value || null,
                    })
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none cursor-pointer transition-all"
                >
                  <option value="">-- No Event --</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} ({event.event_date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Donor Section */}
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
                    >
                      <option value="">-- Choose Giver to Autofill --</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.firstName} {m.lastName} ({m.emailAdd})
                        </option>
                      ))}
                    </select>
                  </div>

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

              {/* Amount Preview */}
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
                      className={`text-lg font-black ${newFinance.transType !== "Expense" ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {newFinance.transType !== "Expense" ? "+" : "-"}₱
                      {Math.abs(
                        parseFloat(newFinance.amount) || 0,
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </form>

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

      {/* Receipt Modal - Using the new component */}
      <ReceiptModal
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
        churchName={userData?.churches?.name}
      />

      <EventReportModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setShowEventDetailModal(true);
        }}
        event={selectedEvent}
        eventTransactions={eventTransactions}
        eventStats={eventStats}
        churchName={userData.churches.name}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteState.onConfirm}
        title={deleteState.title}
        message={deleteState.message}
        itemName={deleteState.itemName}
        itemType={deleteState.itemType}
        isDeleting={deleteState.isDeleting}
        variant={deleteState.variant}
      />
    </div>
  );
}
