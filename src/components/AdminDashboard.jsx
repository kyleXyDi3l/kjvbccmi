import React, { useState, useMemo } from "react";

import {
  Users,
  Shield,
  Key,
  Search,
  UserCheck,
  UserMinus,
  UserPlus,
  MapPin,
  CheckCircle,
  Database,
  Edit3,
  Trash2,
  Filter,
  AlertCircle,
  Save,
  Plus,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6" id="admin-system-dashboard">
      {/* Super Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-indigo-900/40 border border-indigo-700/80 text-indigo-200 px-3 py-0.5 rounded-full font-bold uppercase tracking-wider mb-2">
            <Shield className="h-3 w-3 text-indigo-400" />
            System Administrator Super-Console
          </span>
          <h1 className="text-2xl font-sans font-bold tracking-tight">
            System User & DB Directory Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Add or purge database records, modify permission tags, and manage
            active ministries, congregations, or clerical parameters.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5">
          <Database className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="font-mono text-left">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">
              Active Database Session
            </span>
            <span className="text-xs font-bold text-slate-100 uppercase"></span>
          </div>
        </div>
      </div>

      {/* Numerical Metrics Row */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        id="admin-stats-row"
      >
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider">
            Total Database Users
          </div>
          <div className="text-2xl font-bold font-sans text-slate-900 mt-1">
            14
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            14 Active accounts
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider">
            Admins & Pastoral Officers
          </div>
          <div className="text-2xl font-bold font-sans text-indigo-700 mt-1">
            20
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            (4 Super-Admins, 0 Pastors)
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider">
            Extension Secretaries
          </div>
          <div className="text-2xl font-bold font-sans text-sky-600 mt-1">
            6
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Validating membership files
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-400 font-mono text-[10px] font-bold uppercase tracking-wider">
            Church Treasurers
          </div>
          <div className="text-2xl font-bold font-sans text-emerald-600 mt-1">
            2
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Accounting & tithing registries
          </div>
        </div>
      </div>
      {/* Main Core Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Directory Table Selection */}
        <div
          className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs lg:col-span-2 flex flex-col justify-between"
          id="rbac-accounts-table-box"
        >
          <div>
            {/* Filtering Actions Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                  <h3 className="text-sm font-sans font-bold text-slate-800 uppercase tracking-tight">
                    Active User Registry
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Perform direct CRUD operations, modify database records or
                    purge identities.
                  </p>
                </div>

                {/* Search & Add trigger */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full sm:w-48 md:w-56">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name, phone, email..."
                      //value={searchTerm}
                      //onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                  <button
                    // onClick={() => {
                    //   setRightTab('add');
                    //   setEditingMember(null);
                    // }}
                    className="inline-flex items-center gap-1 bg-slate-900 text-white font-semibold text-xs py-2 px-3.5 rounded-lg hover:bg-slate-800 transition duration-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create New User
                  </button>
                </div>
              </div>

              {/* Filters line */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-1">
                  <Filter className="h-3 w-3 text-slate-400" />
                  <span className="text-[10px] font-medium text-slate-600 uppercase">
                    Role filter:
                  </span>
                  <select
                    // value={roleFilter}
                    // onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="text-[11px] bg-white border border-slate-300 rounded px-2 py-0.5 text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Roles</option>
                    <option value="Admin">Admin</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Member">Member</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400" />
                  <span className="text-[10px] font-medium text-slate-600 uppercase">
                    Campus:
                  </span>
                  <select
                    // value={extensionFilter}
                    // onChange={(e) => setExtensionFilter(e.target.value as any)}
                    className="text-[11px] bg-white border border-slate-300 rounded px-2 py-0.5 text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Campuses</option>
                    <option value="Global">Global Central</option>
                    <option value="Naga">Naga Branch</option>
                    <option value="Aloguinsan">Aloguinsan Branch</option>
                    <option value="Samar">Samar Branch</option>
                    <option value="Dulag">Dulag Branch</option>
                    <option value="Pinamungajan">Pinamungajan Branch</option>
                    <option value="Mandaue">Mandaue Branch</option>
                  </select>
                </div>

                <span className="text-[10px] font-mono font-bold text-slate-400 ml-auto bg-slate-200/60 px-2 py-0.5 rounded">
                  20 Registered Records
                </span>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left" id="admin-rbac-table">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-medium uppercase font-mono tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="px-4 py-3">Full Identity & Contacts</th>
                    <th className="px-4 py-3">System Role</th>
                    <th className="px-4 py-3">Extension Assignment</th>
                    <th className="px-4 py-3">Membership Status</th>
                    <th className="px-4 py-3 text-right">
                      Administrative Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs font-sans text-slate-700">
                  {/* {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-xs text-slate-400 italic">
                        No registered database columns correspondent to filtering attributes.
                      </td>
                    </tr>
                  ) : ( */}
                  {/* filteredMembers.map((m) => {
                      const userRole = m.role || 'Member';
                      const isSelf = m.email === 'admin@church.org' || m.email === 'josephkylediel@gmail.com'; */}
                  {/* return ( */}
                  <tr
                    //key={m.id}
                    className={`hover:bg-slate-50/80 transition-colors  bg-indigo-50/40 font-medium `}
                    // id={`account-row-${m.id}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">kyle Diel</div>
                      <div className="text-[10px] text-slate-550 truncate max-w-[200px]">
                        jk@yahoo.com
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">
                        123-456-7890
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Shield className="h-2.5 w-2.5" />
                        Admin
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                        Pina
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="inline-block w-2 w-2 h-2 rounded-full mr-1.5" />
                      <span className="text-[11px] font-medium text-slate-600">
                        status
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          //onClick={() => handleSelectMemberForEdit(m)}
                          className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-2.5 py-1.5 rounded transition"
                          //id={`edit-perm-btn-${m.id}`}
                        >
                          Edit Profile
                        </button>

                        {/* {isSelf ? ( */}
                        <span className="text-[9px] text-slate-400 italic bg-slate-50 border px-1.5 py-1 rounded">
                          Locked
                        </span>
                        {/* ) : deletingId === m.id ? ( */}
                        <div
                          className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded"
                          //id={`confirm-del-box-${m.id}`}
                        >
                          <button
                            //   onClick={() =>
                            //     handleDeleteUser(
                            //       m.id,
                            //       `${m.firstName} ${m.lastName}`,
                            //     )
                            //   }
                            className="text-[9px] bg-rose-600 text-white font-bold px-2 py-1 rounded hover:bg-rose-700 transition"
                            //id={`confirm-purged-${m.id}`}
                          >
                            Purge
                          </button>
                          <button
                            //onClick={() => setDeletingId(null)}
                            className="text-[9px] bg-slate-200 text-slate-700 px-2 py-1 rounded hover:bg-slate-300 transition"
                          >
                            Cancel
                          </button>
                        </div>
                        {/* ) : ( */}
                        <button
                          //onClick={() => setDeletingId(m.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition duration-100"
                          //id={`delete-user-btn-${m.id}`}
                          title="Purge Identity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {/* )} */}
                      </div>
                    </td>
                  </tr>
                  {/* ); */}
                  {/* })
                  )} */}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 font-sans italic flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />
            <span>
              Administrative modifications dynamically persist across offline
              local cache and online Google Cloud Firestores simultaneously.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
