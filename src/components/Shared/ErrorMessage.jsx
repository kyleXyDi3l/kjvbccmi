import { AlertCircle, X } from "lucide-react";

export default function ErrorMessage({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-auto text-red-500 hover:text-red-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
