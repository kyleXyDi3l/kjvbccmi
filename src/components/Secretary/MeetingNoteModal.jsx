import { X } from "lucide-react";

export default function MeetingNoteModal({
  isOpen,
  onClose,
  onSave,
  note,
  setNote,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {note?.id ? "Edit Meeting Note" : "Add Meeting Note"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSave} className="p-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={note?.title || ""}
              onChange={(e) => setNote({ ...note, title: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Date</label>
            <input
              type="date"
              value={note?.date || ""}
              onChange={(e) => setNote({ ...note, date: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Attendees
            </label>
            <input
              type="text"
              value={note?.attendees || ""}
              onChange={(e) => setNote({ ...note, attendees: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              placeholder="Names"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Summary
            </label>
            <textarea
              value={note?.summary || ""}
              onChange={(e) => setNote({ ...note, summary: e.target.value })}
              rows="4"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Action Items
            </label>
            <textarea
              value={note?.actionItems || ""}
              onChange={(e) =>
                setNote({ ...note, actionItems: e.target.value })
              }
              rows="3"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold"
            >
              {loading ? "Saving..." : "Save Meeting Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
