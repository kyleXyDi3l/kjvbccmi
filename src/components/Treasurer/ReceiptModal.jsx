// components/treasurer/ReceiptModal.jsx
import React from "react";
import {
  X,
  Printer,
  Copy,
  CheckCircle,
  Calendar,
  MapPin,
  Shield,
  User,
  Mail,
  Tag,
  FileText,
  Receipt,
} from "lucide-react";

const ReceiptModal = ({ receipt, onClose, churchName }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-content");
    if (printContent) {
      const printWindow = window.open("", "_blank", "width=600,height=800");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Official Church Receipt</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 500px; margin: 0 auto; }
                .receipt { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; }
                .header { text-align: center; border-bottom: 2px solid #1a202c; padding-bottom: 16px; margin-bottom: 16px; }
                .amount { font-size: 32px; font-weight: bold; text-align: center; padding: 16px; background: #f0fdf4; border-radius: 8px; margin: 16px 0; }
                .detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px; }
                @media print {
                  body { padding: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="receipt" id="receipt-content">
                <div class="header">
                  <h2>${churchName || "KJV BCCMI"}</h2>
                  <p style="color: #64748b; font-size: 14px;">Official Church Receipt</p>
                </div>
                <div style="margin-bottom: 12px;">
                  <div style="display: flex; justify-content: space-between; font-size: 14px;">
                    <span style="color: #64748b;">Receipt No:</span>
                    <span style="font-weight: bold;">${receipt.receiptNumber}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 14px; margin-top: 4px;">
                    <span style="color: #64748b;">Date:</span>
                    <span>${receipt.date}</span>
                  </div>
                </div>
                <div class="amount">
                  ₱${Math.abs(receipt.amount).toLocaleString()}.00
                </div>
                <div class="detail">
                  <span style="color: #64748b;">Contributor:</span>
                  <span style="font-weight: 500;">${receipt.contributorName || "Generous Sanctuary Giver"}</span>
                </div>
                <div class="detail">
                  <span style="color: #64748b;">Type:</span>
                  <span style="font-weight: 500;">${receipt.transType?.toUpperCase() || "OFFERING"}</span>
                </div>
                <div class="detail">
                  <span style="color: #64748b;">Description:</span>
                  <span style="font-weight: 500;">${receipt.description}</span>
                </div>
                <div class="footer">
                  <p>This is a system-generated official receipt. Valid for tax and audit purposes.</p>
                  <p style="margin-top: 4px;">${churchName || "KJV BCCMI"} • helpdesk@kjvbccmi.org</p>
                </div>
              </div>
              <div style="text-align: center; margin-top: 20px;" class="no-print">
                <button onclick="window.print()" style="background: #1a202c; color: white; border: none; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                  🖨️ Print Receipt
                </button>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
      }
    }
  };

  const handleCopy = () => {
    const receiptText = `
┌─────────────────────────────────────┐
│     OFFICIAL CHURCH RECEIPT         │
├─────────────────────────────────────┤
│ Receipt No: ${receipt.receiptNumber}
│ Date: ${receipt.date}
│ Branch: ${churchName || "KJV BCCMI"}
│ Amount: ₱${Math.abs(receipt.amount).toLocaleString()}.00
│ Contributor: ${receipt.contributorName || "Anonymous"}
│ Description: ${receipt.description}
├─────────────────────────────────────┤
│ ${churchName || "KJV BCCMI"} - Verified Transaction    │
└─────────────────────────────────────┘`;
    navigator.clipboard.writeText(receiptText);
    alert("✓ Receipt details copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-5 right-5 text-6xl font-mono">⛪</div>
            <div className="absolute bottom-5 left-5 text-6xl font-mono">✝</div>
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
                {churchName || "KJV BCCMI"}
              </h3>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                Consolidated Extension Network • SEC No. CN2011300373
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div
          className="p-6 space-y-5 bg-white font-sans text-slate-700"
          id="receipt-content"
        >
          {/* Receipt Details */}
          <div className="flex justify-between items-start text-xs border-b border-slate-200 pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-slate-400">
                  Receipt No:
                </span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {receipt.receiptNumber}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-slate-400" />
                <span className="font-mono text-[11px] text-slate-600">
                  {receipt.date}
                </span>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span className="font-mono text-[11px] text-slate-600">
                  {churchName || "KJV BCCMI"} Branch
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

          {/* Amount Display */}
          <div className="relative text-center py-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl my-2 border border-emerald-200 shadow-inner">
            <div className="absolute top-2 right-2 opacity-20">
              <Receipt className="h-12 w-12 text-emerald-700" />
            </div>
            <span className="block text-[9px] font-mono text-emerald-600 uppercase font-bold tracking-wider">
              Offering / Donation Value
            </span>
            <h1 className="text-4xl font-sans font-black text-slate-800 mt-1 tracking-tight">
              ₱{Math.abs(receipt.amount).toLocaleString()}.00
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
                <User className="h-3 w-3" /> Contributor / Giver:
              </span>
              <span className="font-bold text-slate-800">
                {receipt.contributorName || "Generous Sanctuary Giver"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Registered Address:
              </span>
              <span className="font-mono text-slate-600 text-[10px]">
                {receipt.contributorEmailAdd ||
                  receipt.contributorEmail ||
                  "none-provided@church.org"}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> Ministry Allocation:
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                  receipt.transType === "Offering"
                    ? "bg-emerald-100 text-emerald-700"
                    : receipt.transType === "Donation"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                {receipt.transType?.toUpperCase() || "OFFERING"} LEDGER
              </span>
            </div>
            <div className="flex justify-between items-start py-1.5">
              <span className="text-slate-500 font-medium flex items-center gap-1.5">
                <FileText className="h-3 w-3" /> Remarks Annotation:
              </span>
              <span className="text-slate-600 italic font-medium max-w-[200px] text-right text-[10px] leading-relaxed">
                {receipt.description}
              </span>
            </div>
          </div>

          {/* Security Stamp */}
          <div className="pt-2 flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div
                    className="w-full h-full bg-white"
                    style={{
                      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
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
                A copy of this digital receipt voucher has been dispatched to{" "}
                <span className="font-semibold text-slate-700">
                  {receipt.contributorEmailAdd?.split("@")[0] ||
                    receipt.contributorEmail?.split("@")[0] ||
                    "registered"}
                </span>
                {(receipt.contributorEmailAdd || receipt.contributorEmail) &&
                  `@${(receipt.contributorEmailAdd || receipt.contributorEmail).split("@")[1]}`}
              </p>
            </div>
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
                {receipt.receiptNumber} • {new Date().getFullYear()}-
                {String(new Date().getMonth() + 1).padStart(2, "0")}-
                {String(new Date().getDate()).padStart(2, "0")}
              </p>
            </div>
          </div>

          {/* Footer */}
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

        {/* Action Buttons */}
        <div className="p-5 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-800 text-white font-bold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <Printer className="h-4 w-4" />
            <span>Print / Save PDF</span>
          </button>
          <button
            onClick={handleCopy}
            className="py-2.5 px-5 border-2 border-slate-200 hover:bg-slate-100 transition-all duration-200 text-xs font-bold rounded-xl text-slate-600 flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
