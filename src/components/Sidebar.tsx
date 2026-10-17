'use client';

import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  GitFork,
  Scissors,
  CheckCircle2,
  Package,
  FileText,
  Workflow,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'orders'
  | 'workflow'
  | 'worklist'
  | 'qc'
  | 'inventory'
  | 'audit';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  orderCount: number;
  readyTaskCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  orderCount,
  readyTaskCount,
}) => {
  const menuItems = [
    { id: 'dashboard' as TabType, label: 'Tổng Quan WIP', icon: LayoutDashboard },
    { id: 'orders' as TabType, label: 'Đơn Hàng (Orders)', icon: ClipboardList, badge: orderCount },
    { id: 'workflow' as TabType, label: 'Dynamic Workflow', icon: Workflow },
    { id: 'worklist' as TabType, label: 'Trạm Gia Công', icon: Scissors, badge: readyTaskCount },
    { id: 'qc' as TabType, label: 'Kiểm Định QC', icon: CheckCircle2 },
    { id: 'inventory' as TabType, label: 'Kho Vải & Vật Tư', icon: Package },
    { id: 'audit' as TabType, label: 'Nhật Ký Audit Log', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 flex-shrink-0 min-h-[calc(100vh-65px)]">
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
          Phân Hệ Quản Trị
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-denim-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white text-denim-700' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-xs text-slate-400 space-y-1.5">
        <div className="font-semibold text-slate-200">19 Business Rules & 5 Patterns</div>
        <p className="leading-relaxed">
          Động hóa 14 công đoạn, kiểm soát ma trận Vải-Màu (BR-04), Gatekeeper (BR-14), và 2 QC Profile (BR-19).
        </p>
      </div>
    </aside>
  );
};
