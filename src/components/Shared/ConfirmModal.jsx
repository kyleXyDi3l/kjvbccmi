import { X, AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // 'danger' | 'warning' | 'info'
  isLoading = false,
}) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          header: "bg-gradient-to-r from-rose-600 to-red-600",
          button:
            "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700",
        };
      case "warning":
        return {
          header: "bg-gradient-to-r from-amber-600 to-orange-600",
          button:
            "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
        };
      default:
        return {
          header: "bg-gradient-to-r from-indigo-600 to-purple-600",
          button:
            "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        <div className={`relative ${styles.header} px-6 py-5`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <p className="text-xs text-white/80">{message}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 py-2.5 ${styles.button} text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
