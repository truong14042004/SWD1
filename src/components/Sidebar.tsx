'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Scissors,
  CheckCircle2,
  Package,
  FileText,
  Workflow,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export type MainViewType =
  | 'role-workspace'
  | 'orders'
  | 'workflow'
  | 'worklist'
  | 'qc'
  | 'inventory'
  | 'audit';

interface SidebarProps {
  activeView: MainViewType;
  onViewChange: (view: MainViewType) => void;
  orderCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  orderCount,
}) => {
  const { currentUser } = useAuth();

  const getRoleWorkspaceTitle = () => {
    switch (currentUser?.role) {
      case 'ADMIN':
        return 'Admin Hub (Hệ Thống)';
      case 'PROCESS_ENGINEER':
        return 'Bàn Thiết Kế Quy Trình';
      case 'PRODUCTION_PLANNER':
        return 'Kế Hoạch & Tiến Độ Đơn';
      case 'WAREHOUSE_KEEPER':
        return 'Quản Lý Kho Vải & BOM';
      case 'STATION_OPERATOR':
        return 'Trạm Sản Xuất (Shopfloor)';
      case 'QC_INSPECTOR':
        return 'Bàn Kiểm Định QC';
      case 'MANAGER':
        return 'Báo Cáo Điều Hành KPI';
      default:
        return 'Không Gian Làm Việc';
    }
  };

  const menuItems = [
    { id: 'role-workspace' as MainViewType, label: getRoleWorkspaceTitle(), icon: Sparkles, highlight: true },
    { id: 'orders' as MainViewType, label: 'Tất Cả Đơn Hàng', icon: ClipboardList, badge: orderCount },
    { id: 'workflow' as MainViewType, label: 'Dynamic Workflow Graph', icon: Workflow },
    { id: 'worklist' as MainViewType, label: 'Trạm Gia Công (Worklist)', icon: Scissors },
    { id: 'qc' as MainViewType, label: 'Kiểm Định QC & AQL', icon: CheckCircle2 },
    { id: 'inventory' as MainViewType, label: 'Kho Vải & Lô (FabricLot)', icon: Package },
    { id: 'audit' as MainViewType, label: 'Nhật Ký Audit Log (BR-16)', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 text-slate-700 flex flex-col justify-between p-4 flex-shrink-0 min-h-[calc(100vh-65px)]">
      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2.5">
          Phân Hệ Chức Năng
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-denim-600 text-white shadow-sm shadow-denim-600/20'
                    : item.highlight
                    ? 'bg-gradient-to-r from-denim-50 to-indigo-50 text-denim-800 hover:from-denim-100 hover:to-indigo-100 border border-denim-100 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-denim-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      isActive ? 'bg-white text-denim-700' : 'bg-slate-100 text-slate-600'
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

      {/* Bottom Info Card */}
      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 text-xs space-y-1.5">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800">
          <Layers className="w-3.5 h-3.5 text-denim-600" />
          <span>DenimFlow BO v2.0</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          19 Quy tắc nghiệp vụ (BR-01 $\to$ BR-19), 5 Design Patterns (State, Chain, Strategy, Factory, Observer).
        </p>
      </div>
    </aside>
  );
};
