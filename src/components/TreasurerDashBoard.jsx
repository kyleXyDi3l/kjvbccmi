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

    // setAmount(Math.abs(record.amount).toString());
    // setTransType(record.category);
    // setDate(record.date);
    // setDescription(record.description);
    // setContributorName(record.contributorName || "");
    // setContributorEmail(record.contributorEmail || "");

    setShowFormModal(true);
  };

  const triggerAddFinance = () => {
    setEditingRecord(null);
    resetFinance();
    //setAmount("");
    // setTransType("Offering");
    // setDate("2026-06-01");
    // setDescription("");
    // setContributorName("");
    // setContributorEmail("");
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

    // Reset Form Fields
    //setAmount("");
    //setTransType("Offering");
    //setDescription("");
    //setContributorName("");
    //setContributorEmail("");
    //setEditingRecord(null);

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
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] bg-sky-950 border border-sky-800 text-sky-300 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
              <Landmark className="h-3 w-3" />
              <span>Church Vault Management</span>
            </span>
            <span className="text-xs text-slate-400 font-sans">
              | Localized Context:{" "}
              <strong>
                {userData.churches.name} Extension Treasurer Portal
              </strong>{" "}
              Line
            </span>
          </div>
          <h1 className="text-2xl font-sans font-bold tracking-tight">
            Financial Ledger & Offering Receipt Desk
          </h1>
          <p className="text-xs text-slate-400 font-sans">
            File weekly Offerings, dispatch voluntary missionary donations, log
            church operations, and generate official compliance receipts
            immediately.
          </p>
        </div>

        <button
          onClick={triggerAddFinance}
          id="file-transaction-trigger"
          className="bg-sky-500 hover:bg-sky-600 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-lg transition shrink-0 flex items-center gap-1.5 shadow"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Record Offering or Expense</span>
        </button>
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        id="treasurer-aggregates"
      >
        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-mono text-slate-400 font-semibold uppercase">
              Total Church Offering
            </span>
            <span className="text-lg font-sans font-bold text-slate-800">
              ₱{localStats.offering.toLocaleString()}
            </span>
            <p className="text-[10px] text-emerald-600 font-sans flex items-center gap-0.5 mt-1 font-medium">
              <TrendingUp className="h-3 w-3" /> Secure member tithing
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-mono text-slate-400 font-semibold uppercase">
              Special Donations
            </span>
            <span className="text-lg font-sans font-bold text-slate-800">
              ₱{localStats.donations.toLocaleString()}
            </span>
            <p className="text-[10px] text-indigo-600 font-sans flex items-center gap-0.5 mt-1 font-medium">
              <Sparkles className="h-3 w-3" /> Tailored programs
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-mono text-slate-400 font-semibold uppercase">
              Operating Expenses
            </span>
            <span className="text-lg font-sans font-bold text-slate-800">
              ₱{localStats.expenses.toLocaleString()}
            </span>
            <p className="text-[10px] text-rose-600 font-sans flex items-center gap-0.5 mt-1 font-medium">
              <TrendingDown className="h-3 w-3" /> Local bills & repairs
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border-2 border-slate-900 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase">
              Vault Balance
            </span>
            <span
              className={`text-lg font-sans font-bold ${localStats.netSum >= 0 ? "text-slate-800" : "text-rose-700"}`}
            >
              ₱{localStats.netSum.toLocaleString()}
            </span>
            <p className="text-[10px] text-slate-500 font-sans mt-1">
              Reconciled this week
            </p>
          </div>
          <div className="p-3 bg-slate-950 text-white rounded-xl">
            <Landmark className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main ledger Table */}
      <div
        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
        id="ledger-vault-table"
      >
        <div className="flex justify-between items-center pb-2 border-b">
          <div>
            <h2 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="h-4.5 w-4.5 text-sky-600" />
              <span>
                Vault General Ledger ({userData.churches.name} Church)
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 font-sans">
              Comprehensive list of cash-flows logged in this Church.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-mono font-semibold border-b border-slate-200">
                <th className="p-3">Ref Code</th>
                <th className="p-3">Cash Date</th>
                <th className="p-3">Log Category</th>
                <th className="p-3">Giver / Description</th>
                <th className="p-3 text-right font-mono">Ledger Value</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFinances.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-slate-400 italic"
                  >
                    No ledger transactions identified. Create a new transaction
                    to generate receipt metrics.
                  </td>
                </tr>
              ) : (
                paginatedFinances.map((f) => {
                  const val = f.amount;
                  const isNegative = val < 0;

                  return (
                    <tr
                      key={f.id}
                      className="hover:bg-slate-50 text-slate-700 select-none"
                    >
                      <td className="p-3 font-mono text-[11px] text-slate-500">
                        {f.receiptNumber}
                      </td>
                      <td className="p-3 font-mono text-[11px]">{f.date}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider font-mono uppercase ${
                            f.transType === "Offering"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : f.transType === "Donation"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {f.transType}
                        </span>
                      </td>
                      <td className="p-3 font-sans">
                        <p className="font-semibold">{f.description}</p>
                        {f.contributorName && (
                          <p className="text-[10px] text-slate-500">
                            By: {f.contributorName}
                          </p>
                        )}
                      </td>
                      <td
                        className={`p-3 text-right font-mono font-bold text-sm ${isNegative ? "text-rose-600" : "text-slate-800"}`}
                      >
                        {isNegative ? "-" : "+"}₱
                        {Math.abs(val).toLocaleString()}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => triggerEditFinance(f)}
                            className="inline-flex items-center gap-1 bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-700 transition px-2.5 py-1.5 rounded text-[10px] font-sans font-bold cursor-pointer"
                            title="Edit financial transaction record"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>Edit Record</span>
                          </button>
                          {f.transType !== "Expense" && (
                            <button
                              onClick={() => setActiveReceipt(f)}
                              className="bg-slate-100 hover:bg-slate-900 hover:text-white transition px-2.5 py-1.5 rounded text-[10px] font-sans font-semibold inline-flex items-center gap-1 text-slate-700 cursor-pointer"
                              id={`print-invoice-${f.id}`}
                            >
                              <Printer className="h-3 w-3" />
                              <span>View Receipt</span>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-xs">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                className="relative ml-2 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-750 hover:bg-slate-50 disabled:opacity-50"
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
                    {Math.min(currentPage * itemsPerPage, finances.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-slate-900">
                    {finances.length}
                  </span>{" "}
                  records
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
                            ? "bg-sky-600 text-white border-sky-600"
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

      {/* RECORD TRANSACTION FORM DIALOG OVERLAY */}
      {showFormModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          id="transaction-form-modal"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col my-8">
            <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono uppercase bg-sky-900 text-sky-200 px-2 py-0.5 rounded block w-fit mb-1 font-bold">
                  LEDGER SYSTEM
                </span>
                <h3 className="font-sans font-semibold text-sm">
                  {editingRecord
                    ? `Registry Edit: Modifying Receipt ${editingRecord.receiptNumber}`
                    : "Log Church Contribution or Expense"}
                </h3>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveTransaction}
              className="p-5 space-y-4 overflow-y-auto max-h-[75vh]"
              id="treasury-form"
            >
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
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
                    className="w-full border bg-white rounded p-1 text-xs text-slate-800 focus:outline-none"
                    id="fin-input-cat"
                  >
                    <option value="Offering">Offering Contribution</option>
                    <option value="Donation">Voluntary Donation</option>
                    <option value="Expense">Church Expenditure</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Misc">Misc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                    Affiliated extension
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${userData.churches.name} Church`}
                    className="w-full border bg-slate-100 font-bold rounded p-1 text-xs text-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Accounting Value (₱ PH) *
                  </label>
                  <div className="relative">
                    <PhilippinePeso className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
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
                      className="w-full pl-8 pr-3 py-2 text-xs border rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500"
                      placeholder="e.g. 5000"
                      id="fin-input-amt"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Log Date *
                  </label>
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
                    className="w-full border rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                    id="fin-input-date"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Statement Description *
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
                  className="w-full border rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                  placeholder="e.g. Weekly Sanctuary Offering Service / Monthly electric bills"
                  id="fin-input-desc"
                />
              </div>

              {newFinance.transType !== "Expense" && (
                <div
                  className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-3"
                  id="donor-profile-details"
                >
                  <span className="block text-[10px] font-mono tracking-wider font-bold text-sky-800 uppercase">
                    Donor Verification Fields (For Official Receipts)
                  </span>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">
                      Quick Autofill Giver from Local Registry list:
                    </label>
                    <select
                      onChange={(e) =>
                        handleSelectMemberContributor(e.target.value)
                      }
                      defaultValue=""
                      className="w-full border bg-white rounded p-1 text-xs text-slate-800 focus:outline-none"
                      id="quick-giver-autofill"
                    >
                      <option value="">-- Choose Giver to Autofill --</option>
                      {/* {members
                        .filter((m) => m.extension === currentExtension)
                        .map((m) => (
                          <option key={m.id} value={m.email}>
                            {m.firstName} {m.lastName} ({m.email})
                          </option>
                        ))} */}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Contributor Full Name
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
                        className="w-full border rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                        placeholder="e.g. Kyle Diel"
                        id="fin-input-giver-name"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Giver Email Address
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
                        className="w-full border rounded-lg p-2 text-xs bg-white text-slate-800 focus:outline-none"
                        placeholder="contributor@email.com"
                        id="fin-input-giver-email"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="flex-1 py-1.8 border text-slate-600 font-semibold border-slate-300 hover:bg-slate-50 text-xs rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="fin-submit-btn"
                  className="flex-1 py-1.8 bg-sky-500 text-slate-900 font-bold hover:bg-sky-600 text-xs rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Receipt className="h-4.5 w-4.5" />
                  <span>
                    {editingRecord
                      ? "Save Record Adjustments"
                      : "Log Gifting and Receipt"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURE OFFICIAL INTERACTIVE RECEIPT PREVIEW (Automatic generation showcase) */}
      {activeReceipt && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          id="receipt-display-overlay"
        >
          <div className="bg-slate-100 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            {/* Header watermarks */}
            <div className="bg-slate-900 p-5 text-white relative flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono tracking-widest font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-full uppercase">
                  Offical Church Receipt
                </span>
                <h3 className="font-sans text-lg font-bold tracking-tight mt-1">
                  {userData.churches.name} - KJVBCCMI
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">
                  Consolidated Extension Network
                </p>
              </div>

              <button
                onClick={() => setActiveReceipt(null)}
                className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full text-slate-400 hover:text-white"
                id="close-receipt-btn"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Receipt body details */}
            <div
              className="p-6 space-y-4 bg-white font-sans text-slate-700"
              id="offical-invoice-template"
            >
              <div className="flex justify-between text-xs font-mono text-slate-500 border-b pb-2">
                <div>
                  <p>
                    Receipt No: <strong>{activeReceipt.receiptNumber}</strong>
                  </p>
                  <p>Date: {activeReceipt.date}</p>
                </div>
                <div className="text-right">
                  <p>
                    Branch: <strong>{activeReceipt.extension}</strong>
                  </p>
                  <p>Auditor: Verified </p>
                </div>
              </div>

              <div className="text-center py-4 bg-slate-50 rounded-xl my-2 border border-slate-100">
                <span className="block text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  Offering / Donation Value
                </span>
                <h1 className="text-3xl font-sans font-bold text-slate-800">
                  ₱{Math.abs(activeReceipt.amount).toLocaleString()}.00
                </h1>
                <span className="text-[10px] font-sans text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold inline-block mt-1">
                  Reconciled and Deposited
                </span>
              </div>

              <div className="space-y-2 text-xs border-b pb-3">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">
                    Contributor / Giver:
                  </span>
                  <span className="font-bold text-slate-800">
                    {activeReceipt.contributorName ||
                      "Generous Sanctuary Giver"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">
                    Registered Address:
                  </span>
                  <span className="font-mono text-slate-600">
                    {activeReceipt.contributorEmail ||
                      "none-provided@church.org"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">
                    Ministry Allocation:
                  </span>
                  <span className="font-bold border px-1.5 py-0.2 bg-slate-50 text-[10px] text-indigo-900 border-indigo-100 rounded">
                    {activeReceipt.transType.toUpperCase()} LEDGER
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">
                    Remarks Annotation:
                  </span>
                  <span className="text-slate-600 italic font-medium">
                    {activeReceipt.description}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col items-center">
                <div className="w-16 h-16 border-2 border-emerald-300 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 relative select-noneRotate animate-bounce">
                  <CheckCircle className="h-8 w-8" />
                  <span className="absolute -bottom-1 bg-white border border-emerald-300 text-[8px] font-mono font-bold px-1 rounded uppercase tracking-widest text-[#059669]">
                    SECURE STAMP
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  A copy of this digital receipt voucher has been dispatched to{" "}
                  {activeReceipt.contributorEmail ||
                    "registered offering lists"}
                  .
                </p>
              </div>
            </div>

            {/* Print and Share footer triggers */}
            <div className="p-4 bg-slate-50 border-t flex gap-2">
              <button
                onClick={() => {
                  alert(
                    "Opening simulated print stream... Outputting PDF receipt format.",
                  );
                  window.print();
                }}
                className="flex-1 py-1.8 bg-slate-900 text-white font-semibold hover:bg-slate-850 text-xs rounded-lg transition text-center flex items-center justify-center gap-2"
              >
                <Printer className="h-4 w-4" />
                <span>Simulate Printing</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Receipt:${activeReceipt.receiptNumber}\nMember:${activeReceipt.contributorName}\nValue:₱${Math.abs(activeReceipt.amount)}\nCampus:${activeReceipt.extension}`,
                  );
                  alert("Receipt code details copied to clipboard!");
                }}
                className="py-1.8 px-4 border border-slate-300 hover:bg-slate-200 transition text-xs font-semibold rounded-lg text-slate-700"
              >
                Copy Ledger Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
