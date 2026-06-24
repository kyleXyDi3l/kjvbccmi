import React from "react";
import { X, Printer } from "lucide-react";
import EventReport from "./EventReport";

const EventReportModal = ({
  isOpen,
  onClose,
  event,
  eventTransactions,
  eventStats,
  churchName,
}) => {
  if (!isOpen) return null;

  const reportHTML = EventReport({
    event,
    eventTransactions,
    eventStats,
    churchName,
  });

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-lg">
                Event Report Preview
              </h3>
              <p className="text-sm text-white/80">
                Review and print the financial report
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <iframe
            srcDoc={reportHTML}
            className="w-full h-[70vh] border-0 rounded-lg"
            title="Event Report"
            sandbox="allow-scripts allow-print"
          />
        </div>
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all duration-200"
          >
            Close
          </button>
          <button
            onClick={() => {
              const printWindow = window.open(
                "",
                "_blank",
                "width=1200,height=800",
              );
              if (printWindow) {
                printWindow.document.write(reportHTML);
                printWindow.document.close();
                printWindow.onload = () => {
                  printWindow.print();
                };
              }
            }}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventReportModal;
