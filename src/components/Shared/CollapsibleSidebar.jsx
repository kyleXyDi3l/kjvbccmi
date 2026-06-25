import React, { useState } from "react";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

// Pre-defined color schemes for each tab
const TAB_COLORS = {
  dashboard: {
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    hover: "hover:bg-blue-50",
    text: "text-blue-600",
    activeBg: "bg-blue-600",
    pulse: "bg-blue-400",
    shadow: "shadow-blue-200",
    ring: "ring-blue-400/30",
    light: "from-blue-500/10 to-blue-600/10",
  },
  analytics: {
    gradient: "from-purple-500 to-purple-600",
    bg: "bg-purple-50",
    hover: "hover:bg-purple-50",
    text: "text-purple-600",
    activeBg: "bg-purple-600",
    pulse: "bg-purple-400",
    shadow: "shadow-purple-200",
    ring: "ring-purple-400/30",
    light: "from-purple-500/10 to-purple-600/10",
  },
  orders: {
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    hover: "hover:bg-emerald-50",
    text: "text-emerald-600",
    activeBg: "bg-emerald-600",
    pulse: "bg-emerald-400",
    shadow: "shadow-emerald-200",
    ring: "ring-emerald-400/30",
    light: "from-emerald-500/10 to-emerald-600/10",
  },
  users: {
    gradient: "from-orange-500 to-orange-600",
    bg: "bg-orange-50",
    hover: "hover:bg-orange-50",
    text: "text-orange-600",
    activeBg: "bg-orange-600",
    pulse: "bg-orange-400",
    shadow: "shadow-orange-200",
    ring: "ring-orange-400/30",
    light: "from-orange-500/10 to-orange-600/10",
  },
  settings: {
    gradient: "from-slate-500 to-slate-600",
    bg: "bg-slate-50",
    hover: "hover:bg-slate-50",
    text: "text-slate-600",
    activeBg: "bg-slate-600",
    pulse: "bg-slate-400",
    shadow: "shadow-slate-200",
    ring: "ring-slate-400/30",
    light: "from-slate-500/10 to-slate-600/10",
  },
  profile: {
    gradient: "from-pink-500 to-pink-600",
    bg: "bg-pink-50",
    hover: "hover:bg-pink-50",
    text: "text-pink-600",
    activeBg: "bg-pink-600",
    pulse: "bg-pink-400",
    shadow: "shadow-pink-200",
    ring: "ring-pink-400/30",
    light: "from-pink-500/10 to-pink-600/10",
  },
  messages: {
    gradient: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-50",
    hover: "hover:bg-cyan-50",
    text: "text-cyan-600",
    activeBg: "bg-cyan-600",
    pulse: "bg-cyan-400",
    shadow: "shadow-cyan-200",
    ring: "ring-cyan-400/30",
    light: "from-cyan-500/10 to-cyan-600/10",
  },
  files: {
    gradient: "from-amber-500 to-amber-600",
    bg: "bg-amber-50",
    hover: "hover:bg-amber-50",
    text: "text-amber-600",
    activeBg: "bg-amber-600",
    pulse: "bg-amber-400",
    shadow: "shadow-amber-200",
    ring: "ring-amber-400/30",
    light: "from-amber-500/10 to-amber-600/10",
  },
  calendar: {
    gradient: "from-red-500 to-red-600",
    bg: "bg-red-50",
    hover: "hover:bg-red-50",
    text: "text-red-600",
    activeBg: "bg-red-600",
    pulse: "bg-red-400",
    shadow: "shadow-red-200",
    ring: "ring-red-400/30",
    light: "from-red-500/10 to-red-600/10",
  },
  tasks: {
    gradient: "from-teal-500 to-teal-600",
    bg: "bg-teal-50",
    hover: "hover:bg-teal-50",
    text: "text-teal-600",
    activeBg: "bg-teal-600",
    pulse: "bg-teal-400",
    shadow: "shadow-teal-200",
    ring: "ring-teal-400/30",
    light: "from-teal-500/10 to-teal-600/10",
  },
  notifications: {
    gradient: "from-rose-500 to-rose-600",
    bg: "bg-rose-50",
    hover: "hover:bg-rose-50",
    text: "text-rose-600",
    activeBg: "bg-rose-600",
    pulse: "bg-rose-400",
    shadow: "shadow-rose-200",
    ring: "ring-rose-400/30",
    light: "from-rose-500/10 to-rose-600/10",
  },
  help: {
    gradient: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50",
    hover: "hover:bg-indigo-50",
    text: "text-indigo-600",
    activeBg: "bg-indigo-600",
    pulse: "bg-indigo-400",
    shadow: "shadow-indigo-200",
    ring: "ring-indigo-400/30",
    light: "from-indigo-500/10 to-indigo-600/10",
  },
  sky: {
    gradient: "from-sky-600 to-sky-700",
    bg: "bg-sky-50",
    hover: "hover:bg-sky-50",
    text: "text-sky-600",
    activeBg: "bg-sky-600",
    pulse: "bg-sky-400",
    shadow: "shadow-sky-200",
    ring: "ring-sky-400/30",
    light: "from-sky-600/10 to-sky-700/10",
  },
  emerald: {
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    hover: "hover:bg-emerald-50",
    text: "text-emerald-600",
    activeBg: "bg-emerald-600",
    pulse: "bg-emerald-400",
    shadow: "shadow-emerald-200",
    ring: "ring-emerald-400/30",
    light: "from-emerald-500/10 to-emerald-600/10",
  },
  amber: {
    gradient: "from-amber-500 to-amber-600",
    bg: "bg-amber-50",
    hover: "hover:bg-amber-50",
    text: "text-amber-600",
    activeBg: "bg-amber-600",
    pulse: "bg-amber-400",
    shadow: "shadow-amber-200",
    ring: "ring-amber-400/30",
    light: "from-amber-500/10 to-amber-600/10",
  },
};

// Default color for items without specific color mapping
const DEFAULT_COLOR = {
  gradient: "from-indigo-500 to-indigo-600",
  bg: "bg-indigo-50",
  hover: "hover:bg-indigo-50",
  text: "text-indigo-600",
  activeBg: "bg-indigo-600",
  pulse: "bg-indigo-400",
  shadow: "shadow-indigo-200",
  ring: "ring-indigo-400/30",
  light: "from-indigo-500/10 to-indigo-600/10",
};

export default function CollapsibleSidebar({
  title = "Menu Console",
  collapsed = false,
  setCollapsed = () => {},
  activeItem,
  onSelect = () => {},
  items = [],
  footerTitle,
  footerText,
}) {
  const [hovered, setHovered] = useState(null);

  const getColorScheme = (itemId) => {
    return TAB_COLORS[itemId] || DEFAULT_COLOR;
  };

  return (
    <aside
      className={`relative lg:sticky top-16 self-start z-30 bg-white border-r border-slate-200/60 shadow-xl shadow-slate-200/20 transition-all duration-300 ease-in-out h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] overflow-x-hidden ${
        collapsed ? "w-[72px]" : "w-72"
      }`}
      aria-label="Primary"
    >
      <div className="flex flex-col h-full min-h-0">
        {/* Header - Modern Minimal */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-slate-100">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {collapsed ? (
              <button
                onClick={() => setCollapsed(!collapsed)}
                aria-label="Expand navigation"
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 mx-auto"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <>
                <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-600 text-white w-11 h-11 shrink-0 shadow-md shadow-indigo-200/50">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="opacity-90"
                  >
                    <path d="M12 2L19 8.5V21H5V8.5L12 2Z" fill="currentColor" />
                    <path
                      d="M12 2L19 8.5V21H5V8.5L12 2Z"
                      fill="currentColor"
                      fillOpacity="0.3"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-slate-800 truncate">
                    {title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Navigation
                  </p>
                </div>
              </>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Collapse navigation"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Menu Items - Clean & Spacious */}
        <nav
          className={`flex-1 py-5 px-3 min-h-0 ${
            collapsed ? "overflow-hidden" : "overflow-y-auto scrollbar-hide"
          }`}
        >
          <ul className="space-y-1.5">
            {items.map((item) => {
              const isActive = activeItem === item.id;
              const colors = getColorScheme(item.color);

              return (
                <li
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setHovered(item.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <button
                    onClick={() => onSelect(item.id)}
                    className={`group relative flex items-center gap-3 w-full text-left px-3 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${colors.gradient} text-white shadow-md ${colors.shadow}`
                        : `text-slate-600 hover:bg-slate-50`
                    }`}
                    aria-current={isActive ? "page" : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-white rounded-r-full shadow-sm" />
                    )}

                    <div
                      className={`relative flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-all duration-200 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : `text-slate-400 group-hover:text-slate-600`
                      }`}
                    >
                      <item.icon
                        className={`h-5 w-5 transition-all duration-200 ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-600"
                        }`}
                      />
                    </div>

                    {!collapsed && (
                      <>
                        <span
                          className={`flex-1 text-sm font-medium transition-opacity duration-200 ${
                            isActive ? "text-white" : "text-slate-700"
                          }`}
                        >
                          {item.label}
                        </span>

                        {item.badgeCount && (
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full transition-all duration-200 ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.badgeCount}
                          </span>
                        )}

                        {/* Animated pulse indicator for active tab */}
                        {isActive && (
                          <div className="absolute -right-1.5 top-1/2 transform -translate-y-1/2">
                            <div
                              className={`h-2.5 w-2.5 rounded-full ${colors.pulse} animate-ping`}
                            />
                            <div
                              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${colors.pulse}`}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </button>

                  {/* Tooltip for collapsed state - Modern */}
                  {collapsed && hovered === item.id && (
                    <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 animate-in fade-in slide-in-from-left-2 duration-150">
                      <div className="bg-slate-800 text-white text-xs font-medium rounded-lg px-3 py-2 shadow-xl border border-white/5">
                        {item.label}
                        {item.badgeCount && (
                          <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">
                            {item.badgeCount}
                          </span>
                        )}
                        <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-white/5" />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Refined */}
        <div className="px-4 py-5 border-t border-slate-100 bg-gradient-to-b from-transparent to-slate-50/50">
          <div
            className={`rounded-xl p-3.5 ${
              collapsed
                ? "text-center"
                : "bg-gradient-to-r from-slate-50 to-slate-100/50"
            }`}
          >
            {!collapsed ? (
              <>
                <div className="text-xs font-semibold text-slate-700">
                  {footerTitle}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {footerText}
                </div>
              </>
            ) : (
              <div className="text-[10px] font-medium text-slate-400">
                {footerTitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
