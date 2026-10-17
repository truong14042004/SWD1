'use client';

import React from 'react';
import { UserRole } from '@/types';
import { ShieldCheck, Database, UserCheck, Layers } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const ROLES: { role: UserRole; label: string; badge: string }[] = [
  { role: 'PRODUCTION_PLANNER', label: 'Planner (Kế Hoạch)', badge: 'bg-blue-100 text-blue-800' },
  { role: 'PROCESS_ENGINEER', label: 'Process Engineer (Quy Trình)', badge: 'bg-purple-100 text-purple-800' },
  { role: 'STATION_OPERATOR', label: 'Operator (Tổ Trưởng Trạm)', badge: 'bg-amber-100 text-amber-800' },
  { role: 'QC_INSPECTOR', label: 'QC Inspector (Kiểm Định)', badge: 'bg-rose-100 text-rose-800' },
  { role: 'WAREHOUSE_KEEPER', label: 'Warehouse (Thủ Kho)', badge: 'bg-emerald-100 text-emerald-800' },
  { role: 'MANAGER', label: 'Manager (Giám Đốc)', badge: 'bg-indigo-100 text-indigo-800' },
  { role: 'ADMIN', label: 'Admin (Hệ Thống)', badge: 'bg-slate-100 text-slate-800' },
];

export const Header: React.FC<HeaderProps> = ({ currentRole, onRoleChange }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 flex flex-wrap items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="bg-denim-600 text-white p-2 rounded-lg flex items-center justify-center shadow-md">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">DenimFlow BO</h1>
            <span className="text-xs bg-denim-50 text-denim-700 font-semibold px-2 py-0.5 rounded border border-denim-200">
              v2.0 Dynamic Workflow
            </span>
          </div>
          <p className="text-xs text-slate-500">Back Office Quản Lý Gia Công Quần Jean</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 mt-2 sm:mt-0">
        {/* DB Connection Indicator */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL Active</span>
        </div>

        {/* Dynamic RBAC Switcher */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5">
          <UserCheck className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-600 hidden md:inline">Vai trò:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="text-xs font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:ring-2 focus:ring-denim-500 cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r.role} value={r.role}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
