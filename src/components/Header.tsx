'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Layers, LogOut, LogIn, UserCheck } from 'lucide-react';

const ROLE_BADGES: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
  ADMIN: { label: 'Quản Trị Nhà Máy', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
  PROCESS_ENGINEER: { label: 'Kỹ Sư Quy Trình', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  PRODUCTION_PLANNER: { label: 'Kế Hoạch Sản Xuất', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  WAREHOUSE_KEEPER: { label: 'Thủ Kho Vải', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  STATION_OPERATOR: { label: 'Tổ Trưởng Công Đoạn', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  QC_INSPECTOR: { label: 'Kiểm Định QC', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  MANAGER: { label: 'Giám Đốc Xưởng', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
};

interface HeaderProps {
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuthModal }) => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const roleMeta = currentUser ? ROLE_BADGES[currentUser.role] : null;

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 bg-gradient-to-br from-denim-600 via-denim-700 to-indigo-800 text-white rounded-xl flex items-center justify-center shadow-md shadow-denim-600/15">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black text-slate-900 tracking-tight">DenimFlow</span>
              <span className="text-[10px] bg-denim-50 text-denim-700 font-extrabold px-2.5 py-0.5 rounded-full border border-denim-200 tracking-wide uppercase">
                Quy Trình Chuẩn
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Hệ Thống Quản Lý Gia Công Quần Jean</p>
          </div>
        </div>

        {/* Right Section: Authenticated User Profile & Logout */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center space-x-3">
              {/* Role Badge */}
              {roleMeta && (
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${roleMeta.bg} ${roleMeta.text} ${roleMeta.border} shadow-2xs hidden sm:inline-block`}
                >
                  {roleMeta.label}
                </span>
              )}

              {/* User Avatar & Name */}
              <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-denim-100 to-indigo-100 text-denim-900 font-black flex items-center justify-center text-xs border border-denim-200/80 shadow-2xs">
                  {currentUser.fullName.slice(0, 1)}
                </div>
                <div className="text-left text-xs hidden md:block">
                  <div className="font-bold text-slate-900 leading-snug">{currentUser.fullName}</div>
                  <div className="text-[11px] text-slate-400 font-mono font-medium truncate max-w-[140px]">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all shadow-2xs ml-1"
                title="Đăng xuất khỏi tài khoản"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng Xuất</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 px-4 py-2 bg-denim-600 hover:bg-denim-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập Hệ Thống</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
