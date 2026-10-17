'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  Layers,
  Database,
  User,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { AuthModal } from './auth/AuthModal';

const ROLE_LABELS: Record<UserRole, { label: string; badge: string }> = {
  ADMIN: { label: 'Admin (Hệ Thống)', badge: 'bg-slate-100 text-slate-800 border-slate-200' },
  PROCESS_ENGINEER: { label: 'Process Engineer (Quy Trình)', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  PRODUCTION_PLANNER: { label: 'Planner (Kế Hoạch)', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  WAREHOUSE_KEEPER: { label: 'Warehouse (Thủ Kho)', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  STATION_OPERATOR: { label: 'Operator (Tổ Trưởng Trạm)', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  QC_INSPECTOR: { label: 'QC Inspector (Kiểm Định)', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  MANAGER: { label: 'Manager (Giám Đốc)', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
};

export const Header: React.FC = () => {
  const { currentUser, isAuthenticated, logout, switchRole } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const roleMeta = currentUser ? ROLE_LABELS[currentUser.role] : null;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & System Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-denim-600 to-indigo-700 text-white rounded-xl flex items-center justify-center shadow-md shadow-denim-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-slate-900 tracking-tight">DenimFlow BO</span>
                <span className="text-[10px] bg-denim-50 text-denim-700 font-bold px-2 py-0.5 rounded-full border border-denim-200">
                  v2.0 Dynamic Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Hệ Thống Gia Công May Quần Jean Theo Đơn (CMT)</p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Live Database Status */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>PostgreSQL Live</span>
            </div>

            {/* Quick Role Switcher Dropdown */}
            {isAuthenticated && (
              <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
                <span className="text-slate-400 font-medium px-2 hidden lg:inline">Chuyển vai trò:</span>
                <select
                  value={currentUser?.role}
                  onChange={(e) => switchRole(e.target.value as UserRole)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800 text-xs shadow-2xs focus:ring-2 focus:ring-denim-500 cursor-pointer"
                >
                  <option value="PRODUCTION_PLANNER">Planner (Kế Hoạch)</option>
                  <option value="PROCESS_ENGINEER">Process Engineer (Quy Trình)</option>
                  <option value="STATION_OPERATOR">Operator (Tổ Trưởng Trạm)</option>
                  <option value="QC_INSPECTOR">QC Inspector (Kiểm Định)</option>
                  <option value="WAREHOUSE_KEEPER">Warehouse (Thủ Kho)</option>
                  <option value="MANAGER">Manager (Giám Đốc Xưởng)</option>
                  <option value="ADMIN">Admin (Quản Trị Hệ Thống)</option>
                </select>
              </div>
            )}

            {/* Auth Profile or Login/Register buttons */}
            {isAuthenticated && currentUser ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-denim-100 text-denim-800 font-bold flex items-center justify-center text-xs border border-denim-200">
                  {currentUser.fullName.slice(0, 1)}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <div className="font-bold text-slate-900 leading-tight">{currentUser.fullName}</div>
                  <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{currentUser.email}</div>
                </div>

                <button
                  onClick={logout}
                  title="Đăng xuất"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-denim-600 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng Nhập</span>
                </button>
                <button
                  onClick={() => {
                    setAuthModalTab('register');
                    setShowAuthModal(true);
                  }}
                  className="text-xs font-bold bg-denim-600 hover:bg-denim-700 text-white px-3 py-1.5 rounded-xl shadow-xs transition flex items-center space-x-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Đăng Ký</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};
