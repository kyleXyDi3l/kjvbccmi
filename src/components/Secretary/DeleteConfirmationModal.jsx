import { X, ShieldAlert, Trash2, AlertCircle } from "lucide-react";

export default function DeleteConfirmationModal({
  isOpen,
  member,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
        <div className="relative bg-gradient-to-r from-rose-600 to-red-600 px-6 py-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Delete Member</h2>
                <p className="text-xs text-white/80">
                  This action cannot be undone
                </p>
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

        <div className="p-6 space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center animate-pulse">
              <Trash2 className="h-8 w-8 text-rose-600" />
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-bold text-slate-900">
              Are you sure you want to delete this member?
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              This action will permanently remove all data associated with this
              member.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              {member.profilePic ? (
                <img
                  src={member.profilePic}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                  {member.firstName?.[0]}
                  {member.lastName?.[0]}
                </div>
              )}
              <div className="flex-1">
                <p className="font-bold text-slate-800">
                  {member.firstName} {member.lastName}
                </p>
                <p className="text-xs text-slate-500">{member.emailAdd}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-slate-400 font-mono">
                    ID: {member.id}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      member.statusId === 9
                        ? "bg-sky-100 text-sky-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {member.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-semibold text-amber-700">
                What will be deleted:
              </p>
            </div>
            <ul className="text-xs text-amber-700 space-y-1 pl-6 list-disc">
              <li>Member profile and personal information</li>
              {member.formPdfUrl && <li>Uploaded application form (PDF)</li>}
              {member.signature_url && <li>Member signature image</li>}
              <li>All associated records and data</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
