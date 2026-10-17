'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import {
  Shield,
  Workflow,
  ClipboardList,
  Package,
  Scissors,
  CheckCircle2,
  TrendingUp,
  FileText,
  Layers,
  Sparkles,
  Sliders,
  Users,
  Grid,
  FileCheck,
  RotateCcw,
  AlertTriangle,
  PlayCircle,
  BarChart3,
  Flame,
  Shirt,
  Box,
  KeyRound,
} from 'lucide-react';

export type MainViewType =
  // Universal or lookup views
  | 'role-workspace'
  | 'orders'
  | 'workflow'
  | 'worklist'
  | 'qc'
  | 'inventory'
  | 'audit'
  // Admin sub-views
  | 'admin-matrix'
  | 'admin-users'
  // Process Engineer sub-views
  | 'pe-designer'
  | 'pe-validator'
  | 'pe-qc-profiles'
  | 'pe-custom-review'
  // Production Planner sub-views
  | 'planner-pipeline'
  | 'planner-create'
  | 'planner-bom'
  // Warehouse Keeper sub-views
  | 'warehouse-allocation'
  // Station Operator sub-views
  | 'operator-terminal'
  | 'operator-cutting'
  | 'operator-sewing'
  | 'operator-wash'
  | 'operator-finishing'
  // QC Inspector sub-views
  | 'qc-dashboard'
  | 'qc-rework'
  // Manager sub-views
  | 'manager-wip'
  | 'manager-bottleneck'
  | 'manager-analytics';

interface SidebarProps {
  activeView: MainViewType;
  onViewChange: (view: MainViewType) => void;
  orderCount: number;
}

interface MenuItem {
  id: MainViewType;
  label: string;
  icon: any;
  badge?: number;
  highlight?: boolean;
}

interface RoleMenuConfig {
  roleTitle: string;
  roleIcon: any;
  rulesBadge: string;
  coreItems: MenuItem[];
  lookupItems: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  orderCount,
}) => {
  const { currentUser } = useAuth();
  const role: UserRole = currentUser?.role || 'PRODUCTION_PLANNER';

  const getRoleConfig = (): RoleMenuConfig => {
    switch (role) {
      case 'ADMIN':
        return {
          roleTitle: 'Quản Trị Hệ Thống',
          roleIcon: Shield,
          rulesBadge: 'BR-04, BR-16',
          coreItems: [
            { id: 'admin-matrix', label: 'Ma Trận Vải–Màu (BR-04)', icon: Grid, highlight: true },
            { id: 'admin-users', label: 'Tài Khoản & 7 Vai Trò', icon: Users },
            { id: 'audit', label: 'Nhật Ký Audit Log (BR-16)', icon: FileText },
          ],
          lookupItems: [
            { id: 'orders', label: 'Toàn Bộ Đơn Hàng', icon: ClipboardList, badge: orderCount },
            { id: 'workflow', label: 'Sơ Đồ Dynamic Workflow', icon: Workflow },
          ],
        };

      case 'PROCESS_ENGINEER':
        return {
          roleTitle: 'Kỹ Sư Quy Trình',
          roleIcon: Workflow,
          rulesBadge: 'BR-01, BR-02, BR-19',
          coreItems: [
            { id: 'pe-designer', label: 'Soạn Thảo 14 Công Đoạn', icon: Workflow, highlight: true },
            { id: 'pe-qc-profiles', label: 'Hồ Sơ Co Rút QC (BR-19)', icon: Sliders },
            { id: 'pe-custom-review', label: 'Thẩm Định Đơn Custom (BR-17)', icon: FileCheck },
          ],
          lookupItems: [
            { id: 'workflow', label: 'Xem Graph Workflow', icon: Layers },
            { id: 'orders', label: 'Đơn Hàng Áp Dụng', icon: ClipboardList, badge: orderCount },
          ],
        };

      case 'PRODUCTION_PLANNER':
        return {
          roleTitle: 'Kế Hoạch Sản Xuất',
          roleIcon: ClipboardList,
          rulesBadge: 'BR-03, BR-04, BR-18',
          coreItems: [
            { id: 'planner-pipeline', label: 'Tiến Độ & Pipeline Đơn', icon: ClipboardList, highlight: true },
            { id: 'planner-create', label: 'Lập Đơn Mới (Guard BR-04)', icon: Sparkles },
            { id: 'planner-bom', label: 'Bóc Tách Định Mức BOM', icon: Layers },
          ],
          lookupItems: [
            { id: 'orders', label: 'Tất Cả Đơn Gia Công', icon: Box, badge: orderCount },
            { id: 'workflow', label: 'Tham Chiếu 14 Công Đoạn', icon: Workflow },
          ],
        };

      case 'WAREHOUSE_KEEPER':
        return {
          roleTitle: 'Thủ Kho Vải & Vật Tư',
          roleIcon: Package,
          rulesBadge: 'BR-06, BR-12',
          coreItems: [
            { id: 'warehouse-allocation', label: 'Cấp Phát Vải Cắt (BR-06)', icon: Scissors, highlight: true },
            { id: 'inventory', label: 'Tồn Kho Lô Vải (FabricLot)', icon: Package },
          ],
          lookupItems: [
            { id: 'orders', label: 'Đơn Chờ Cấp Vật Tư', icon: ClipboardList, badge: orderCount },
          ],
        };

      case 'STATION_OPERATOR':
        return {
          roleTitle: 'Tổ Trưởng Công Đoạn',
          roleIcon: Scissors,
          rulesBadge: 'BR-14, BR-08, BR-15',
          coreItems: [
            { id: 'operator-terminal', label: 'Shopfloor Terminal 7 Trạm', icon: PlayCircle, highlight: true },
            { id: 'worklist', label: 'Hàng Đợi Bó Hàng (My Tasks)', icon: Scissors },
            { id: 'operator-cutting', label: 'Trạm Cắt (CUTTING)', icon: Scissors },
            { id: 'operator-sewing', label: 'Chuyền May (SEWING)', icon: Shirt },
            { id: 'operator-wash', label: 'Xưởng Wash & Giặt', icon: Flame },
            { id: 'operator-finishing', label: 'Hoàn Thiện & Đóng Gói', icon: Box },
          ],
          lookupItems: [
            { id: 'workflow', label: 'Tiêu Chuẩn Chốt BR-14', icon: Workflow },
          ],
        };

      case 'QC_INSPECTOR':
        return {
          roleTitle: 'Kiểm Định Chất Lượng',
          roleIcon: CheckCircle2,
          rulesBadge: 'BR-19, BR-10, BR-11',
          coreItems: [
            { id: 'qc-dashboard', label: 'Bàn Nghiệm Thu QC (AQL)', icon: CheckCircle2, highlight: true },
            { id: 'qc', label: 'Hàng Đợi Chờ Duyệt (Queue)', icon: FileCheck },
            { id: 'qc-rework', label: 'Điều Phối Sửa Hàng Rework', icon: RotateCcw },
          ],
          lookupItems: [
            { id: 'pe-qc-profiles', label: 'Ngưỡng Hồ Sơ QC (BR-19)', icon: Sliders },
            { id: 'orders', label: 'Tra Cứu Đơn & Bó Hàng', icon: ClipboardList, badge: orderCount },
          ],
        };

      case 'MANAGER':
        return {
          roleTitle: 'Giám Đốc Xưởng',
          roleIcon: TrendingUp,
          rulesBadge: 'BR-16 Realtime KPI',
          coreItems: [
            { id: 'manager-wip', label: 'Giám Sát WIP Realtime', icon: TrendingUp, highlight: true },
            { id: 'manager-bottleneck', label: 'Phát Hiện Điểm Nghẽn', icon: AlertTriangle },
            { id: 'manager-analytics', label: 'Năng Suất & Tỷ Lệ Lỗi', icon: BarChart3 },
          ],
          lookupItems: [
            { id: 'orders', label: 'Tiến Độ Đơn Toàn Xưởng', icon: ClipboardList, badge: orderCount },
            { id: 'audit', label: 'Nhật Ký Kiểm Toán BR-16', icon: FileText },
          ],
        };
    }
  };

  const config = getRoleConfig();
  const RoleIcon = config.roleIcon;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 text-slate-700 flex flex-col justify-between p-4 flex-shrink-0 min-h-[calc(100vh-65px)]">
      <div>
        {/* Role Identity Card */}
        <div className="p-3 bg-gradient-to-br from-slate-50 to-denim-50/60 rounded-2xl border border-slate-200/90 mb-4 shadow-2xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
            <RoleIcon className="w-4 h-4 text-denim-600 flex-shrink-0" />
            <span className="truncate">{config.roleTitle}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/80">
            <span className="text-slate-500 font-medium">Quy tắc phụ trách:</span>
            <span className="font-mono font-bold text-denim-700 bg-white px-2 py-0.5 rounded-md border border-denim-200/60 text-[10px]">
              {config.rulesBadge}
            </span>
          </div>
        </div>

        {/* Section 1: Core Functions for this Role */}
        <div className="space-y-1">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-1.5 flex items-center justify-between">
            <span>Chức Năng Vai Trò</span>
            <span className="w-1.5 h-1.5 rounded-full bg-denim-600"></span>
          </div>

          <nav className="space-y-1">
            {config.coreItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-denim-600 text-white shadow-sm shadow-denim-600/20'
                      : item.highlight
                      ? 'bg-denim-50/60 text-denim-800 hover:bg-denim-100/80 border border-denim-100/80 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-white' : item.highlight ? 'text-denim-600' : 'text-slate-400'
                      }`}
                    />
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

        {/* Section 2: Lookups & Reference Permitted for this Role */}
        {config.lookupItems.length > 0 && (
          <div className="mt-5 space-y-1">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
              Tra Cứu & Liên Quan
            </div>

            <nav className="space-y-1">
              {config.lookupItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-denim-600 text-white shadow-sm shadow-denim-600/20'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
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
        )}
      </div>

      {/* Bottom Info Card */}
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-xs space-y-1.5">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800">
          <Layers className="w-3.5 h-3.5 text-denim-600" />
          <span>DenimFlow BO v2.0</span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          Phân quyền 7 vai trò chuẩn BR-11 (Separation of Duties).
        </p>
      </div>
    </aside>
  );
};
