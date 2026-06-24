import { useState, useRef, useEffect } from "react";
import {
  Printer,
  X,
  Shield,
  CheckCircle,
  AlertCircle,
  Calendar,
  Cross,
} from "lucide-react";

// Import the KJV logo
import kjvLogo from "../../assets/kjvblack.png";

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function PrintableBaptismalCertificate({
  member,
  churchName = "King James Version Bible Christian Church Ministries Inc.",
  churchAddress = "Pandacan, Pinamungajan Cebu City, Philippines 6039",
  pastorName = "Pastor Rey B. Siaboc",
  onClose,
  onPrint,
  className = "",
  showControls = true,
  certificateNumber = null,
  theme: initialTheme = "classic",
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(initialTheme);
  const [isPrinting, setIsPrinting] = useState(false);
  const printFrameRef = useRef(null);

  // Generate certificate number if not provided
  const certNumber =
    certificateNumber ||
    `BAPT-${new Date().getFullYear()}-${String(member?.id || Math.floor(Math.random() * 10000)).padStart(4, "0")}`;

  // Format date
  const formatDate = (date) => {
    if (!date) return "_________________";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Theme styles
  const getThemeStyles = () => {
    switch (theme) {
      case "modern":
        return {
          container: "bg-gradient-to-br from-indigo-50 via-white to-purple-50",
          border: "border-2 border-indigo-300",
          headerBg: "bg-gradient-to-r from-indigo-600 to-purple-600",
          textColor: "text-slate-800",
          accentColor: "text-indigo-600",
          accentBg: "bg-indigo-50",
          accentBorder: "border-indigo-200",
          accentText: "text-indigo-700",
          verseBg: "bg-indigo-50/50",
          verseBorder: "border-indigo-100",
          verseText: "text-indigo-700",
          decorativeLine: "from-indigo-400",
          crossColor: "text-indigo-400",
          badgeBg: "bg-indigo-100",
          badgeText: "text-indigo-700",
          badgeBorder: "border-indigo-200",
          logoBg: "bg-indigo-900",
          logoBorder: "border-indigo-300",
          watermark: "text-indigo-500/5",
        };
      case "minimal":
        return {
          container: "bg-white",
          border: "border-2 border-slate-300",
          headerBg: "bg-slate-800",
          textColor: "text-slate-800",
          accentColor: "text-slate-600",
          accentBg: "bg-slate-50",
          accentBorder: "border-slate-200",
          accentText: "text-slate-700",
          verseBg: "bg-slate-50/50",
          verseBorder: "border-slate-200",
          verseText: "text-slate-600",
          decorativeLine: "from-slate-400",
          crossColor: "text-slate-400",
          badgeBg: "bg-slate-100",
          badgeText: "text-slate-700",
          badgeBorder: "border-slate-200",
          logoBg: "bg-slate-800",
          logoBorder: "border-slate-300",
          watermark: "text-slate-500/5",
        };
      default: // classic
        return {
          container: "bg-gradient-to-br from-amber-50 via-white to-amber-50",
          border: "border-4 border-amber-300",
          headerBg: "bg-gradient-to-r from-amber-800 to-amber-600",
          textColor: "text-slate-800",
          accentColor: "text-amber-700",
          accentBg: "bg-amber-50",
          accentBorder: "border-amber-200",
          accentText: "text-amber-700",
          verseBg: "bg-amber-50/50",
          verseBorder: "border-amber-100",
          verseText: "text-amber-700",
          decorativeLine: "from-amber-400",
          crossColor: "text-amber-400",
          badgeBg: "bg-amber-100",
          badgeText: "text-amber-700",
          badgeBorder: "border-amber-200",
          logoBg: "bg-amber-900",
          logoBorder: "border-amber-300",
          watermark: "text-amber-500/5",
        };
    }
  };

  const styles = getThemeStyles();

  // Print handler with improved functionality
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const isActive = member?.statusId === 14;

  useEffect(() => {
    const handleAfterPrint = () => {
      setIsLoading(false);
      setIsPrinting(false);
    };

    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200 ${className}`}
      id="printable-certificate-modal"
    >
      <style>{`
        /* Print Styles - A4 Optimized */
        @media print {
          /* Hide everything except the certificate */
          body * {
            visibility: hidden !important;
          }
          
          #printable-certificate-frame,
          #printable-certificate-frame * {
            visibility: visible !important;
          }
          
          #printable-certificate-frame {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            z-index: 9999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          /* Hide controls in print */
          .no-print {
            display: none !important;
          }
          
          /* Certificate Container - A4 Optimized */
          .certificate-print-container {
            width: 210mm !important;
            max-width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            padding: 15mm 12mm !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: white !important;
            box-sizing: border-box !important;
          }
          
          .certificate-inner {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            padding: 8mm !important;
            border: 6px solid #d4af37 !important;
            border-radius: 8px !important;
            position: relative !important;
            background: white !important;
          }
          
          .certificate-inner::before {
            content: '' !important;
            position: absolute !important;
            inset: 4mm !important;
            border: 2px solid #d4af37 !important;
            border-radius: 4px !important;
            pointer-events: none !important;
          }
          
          .certificate-watermark {
            position: absolute !important;
            font-size: 180px !important;
            font-weight: 900 !important;
            opacity: 0.03 !important;
            transform: rotate(-30deg) !important;
            pointer-events: none !important;
            user-select: none !important;
            z-index: 0 !important;
            letter-spacing: 10px !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) rotate(-30deg) !important;
          }
          
          .certificate-content {
            position: relative !important;
            z-index: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            height: 100% !important;
            gap: 4px !important;
          }
          
          .certificate-logo {
            width: 70px !important;
            height: 70px !important;
            margin: 0 auto !important;
          }
          
          .certificate-title {
            font-size: 22px !important;
            text-align: center !important;
            margin: 2px 0 !important;
          }
          
          .certificate-church-name {
            font-size: 18px !important;
            text-align: center !important;
            margin: 2px 0 !important;
          }
          
          .certificate-body-text {
            font-size: 13px !important;
            line-height: 1.6 !important;
            text-align: center !important;
            margin: 4px 0 !important;
          }
          
          .certificate-name {
            font-size: 26px !important;
            text-align: center !important;
            margin: 6px 0 !important;
          }
          
          .certificate-signature-line {
            width: 140px !important;
            border-bottom: 2px solid #94a3b8 !important;
            margin: 0 auto !important;
            padding-bottom: 2px !important;
          }
          
          .certificate-verse {
            padding: 8px !important;
            margin: 6px 0 !important;
            border-radius: 4px !important;
            border: 1px solid #fcd34d !important;
            background: #fefce8 !important;
          }
          
          .certificate-verse-text {
            font-size: 11px !important;
            font-style: italic !important;
            text-align: center !important;
          }
          
          .certificate-footer {
            margin-top: 6px !important;
            padding-top: 6px !important;
            border-top: 1px solid #e2e8f0 !important;
            font-size: 8px !important;
            text-align: center !important;
          }
          
          .certificate-ornament {
            text-align: center !important;
            font-size: 12px !important;
            letter-spacing: 4px !important;
            color: #d4af37 !important;
          }
          
          .certificate-decorative-line {
            display: block !important;
            width: 120px !important;
            height: 1px !important;
            margin: 4px auto !important;
            background: linear-gradient(to right, transparent, #d4af37, transparent) !important;
          }
          
          /* Page break control */
          .certificate-verse {
            page-break-inside: avoid !important;
          }
          
          /* Ensure A4 size */
          @page {
            size: A4 portrait !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
        
        /* Screen Styles */
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .certificate-animate {
          animation: fadeIn 0.3s ease-out;
        }
        
        @media print {
          .certificate-animate {
            animation: none;
          }
        }
        
        .print-button {
          transition: all 0.2s ease;
        }
        
        .print-button:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
        }
        
        .print-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col lg:flex-row my-8 animate-in zoom-in-95 duration-300 certificate-animate">
        {/* Left: Printable Certificate View - A4 Optimized */}
        <div
          className="flex-1 p-6 lg:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200"
          id="printable-certificate-frame"
          ref={printFrameRef}
        >
          {/* Certificate Container - A4 Size */}
          <div className="certificate-print-container w-full max-w-4xl">
            <div
              className={`certificate-inner w-full ${styles.border} rounded-2xl shadow-xl bg-white relative`}
            >
              {/* Watermark */}
              <div
                className="certificate-watermark"
                style={{
                  color:
                    theme === "classic"
                      ? "#d4af37"
                      : theme === "modern"
                        ? "#6366f1"
                        : "#94a3b8",
                }}
              >
                KJVBCCMI
              </div>

              <div className="certificate-content p-6 lg:p-8">
                {/* Top Ornament */}
                <div className="text-center mb-2">
                  <span className="text-amber-400 text-sm tracking-[6px]">
                    ✦ ✦ ✦
                  </span>
                </div>

                {/* Top Decorative Line */}
                <div className="flex justify-center mb-3">
                  <div
                    className={`h-0.5 w-32 bg-gradient-to-r from-transparent via-${styles.decorativeLine} to-transparent rounded-full certificate-decorative-line`}
                  />
                </div>

                {/* Header with KJV Logo */}
                <div className="text-center mb-3 relative z-10">
                  <div className="flex justify-center mb-2">
                    <img
                      src={kjvLogo}
                      alt="KJV BCCMI Logo"
                      className="certificate-logo w-20 h-20 object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-center gap-3 mb-1">
                    <div
                      className={`flex-1 h-px bg-gradient-to-r from-transparent to-${styles.decorativeLine}`}
                    />
                    <span
                      className={`text-[10px] font-mono tracking-[0.3em] ${styles.accentColor} font-bold uppercase`}
                    >
                      Certificate of Baptism
                    </span>
                    <div
                      className={`flex-1 h-px bg-gradient-to-l from-transparent to-${styles.decorativeLine}`}
                    />
                  </div>

                  <h1
                    className={`certificate-church-name text-xl lg:text-2xl font-serif font-bold ${styles.accentColor} leading-tight`}
                  >
                    {churchName}
                  </h1>

                  <div className="mt-1 inline-block bg-slate-100 px-3 py-0.5 rounded-full">
                    <p className="text-[8px] text-slate-500 font-mono">
                      Certificate No. {certNumber}
                    </p>
                  </div>
                </div>

                {/* Main Content */}
                {/* Main Content */}
                <div className="space-y-1 text-center relative z-10 flex-1">
                  <p className="certificate-body-text text-xs lg:text-sm text-slate-700 font-serif leading-relaxed">
                    This is to certify that on this day,{" "}
                    <span className="font-bold text-slate-900">
                      {formatDate(member?.baptisedDate || new Date())}
                    </span>
                    , the following individual was baptized in the name of the
                    Father, and of the Son, and of the Holy Spirit.
                  </p>

                  <div className="py-1 lg:py-2">
                    <div className="relative">
                      {/* Background gradient */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-r from-${styles.accentColor.replace("text-", "")}/10 via-transparent to-${styles.accentColor.replace("text-", "")}/10 rounded-lg`}
                      />

                      {/* Decorative border */}
                      <div className="absolute inset-0 border border-amber-200/50 rounded-lg" />

                      <div className="relative py-2 px-3">
                        {/* Gold accent line above name */}
                        <div className="flex justify-center mb-1">
                          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />
                        </div>

                        {/* Name with styling */}
                        <p className="certificate-name text-2xl lg:text-3xl font-serif font-bold text-slate-900 tracking-wide">
                          {member?.firstName} {member?.middleName}{" "}
                          {member?.lastName}
                        </p>

                        {/* Decorative underline */}
                        <div className="flex justify-center mt-1">
                          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />
                        </div>

                        <p className="text-[8px] lg:text-[10px] text-slate-400 font-mono mt-1">
                          (Full Name of the Baptized)
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="certificate-body-text text-xs lg:text-sm text-slate-700 font-serif leading-relaxed">
                    Born on{" "}
                    <span className="font-bold text-slate-900">
                      {formatDate(member?.birthDate)}
                    </span>
                    {member?.churchName && (
                      <>
                        {" • "}Member of{" "}
                        <span className="font-bold text-slate-900">
                          {member.churchName}
                        </span>{" "}
                        Church
                      </>
                    )}
                  </p>

                  {/* Ornament Divider */}
                  <div className="flex justify-center items-center gap-3 py-0.5">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-300" />
                    <span className="text-amber-400 text-[10px]">✧</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-300" />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-4 pt-1">
                    <div className="text-center">
                      <div className="certificate-signature-line">
                        <span className="text-[10px] lg:text-xs font-serif italic text-slate-700">
                          {pastorName}
                        </span>
                      </div>
                      <p className="text-[7px] lg:text-[8px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                        Officiating Pastor
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="certificate-signature-line">
                        <span className="text-[10px] lg:text-xs font-serif text-slate-700">
                          _________________
                        </span>
                      </div>
                      <p className="text-[7px] lg:text-[8px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                        Date of Baptism
                      </p>
                    </div>
                  </div>

                  {/* Scripture Verse */}
                  <div
                    className={`certificate-verse mt-1 p-2 lg:p-3 ${styles.verseBg} rounded-lg border ${styles.verseBorder}`}
                  >
                    <p
                      className={`certificate-verse-text text-[9px] lg:text-[10px] ${styles.verseText} font-serif italic leading-relaxed`}
                    >
                      "Therefore go and make disciples of all nations, baptizing
                      them in the name of the Father and of the Son and of the
                      Holy Spirit."
                    </p>
                    <p
                      className={`text-[8px] lg:text-[9px] ${styles.accentColor} font-mono mt-0.5`}
                    >
                      — Matthew 28:19 (KJV)
                    </p>
                  </div>
                </div>

                {/* Bottom Decorative Line */}
                <div className="flex justify-center mt-3">
                  <div
                    className={`h-0.5 w-32 bg-gradient-to-r from-transparent via-${styles.decorativeLine} to-transparent rounded-full certificate-decorative-line`}
                  />
                </div>

                {/* Footer */}
                <div className="certificate-footer mt-2 pt-2 border-t border-slate-200 relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-1">
                    <div className="text-left">
                      <p className="text-[7px] text-slate-400 font-mono leading-tight">
                        {churchAddress}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded-full ${styles.accentBg} flex items-center justify-center`}
                      >
                        <Shield
                          className={`h-2.5 w-2.5 ${styles.accentColor}`}
                        />
                      </div>
                      <span className="text-[7px] text-slate-400 font-mono">
                        Official Church Record
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] text-slate-400 font-mono">
                        KJV BCCMI
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Ornament */}
                <div className="text-center mt-1">
                  <span className="text-amber-400 text-xs tracking-[6px]">
                    ✦ ✦ ✦
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              {isActive && (
                <div className="absolute top-3 right-3 no-print">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 ${styles.badgeBg} ${styles.badgeText} rounded-full text-[8px] font-bold border ${styles.badgeBorder}`}
                  >
                    <CheckCircle className="h-2.5 w-2.5" />
                    Active Member
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Preview Info */}
          <div className="mt-3 text-center no-print">
            <p
              className={`text-[8px] font-mono ${isActive ? "text-emerald-600" : "text-amber-600"}`}
            >
              {isActive
                ? "✓ Member is fully activated"
                : "⚠️ Only fully activated members can generate baptismal certificates"}
            </p>
            <p className="text-[7px] text-slate-400 font-mono mt-0.5">
              A4 Portrait • 210mm x 297mm
            </p>
          </div>
        </div>

        {/* Right: Controls Panel */}
        {showControls && (
          <div className="w-full lg:w-72 p-6 flex flex-col justify-between space-y-6 bg-white no-print">
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-orange-600 px-2.5 py-1 rounded-lg mb-2">
                    <Cross className="h-3 w-3 text-white" />
                    <span className="text-[8px] font-mono font-bold text-white uppercase tracking-wider">
                      Certificate Engine
                    </span>
                  </div>
                  <h3 className="font-sans font-black text-slate-900 text-lg uppercase tracking-tight">
                    Baptismal Certificate
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Generate official baptismal certificate
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
                {/* Member Info */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="flex items-center gap-3">
                    {member?.profilePic ? (
                      <img
                        src={member.profilePic}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                        {member?.firstName?.[0]}
                        {member?.lastName?.[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {member?.firstName} {member?.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {member?.emailAdd}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    Baptism Date
                  </label>
                  <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                    <p className="text-sm font-medium text-slate-700">
                      {member?.baptisedDate
                        ? formatDate(member.baptisedDate)
                        : "Not set"}
                    </p>
                  </div>
                </div>

                {/* Status Check */}
                <div
                  className={`rounded-xl p-3 ${isActive ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}
                >
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                    )}
                    <span
                      className={`text-xs font-semibold ${isActive ? "text-emerald-700" : "text-amber-700"}`}
                    >
                      {isActive
                        ? "Member is fully activated"
                        : "Member not fully activated"}
                    </span>
                  </div>
                  {!isActive && (
                    <p className="text-[10px] text-amber-600 mt-1">
                      Only fully activated members (status: Active) can generate
                      baptismal certificates.
                    </p>
                  )}
                </div>

                {/* Certificate Number */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase">
                    Certificate Number
                  </label>
                  <p className="text-xs font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                    {certNumber}
                  </p>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase">
                    Certificate Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setTheme("classic")}
                      className={`px-2 py-1.5 text-[9px] font-semibold rounded-lg border transition-all duration-200 ${
                        theme === "classic"
                          ? "bg-amber-100 border-amber-400 text-amber-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50"
                      }`}
                    >
                      Classic
                    </button>
                    <button
                      onClick={() => setTheme("modern")}
                      className={`px-2 py-1.5 text-[9px] font-semibold rounded-lg border transition-all duration-200 ${
                        theme === "modern"
                          ? "bg-indigo-100 border-indigo-400 text-indigo-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}
                    >
                      Modern
                    </button>
                    <button
                      onClick={() => setTheme("minimal")}
                      className={`px-2 py-1.5 text-[9px] font-semibold rounded-lg border transition-all duration-200 ${
                        theme === "minimal"
                          ? "bg-slate-100 border-slate-400 text-slate-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      Minimal
                    </button>
                  </div>
                </div>

                {/* Print Instructions */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase flex items-center gap-1.5">
                    <Printer className="h-3 w-3" />
                    Print Specifications
                  </label>
                  <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                    <p className="text-[9px] text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Use high-quality paper (parchment or linen)
                    </p>
                    <p className="text-[9px] text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Select "Actual Size" in print dialog
                    </p>
                    <p className="text-[9px] text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Enable "Background Graphics" option
                    </p>
                    <p className="text-[9px] text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      A4 Portrait (210mm x 297mm)
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
                disabled={!isActive || isLoading || isPrinting}
                className={`print-button flex-1 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading || isPrinting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isPrinting ? "Printing..." : "Processing..."}</span>
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4" />
                    <span>Print Certificate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
