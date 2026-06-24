import { X } from "lucide-react";

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  event,
  setEvent,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {event?.id ? "Edit Event" : "Schedule Event"}
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
              Event Title *
            </label>
            <input
              type="text"
              required
              value={event?.title || ""}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Description
            </label>
            <textarea
              value={event?.description || ""}
              onChange={(e) =>
                setEvent({ ...event, description: e.target.value })
              }
              rows="3"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Date *
              </label>
              <input
                type="date"
                required
                value={event?.date || ""}
                onChange={(e) => setEvent({ ...event, date: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Time
              </label>
              <input
                type="time"
                value={event?.time || ""}
                onChange={(e) => setEvent({ ...event, time: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">
              Ministry Type
            </label>
            <select
              value={event?.ministryType || "General"}
              onChange={(e) =>
                setEvent({ ...event, ministryType: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
            >
              <option value="General">General</option>
              <option value="Youth">Youth</option>
              <option value="Worship">Worship</option>
              <option value="Outreach">Outreach</option>
            </select>
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
              className="flex-1 py-2 bg-sky-600 text-white rounded-lg text-sm font-semibold"
            >
              {loading ? "Saving..." : "Schedule Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
