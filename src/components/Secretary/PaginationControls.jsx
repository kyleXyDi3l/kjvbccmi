import { ChevronLeft, ChevronRight, Users } from "lucide-react";

export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  searchTerm = "",
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = 1;
    let end = totalPages;

    if (totalPages > maxVisible) {
      if (currentPage <= 3) {
        end = maxVisible;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - maxVisible + 1;
      } else {
        start = currentPage - 2;
        end = currentPage + 2;
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Users className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <p className="text-xs text-slate-600 font-sans">
            Showing{" "}
            <span className="font-extrabold text-slate-900">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-extrabold text-slate-900">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{" "}
            of{" "}
            <span className="font-extrabold text-indigo-600">{totalItems}</span>{" "}
            {searchTerm && <span className="text-slate-400">(filtered)</span>}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-l-xl px-3 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="ml-1 text-xs font-medium hidden sm:inline">
              Previous
            </span>
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`relative inline-flex items-center justify-center min-w-[36px] px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                currentPage === page
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-105"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300"
              } cursor-pointer`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-r-xl px-3 py-2 text-slate-600 border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 focus:z-20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span className="mr-1 text-xs font-medium hidden sm:inline">
              Next
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
