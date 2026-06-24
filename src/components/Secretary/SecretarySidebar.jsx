import { useState } from "react";
import { Menu, Users, Calendar, NotebookPen } from "lucide-react";

const navigationItems = [
  { id: "registry", icon: Users, label: "Member Files" },
  { id: "scheduler", icon: Calendar, label: "Calendar Events" },
  { id: "meetingNotes", icon: NotebookPen, label: "Meeting Notes" },
];

export default function SecretarySidebar({
  activeTab,
  setActiveTab,
  churchName,
  sidebarCollapsed,
  setSidebarCollapsed,
}) {
  return (
    <div
      className={`${sidebarCollapsed ? "w-20" : "w-64"} shrink-0 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30 transition-all duration-300`}
    >
      <div className="flex-1 py-6 px-4">
        <div className="space-y-1">
          <div className="pb-3 mb-3 border-b border-slate-100 px-2 flex items-center justify-between">
            <span
              className={`text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider ${sidebarCollapsed ? "hidden" : "block"}`}
            >
              Menu Console
            </span>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-lg hover:bg-slate-100 transition"
            >
              <Menu className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group relative w-full flex items-center gap-3 px-4 py-3 text-xs font-extrabold rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon
                className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${activeTab === item.id ? "text-white" : "text-slate-400"}`}
              />
              <span
                className={`flex-1 text-left ${sidebarCollapsed ? "hidden" : "block"}`}
              >
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="absolute bottom-6 left-4 right-4">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-indigo-700">
                Clerk Access
              </span>
            </div>
            <p className="text-[9px] text-slate-500 leading-tight">
              Authorized to manage {churchName} members.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
