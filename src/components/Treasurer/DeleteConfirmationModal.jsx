// components/treasurer/DeleteConfirmationModal.jsx
import React from "react";
import { X, AlertTriangle, Trash2, Shield, AlertCircle } from "lucide-react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName = "",
  itemType = "item",
  isDeleting = false,
  variant = "danger", // "danger" | "warning" | "info"
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: AlertTriangle,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      buttonBg: "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500",
      buttonText: "Delete",
      borderColor: "border-rose-200",
    },
    warning: {
      icon: AlertCircle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      buttonBg: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
      buttonText: "Confirm",
      borderColor: "border-amber-200",
    },
    info: {
      icon: Shield,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonBg: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      buttonText: "Confirm",
      borderColor: "border-blue-200",
    },
  };

  const styles = variantStyles[variant] || variantStyles.danger;
  const IconComponent = styles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${styles.iconBg} ${styles.iconColor}`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                {itemName && (
                  <p className="text-xs text-slate-500 font-mono">
                    {itemType}: {itemName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div
            className={`p-4 rounded-xl bg-slate-50 border ${styles.borderColor}`}
          >
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>

          {/* Warning Details */}
          <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              This action is permanent and cannot be reversed. All associated
              data will be removed from the system.
            </span>
          </div>

          {/* Additional Info for Transaction Deletion */}
          {itemType === "transaction" && (
            <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Deleting this transaction will also update the event's total
                income, expenses, and net balance.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 border-2 border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`flex-1 py-2.5 px-4 text-white font-semibold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.buttonBg} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isDeleting ? (
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
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {styles.buttonText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
