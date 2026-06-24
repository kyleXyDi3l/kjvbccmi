export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mx-auto mb-3" />
        <p className="text-slate-500 text-sm">{message}</p>
      </div>
    </div>
  );
}
