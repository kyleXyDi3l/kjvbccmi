import { CheckCircle, X } from "lucide-react";

export default function SuccessMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="mx-6 mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
      <CheckCircle className="h-4 w-4 text-emerald-600" />
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-auto text-emerald-500 hover:text-emerald-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
