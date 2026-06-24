import { useState, useRef, useEffect } from "react";
import {
  Printer,
  X,
  Shield,
  CheckCircle,
  AlertCircle,
  PenTool,
  Users,
  ChevronRight,
} from "lucide-react";

// ============================================================
// SUB-COMPONENTS
// ============================================================

// SVG Logo Component
const ChurchLogo = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 shrink-0 relative z-10">
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D4AF37" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
    </defs>
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
      fill="#F8FAFC"
      stroke="url(#goldGradient)"
      strokeWidth="1"
    />
    <circle cx="50" cy="50" r="30" fill="#E2E8F0" />
    <path
      d="M35 55 C42 50,48 53,50 55 C52 53,58 50,65 55 L65 42 C58 37,52 40,50 42 C48 40,42 37,35 42 Z"
      fill="#1E293B"
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
    <path d="M48 45 L52 45 M50 43 L50 49" stroke="#E11D48" strokeWidth="1" />
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
      fill="#1E293B"
      fontSize="4.5"
      fontWeight="semibold"
      textAnchor="middle"
    >
      1611
    </text>
  </svg>
);

// Barcode Component
const Barcode = ({ id }) => (
  <div className="bg-white h-10 w-24 border border-slate-200 rounded-md flex items-center justify-center gap-0.5 px-1 shadow-inner">
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className="bg-slate-700 opacity-80"
        style={{
          width: `${Math.floor(Math.random() * 3) + 1}px`,
          height: `${Math.floor(Math.random() * 6) + 4}px`,
        }}
      />
    ))}
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function PrintableIDCard({
  member,
  churchName = "KJV BCCMI",
  onClose,
  onPrint,
  className = "",
  showControls = true,
  theme = "light", // 'light' | 'dark'
  signatureUrl = null,
  signatureType = "uploaded", // 'uploaded' | 'typed' | 'drawn'
  typedSignature = "",
  onSignatureChange = null,
  canvasRef = null,
  onCanvasDraw = null,
}) {
  const [sigType, setSigType] = useState(signatureType);
  const [localCanvasRef, setLocalCanvasRef] = useState(null);
  const internalCanvasRef = useRef(null);

  // Use provided canvas ref or internal
  const canvasEl = canvasRef || internalCanvasRef;

  // Handle signature type change
  const handleSigTypeChange = (type) => {
    setSigType(type);
    if (onSignatureChange) {
      onSignatureChange(type);
    }
  };

  // Print handler
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  // Determine if signature is uploaded
  const hasUploadedSignature = signatureUrl && signatureUrl.trim() !== "";

  // Theme styles
  const isDark = theme === "dark";
  const cardBg = isDark
    ? "bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white"
    : "bg-gradient-to-br from-slate-50 to-white text-slate-800";
  const cardBorder = isDark ? "border-indigo-500/30" : "border-slate-300";
  const accentColor = isDark ? "indigo-300" : "slate-400";
  const labelColor = isDark ? "indigo-300" : "slate-400";
  const valueColor = isDark ? "white" : "slate-800";
  const verifiedBg = isDark ? "emerald-500/30" : "emerald-100";
  const verifiedText = isDark ? "emerald-300" : "emerald-700";
  const verifiedBorder = isDark ? "emerald-400/40" : "emerald-200";

  return (
    <div
      className={`fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200 ${className}`}
      id="printable-id-modal"
    >
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-id-card-frame, #printable-id-card-frame * { visibility: visible !important; }
          #printable-id-card-frame {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            box-shadow: none !important;
            transform: none !important;
          }
          .no-print { display: none !important; }
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
        {/* Left: Printable Card View */}
        <div
          className="flex-1 bg-gradient-to-br from-slate-100 to-slate-50 p-6 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200"
          id="printable-id-card-frame"
        >
          {/* Header Info - Only visible on screen */}
          <div className="text-center mb-5 no-print">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-slate-200">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-wider font-bold text-indigo-700 uppercase">
                Official ID Card Preview
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-sans">
              Card size: CR-80 Standard (3.37" x 2.125") • High-resolution ready
            </p>
          </div>

          {/* Double-sided Cards Deck */}
          <div className="space-y-6 flex flex-col items-center justify-center w-full">
            {/* CARD FRONT SIDE */}
            <div
              className={`w-[360px] h-[225px] ${cardBg} rounded-2xl shadow-2xl p-5 relative overflow-hidden border ${cardBorder} select-none flex flex-col justify-between shrink-0 transition-all hover:shadow-3xl hover:scale-[1.02]`}
              id="id-card-front"
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
                    King James Version Bible Christian Church
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
                  {member?.profilePic ? (
                    <img
                      src={member.profilePic}
                      alt="Member"
                      className="w-[70px] h-[70px] bg-slate-100 border-2 border-slate-300 rounded-xl object-cover shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div
                      className={`w-[70px] h-[70px] ${isDark ? "bg-gradient-to-br from-indigo-600 to-purple-600" : "bg-gradient-to-br from-indigo-100 to-purple-100"} border-2 border-slate-300 rounded-xl flex items-center justify-center font-sans font-extrabold ${isDark ? "text-indigo-100" : "text-indigo-600"} text-2xl shadow-md`}
                    >
                      {member?.firstName?.[0]?.toUpperCase() || "U"}
                      {member?.lastName?.[0]?.toUpperCase() || "S"}
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
                      {member?.firstName} {member?.lastName}
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
                        {member?.id}
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
                        {member?.joinDate || "2024-01-01"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-[6px] ${labelColor} font-mono font-semibold block uppercase`}
                      >
                        Signature
                      </span>
                      <div className="mt-0.5">
                        {hasUploadedSignature ? (
                          <img
                            src={signatureUrl}
                            alt="Signature"
                            className="h-8 w-auto object-contain"
                            referrerPolicy="no-referrer"
                            style={{
                              mixBlendMode: "multiply",
                              filter: "contrast(1.2) brightness(1.1)",
                            }}
                          />
                        ) : sigType === "typed" && typedSignature ? (
                          <span className="font-serif italic text-[10px] text-slate-600">
                            {typedSignature}
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
              </div>
            </div>

            {/* CARD BACK SIDE */}
            <div
              className="w-[360px] h-[225px] bg-gradient-to-br from-slate-50 to-white text-slate-800 rounded-2xl shadow-2xl p-5 relative overflow-hidden border border-slate-300 select-none flex flex-col justify-between shrink-0 transition-all hover:shadow-3xl"
              id="id-card-back"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Shield className="h-32 w-32 text-slate-400" />
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
                  This digital identification key certifies that the bearer is a
                  fully-baptized and validated active member of the King James
                  Version Bible Christian Church and Ministries Inc.
                  congregation ecosystem.
                </p>

                <p className="text-[6.5px] text-slate-600 leading-relaxed">
                  Members pledge to faithfully walk together in brotherly love,
                  seek the spiritual progress of the assembly, sustain its
                  worship, ordinances, discipline, and contribute cheerfully to
                  expenditures.
                </p>

                <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <p className="text-[6px] text-slate-700 leading-relaxed">
                    <strong className="text-amber-800">If found:</strong> Please
                    return to Main Church Office, Pandacan, Pinamungajan Cebu
                    City, Philippines, 6093.
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
                  {/* <div className="h-7 flex items-end">
                    <span className="font-serif italic text-[10px] text-slate-600 border-b border-slate-300 pb-0.5">
                      {secretarySig || "Vengie Alterado"}
                    </span>
                  </div>
                  <div className="text-[5px] font-mono uppercase text-slate-400 tracking-wider mt-1">
                    Church Secretary
                  </div> */}
                </div>

                <Barcode id={member?.id} />

                <div className="text-right">
                  {/* <div className="h-7 flex items-end justify-end">
                    <span className="font-serif italic text-[10px] text-indigo-700 border-b border-indigo-200 pb-0.5">
                      {pastorSig || "Rey Siaboc"}
                    </span>
                  </div>
                  <div className="text-[5px] font-mono uppercase text-slate-400 tracking-wider mt-1">
                    Senior Pastor
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls Panel */}
        {showControls && (
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
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Configuration Options */}
              <div className="space-y-5 border-t border-slate-100 pt-5">
                {/* Signature Info */}
                {hasUploadedSignature ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">
                        Signature uploaded
                      </span>
                    </div>
                    <div className="mt-2">
                      <img
                        src={signatureUrl}
                        alt="Member Signature"
                        className="h-12 w-auto object-contain border border-slate-200 rounded-lg p-1 bg-white"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Signature will appear on the ID card.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700">
                        No signature uploaded
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Please upload a signature for this member.
                    </p>
                  </div>
                )}

                {/* Officer Signatures Section */}
                {/* <div className="space-y-2 pt-2">
                  <label className="block text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    1. Officer Signatures (Optional)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Secretary Name"
                      value={secretarySig}
                      onChange={(e) => {
                        // This would be handled by parent
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Pastor Name"
                      value={pastorSig}
                      onChange={(e) => {
                        // This would be handled by parent
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div> */}

                {/* Print Instructions */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Printer className="h-3 w-3" />
                    2. Print Specifications
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
                onClick={onClose}
                className="flex-1 py-3 border-2 border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer uppercase tracking-wide"
              >
                Cancel
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Printer className="h-4 w-4" />
                <span>Print ID Card</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
