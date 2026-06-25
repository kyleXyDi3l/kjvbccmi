// components/treasurer/DigitalIDCard.jsx
import React, { useRef, useState } from "react";
import {
  Printer,
  Download,
  Shield,
  CheckCircle,
  Church,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Award,
} from "lucide-react";

// Church Logo Component
const ChurchLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="32" height="32" rx="8" fill="#4F46E5" />
    <path
      d="M16 6L6 14V24H12V18H20V24H26V14L16 6Z"
      stroke="white"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M16 10L12 14V18H20V14L16 10Z" fill="white" />
  </svg>
);

const DigitalIDCard = ({
  memberData,
  churchName,
  churchAddress,
  isDark = false,
  onPrint,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const fullName = memberData
    ? `${memberData.firstName} ${memberData.lastName}`
    : "Member Name";
  const memberId = memberData?.id || "N/A";
  const role = memberData?.role || "Member";
  const status = memberData?.membershipStatus || "Active";
  const email = memberData?.emailAdd || "N/A";
  const phone = memberData?.phoneNumber || "N/A";
  const joinDate = memberData?.created_at
    ? new Date(memberData.created_at).toLocaleDateString()
    : "N/A";

  // Theme based on isDark prop
  const cardBg = isDark
    ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    : "bg-white";
  const cardBorder = isDark ? "border-indigo-500/30" : "border-slate-200";
  const labelColor = isDark ? "text-indigo-300" : "text-slate-400";
  const valueColor = isDark ? "text-white" : "text-slate-800";
  const verifiedBg = isDark ? "bg-emerald-500/20" : "bg-emerald-50";
  const verifiedBorder = isDark
    ? "border-emerald-400/30"
    : "border-emerald-200";
  const verifiedText = isDark ? "text-emerald-300" : "text-emerald-600";

  const handlePrint = () => {
    setIsPrinting(true);
    const printContent = document.getElementById("digital-id-card-print");
    if (printContent) {
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        // Get the current theme styles
        const styles = document.querySelector("style")?.innerHTML || "";

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Church ID Card - ${fullName}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: #f0f4f8;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  padding: 20px;
                }
                .id-card-print {
                  max-width: 420px;
                  width: 100%;
                  background: ${isDark ? "#1a1a2e" : "white"};
                  border-radius: 20px;
                  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                  overflow: hidden;
                  border: 1px solid ${isDark ? "#4F46E5/30" : "#e2e8f0"};
                }
                .card-header {
                  padding: 16px 20px;
                  border-bottom: 1px solid ${isDark ? "#4F46E5/30" : "#e2e8f0"};
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  background: ${isDark ? "#1e1e3f" : "#f8fafc"};
                }
                .card-body {
                  padding: 20px;
                  display: flex;
                  gap: 16px;
                  min-height: 160px;
                }
                .avatar {
                  width: 72px;
                  height: 72px;
                  border-radius: 12px;
                  background: ${isDark ? "linear-gradient(135deg, #4F46E5, #7C3AED)" : "linear-gradient(135deg, #818cf8, #6366f1)"};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 28px;
                  font-weight: 700;
                  color: white;
                  flex-shrink: 0;
                  border: 2px solid ${isDark ? "#4F46E5/50" : "#e0e7ff"};
                }
                .member-info { flex: 1; }
                .member-name { 
                  font-size: 16px; 
                  font-weight: 700; 
                  color: ${isDark ? "white" : "#1a202c"};
                }
                .member-role { 
                  font-size: 12px; 
                  color: ${isDark ? "#818cf8" : "#6366f1"}; 
                  font-weight: 600; 
                }
                .member-status {
                  display: inline-block;
                  padding: 2px 10px;
                  border-radius: 50px;
                  font-size: 9px;
                  font-weight: 600;
                  background: ${isDark ? "#10b981/20" : "#d1fae5"};
                  color: ${isDark ? "#34d399" : "#065f46"};
                  border: 1px solid ${isDark ? "#34d399/30" : "#d1fae5"};
                  margin-top: 4px;
                }
                .details-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 8px;
                  margin-top: 12px;
                  padding-top: 12px;
                  border-top: 1px solid ${isDark ? "#4F46E5/20" : "#f1f5f9"};
                }
                .detail-label {
                  font-size: 8px;
                  text-transform: uppercase;
                  color: ${isDark ? "#818cf8" : "#94a3b8"};
                  font-weight: 600;
                  letter-spacing: 0.5px;
                }
                .detail-value {
                  font-size: 12px;
                  font-weight: 600;
                  color: ${isDark ? "white" : "#1a202c"};
                  margin-top: 2px;
                  word-break: break-word;
                }
                .card-footer {
                  padding: 12px 20px;
                  border-top: 1px solid ${isDark ? "#4F46E5/20" : "#e2e8f0"};
                  background: ${isDark ? "#1e1e3f" : "#f8fafc"};
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 10px;
                  color: ${isDark ? "#818cf8" : "#94a3b8"};
                }
                .qr-placeholder {
                  width: 40px;
                  height: 40px;
                  background: ${isDark ? "#2d2d5e" : "#f1f5f9"};
                  border-radius: 8px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                .qr-placeholder .grid {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 2px;
                  padding: 4px;
                }
                .qr-placeholder .grid .cell {
                  width: 8px;
                  height: 8px;
                }
                .qr-placeholder .grid .cell.dark { background: ${isDark ? "#818cf8" : "#1a202c"}; }
                .qr-placeholder .grid .cell.light { background: ${isDark ? "#4F46E5/30" : "#cbd5e1"}; }
                @media print {
                  body { background: white; padding: 0; }
                  .id-card-print { box-shadow: none; border: 1px solid #e2e8f0; }
                }
              </style>
            </head>
            <body>
              <div class="id-card-print" id="digital-id-card-print">
                <div class="card-header">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="8" fill="#4F46E5" />
                    <path d="M16 6L6 14V24H12V18H20V24H26V14L16 6Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M16 10L12 14V18H20V14L16 10Z" fill="white" />
                  </svg>
                  <div>
                    <div style="font-size: 11px; font-weight: 700; color: ${isDark ? "white" : "#1a202c"};">
                      ${churchName || "KJV BCCMI"}
                    </div>
                    <div style="font-size: 8px; color: ${isDark ? "#818cf8" : "#64748b"};">
                      Official Church ID • ${churchAddress || "Global Headquarters"}
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <div class="avatar">${memberData?.firstName?.[0] || "M"}${memberData?.lastName?.[0] || "M"}</div>
                  <div class="member-info">
                    <div class="member-name">${fullName}</div>
                    <div class="member-role">${role}</div>
                    <span class="member-status">${status}</span>
                    <div class="details-grid">
                      <div>
                        <div class="detail-label">Member ID</div>
                        <div class="detail-value" style="font-family: monospace; font-size: 11px;">#${memberId.slice(0, 8)}</div>
                      </div>
                      <div>
                        <div class="detail-label">Joined</div>
                        <div class="detail-value">${joinDate}</div>
                      </div>
                      <div>
                        <div class="detail-label">Email</div>
                        <div class="detail-value" style="font-size: 11px;">${email}</div>
                      </div>
                      <div>
                        <div class="detail-label">Phone</div>
                        <div class="detail-value" style="font-size: 11px;">${phone}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="card-footer">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="qr-placeholder">
                      <div class="grid">
                        ${Array.from({ length: 9 })
                          .map(
                            (_, i) => `
                          <div class="cell ${i % 2 === 0 ? "dark" : "light"}"></div>
                        `,
                          )
                          .join("")}
                      </div>
                    </div>
                    <div>
                      <div style="font-weight: 600; color: ${isDark ? "white" : "#475569"};">Verify with QR</div>
                      <div style="font-size: 8px; color: ${isDark ? "#818cf8" : "#94a3b8"};">Scan to validate membership</div>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-weight: 600; color: ${isDark ? "white" : "#475569"};">${churchName || "KJV BCCMI"}</div>
                    <div style="font-size: 8px; color: ${isDark ? "#818cf8" : "#94a3b8"};">${new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          setIsPrinting(false);
        }, 500);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* ID Card - Using the exact design from PrintableIDCard */}
      <div
        className={`w-[360px] h-[225px] ${cardBg} rounded-2xl shadow-2xl p-5 relative overflow-hidden border ${cardBorder} select-none flex flex-col justify-between shrink-0 transition-all hover:shadow-3xl hover:scale-[1.02]`}
        id="digital-id-card-print"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div
          className={`flex items-center gap-3 pb-3 border-b ${isDark ? "border-indigo-500/30" : "border-slate-200"} relative z-10`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-400/20 blur-md rounded-full" />
            <ChurchLogo />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={`text-[10px] font-extrabold uppercase ${isDark ? "text-white" : "text-slate-800"} tracking-tight leading-tight`}
            >
              {churchName || "King James Version Bible Christian Church"}
            </h4>
            <p
              className={`text-[7px] ${isDark ? "text-indigo-300" : "text-slate-500"} mt-0.5 leading-tight tracking-wider uppercase font-mono`}
            >
              Ministries Inc. • SEC No. CN2011300373
            </p>
          </div>
        </div>

        {/* Member Details */}
        <div className="flex gap-4 pt-3 flex-grow relative z-10">
          {/* Profile Picture */}
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            {memberData?.profilePic ? (
              <img
                src={memberData.profilePic}
                alt="Member"
                className="w-[70px] h-[70px] bg-slate-100 border-2 border-slate-300 rounded-xl object-cover shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className={`w-[70px] h-[70px] ${isDark ? "bg-gradient-to-br from-indigo-600 to-purple-600" : "bg-gradient-to-br from-indigo-100 to-purple-100"} border-2 border-slate-300 rounded-xl flex items-center justify-center font-sans font-extrabold ${isDark ? "text-indigo-100" : "text-indigo-600"} text-2xl shadow-md`}
              >
                {memberData?.firstName?.[0]?.toUpperCase() || "U"}
                {memberData?.lastName?.[0]?.toUpperCase() || "S"}
              </div>
            )}
            <span
              className={`text-[7px] font-mono tracking-wider ${verifiedBg} border ${verifiedBorder} ${verifiedText} px-2 py-0.5 rounded-full uppercase font-bold`}
            >
              ✓ Verified Member
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2 py-0.5">
            <div>
              <span
                className={`text-[6.5px] ${labelColor} font-mono tracking-wider font-semibold block uppercase`}
              >
                Full Registered Name
              </span>
              <h5
                className={`text-[13px] font-extrabold ${valueColor} leading-tight tracking-tight mt-0.5`}
              >
                {memberData?.firstName} {memberData?.lastName}
              </h5>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
              <div>
                <span
                  className={`text-[6px] ${labelColor} font-mono font-semibold block uppercase`}
                >
                  ID Credentials
                </span>
                <span
                  className={`text-[9px] font-mono font-bold ${valueColor} block mt-0.5 ${isDark ? "bg-indigo-950/50" : "bg-slate-100"} px-1.5 py-0.5 rounded`}
                >
                  {memberId.slice(0, 8)}
                </span>
              </div>
              <div>
                <span
                  className={`text-[6px] ${labelColor} font-mono font-semibold block uppercase`}
                >
                  Extension
                </span>
                <span
                  className={`text-[9px] font-sans font-medium ${valueColor} block mt-0.5 truncate`}
                >
                  {churchName || "Naga"} Church
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span
                  className={`text-[6px] ${labelColor} font-mono font-semibold block uppercase`}
                >
                  Valid Since
                </span>
                <span
                  className={`text-[8.5px] font-mono font-medium ${valueColor} block mt-0.5`}
                >
                  {joinDate}
                </span>
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-[6px] ${labelColor} font-mono font-semibold block uppercase`}
                >
                  Signature
                </span>
                <div className="mt-0.5">
                  {memberData?.signature ? (
                    <img
                      src={memberData.signature}
                      alt="Signature"
                      className="h-8 w-auto object-contain"
                      referrerPolicy="no-referrer"
                      style={{
                        mixBlendMode: "multiply",
                        filter: "contrast(1.2) brightness(1.1)",
                      }}
                    />
                  ) : memberData?.typedSignature ? (
                    <span className="font-serif italic text-[10px] text-slate-600">
                      {memberData.typedSignature}
                    </span>
                  ) : (
                    <span className="text-[7px] text-slate-400 italic">
                      No signature
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex justify-between items-end border-t ${isDark ? "border-indigo-500/30" : "border-slate-200"} pt-2 mt-1 relative z-10`}
        >
          <div
            className={`text-[5.5px] ${isDark ? "text-indigo-300" : "text-slate-400"} font-mono uppercase tracking-wider`}
          >
            Official Church Identification Pass (KJV BCCMI)
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Shield
                className={`h-3 w-3 ${isDark ? "text-indigo-400" : "text-indigo-500"}`}
              />
              <span
                className={`text-[5.5px] ${isDark ? "text-indigo-300" : "text-slate-400"} font-mono uppercase tracking-wider`}
              >
                Verified
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handlePrint}
          disabled={isPrinting}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPrinting ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Printing...
            </>
          ) : (
            <>
              <Printer className="h-4 w-4" />
              Print ID Card
            </>
          )}
        </button>
        <button
          onClick={() => {
            const cardElement = document.getElementById(
              "digital-id-card-print",
            );
            if (cardElement) {
              // Create a download of the card as an image or PDF
              // For now, we'll just trigger the print dialog
              handlePrint();
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl transition-all duration-200"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      </div>

      {/* Info Note */}
      <div className="w-full max-w-md p-3 bg-indigo-50 rounded-xl border border-indigo-200">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-700">
            This digital ID is valid for church-related activities and events.
            Present this ID when participating in church functions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DigitalIDCard;
