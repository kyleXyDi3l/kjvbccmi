export default function MemberFilters({
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  statusOptions,
}) {
  return (
    <div className="flex gap-2">
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
      >
        <option value="All">All Status</option>
        {statusOptions.map((status) => (
          <option key={status.id} value={status.id}>
            {status.status}
          </option>
        ))}
      </select>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
      >
        <option value="joinDate">Sort by: Join Date (Newest)</option>
        <option value="name">Sort by: Name (A-Z)</option>
        <option value="status">Sort by: Status</option>
      </select>
    </div>
  );
}
