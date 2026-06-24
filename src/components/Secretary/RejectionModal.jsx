import { X, AlertCircle } from "lucide-react";

export default function RejectionModal({
  isOpen,
  onClose,
  onConfirm,
  member,
  reason,
  setReason,
  loading,
}) {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-rose-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Reject Application
          </h2>
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Please provide a reason for rejecting {member.firstName}{" "}
          {member.lastName}'s application.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows="4"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none mb-4"
          placeholder="Enter rejection reason..."
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}
