import { Search } from "lucide-react";

export default function MemberSearchBar({
  searchTerm,
  setSearchTerm,
  resultCount = 0,
}) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search by name, email, ID, or phone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-slate-50 hover:bg-white transition"
      />
      {searchTerm && (
        <div className="mt-2 text-xs text-slate-500">
          Found {resultCount} result{resultCount !== 1 ? "s" : ""} for "
          {searchTerm}"
        </div>
      )}
    </div>
  );
}
